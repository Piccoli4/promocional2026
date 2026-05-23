/**
 * playoffCalculator.js
 * Calcula el estado completo del bracket de playoffs.
 *
 * Reglas:
 * - Cuartos: 1 partido (1vs8, 4vs5, 2vs7, 3vs6). Local = mejor ubicado.
 * - Semis y Final: mejor de 3. Local en G1 y G3 = mejor ubicado en tabla.
 * - Los resultados no afectan la tabla de fase regular.
 */

// Devuelve el ganador de un partido individual
function gameWinner(result, homeTeam, awayTeam) {
    if (!result || homeTeam === null || awayTeam === null) return null;
    return Number(result.homeScore) > Number(result.awayScore) ? homeTeam : awayTeam;
}

// Devuelve la seed del ganador de un partido
function gameWinnerSeed(result, homeSeed, awaySeed) {
    if (!result) return null;
    return Number(result.homeScore) > Number(result.awayScore) ? homeSeed : awaySeed;
}

/**
 * Calcula el estado de una serie al mejor de 3.
 * teamA siempre tiene localía (G1 en cancha de A, G2 en cancha de B, G3 en cancha de A).
 * En Firestore, para G2: homeScore es el puntaje de teamB (ellos son locales en G2).
 */
function seriesState(teamA, seedA, teamB, seedB, g1, g2, g3) {
    let winsA = 0, winsB = 0;

    // G1: teamA es local → homeScore = teamA
    if (g1 && teamA && teamB) {
        Number(g1.homeScore) > Number(g1.awayScore) ? winsA++ : winsB++;
    }
    // G2: teamB es local → homeScore = teamB, awayScore = teamA
    if (g2 && teamA && teamB) {
        Number(g2.homeScore) > Number(g2.awayScore) ? winsB++ : winsA++;
    }
    // G3: teamA es local → homeScore = teamA
    if (g3 && teamA && teamB) {
        Number(g3.homeScore) > Number(g3.awayScore) ? winsA++ : winsB++;
    }

    const seriesWinner = winsA >= 2 ? teamA : (winsB >= 2 ? teamB : null);
    const seriesWinnerSeed = seriesWinner === teamA ? seedA : (seriesWinner ? seedB : null);
    const needsG3 = winsA === 1 && winsB === 1 && !g3;
    const seriesOver = winsA >= 2 || winsB >= 2;

    return { winsA, winsB, seriesWinner, seriesWinnerSeed, needsG3, seriesOver };
}

/**
 * Computa el bracket completo a partir de las primeras 8 posiciones y
 * los resultados de playoffs guardados en Firestore.
 *
 * @param {Array}  top8Teams     - standings.slice(0, 8) — en orden de posición
 * @param {Object} playoffResults - { [matchId]: { homeScore, awayScore } }
 * @returns {Object} bracket con quarterFinals, semiFinals y final
 */
export function computeBracket(top8Teams, playoffResults) {
    const r = (id) => playoffResults[id] || null;
    const t = (i) => top8Teams[i]?.team ?? null;

    // ─── Cuartos de Final ────────────────────────────────────────────────
    const rawQFs = [
        { id: "qf1", home: t(0), homeSeed: 1, away: t(7), awaySeed: 8 },
        { id: "qf2", home: t(3), homeSeed: 4, away: t(4), awaySeed: 5 },
        { id: "qf3", home: t(1), homeSeed: 2, away: t(6), awaySeed: 7 },
        { id: "qf4", home: t(2), homeSeed: 3, away: t(5), awaySeed: 6 },
    ];

    const quarterFinals = rawQFs.map((qf) => {
        const result = r(qf.id);
        const winner = gameWinner(result, qf.home, qf.away);
        const winnerSeed = gameWinnerSeed(result, qf.homeSeed, qf.awaySeed);
        return { ...qf, result, winner, winnerSeed };
    });

    // ─── Semifinales ─────────────────────────────────────────────────────
    // Llave IZQUIERDA: SF1 = gan(1vs8) vs gan(3vs6)
    // Llave DERECHA:   SF2 = gan(2vs7) vs gan(4vs5)
    //
    // quarterFinals index:  0=qf1(1vs8)  1=qf2(4vs5)  2=qf3(2vs7)  3=qf4(3vs6)
    const sfDefs = [
        { id: "sf1", qfA: quarterFinals[0], qfB: quarterFinals[3] }, // 1vs8 + 3vs6
        { id: "sf2", qfA: quarterFinals[2], qfB: quarterFinals[1] }, // 2vs7 + 4vs5
    ];

    const semiFinals = sfDefs.map(({ id, qfA, qfB }) => {
        // Quien tiene mejor seed (número menor) es teamA → localía en G1 y G3
        let teamA, seedA, teamB, seedB;

        const bothKnown = qfA.winnerSeed !== null && qfB.winnerSeed !== null;

        if (bothKnown) {
            if (qfA.winnerSeed <= qfB.winnerSeed) {
                teamA = qfA.winner; seedA = qfA.winnerSeed;
                teamB = qfB.winner; seedB = qfB.winnerSeed;
            } else {
                teamA = qfB.winner; seedA = qfB.winnerSeed;
                teamB = qfA.winner; seedB = qfA.winnerSeed;
            }
        } else {
            // Aún no sabemos todos los cruces → asignamos provisionalmente
            teamA = qfA.winner ?? null; seedA = qfA.winnerSeed;
            teamB = qfB.winner ?? null; seedB = qfB.winnerSeed;
        }

        const g1 = r(`${id}g1`), g2 = r(`${id}g2`), g3 = r(`${id}g3`);
        const state = seriesState(teamA, seedA, teamB, seedB, g1, g2, g3);

        return {
            id, teamA, seedA, teamB, seedB,
            g1, g2, g3,
            ...state,
            // Labels para cuando los equipos aún no están definidos
            labelA: `Gan. ${qfA.homeSeed}° Vs ${qfA.awaySeed}°`,
            labelB: `Gan. ${qfB.homeSeed}° Vs ${qfB.awaySeed}°`,
        };
    });

    // ─── Final ───────────────────────────────────────────────────────────
    let fTeamA, fSeedA, fTeamB, fSeedB;

    const bothSFsKnown = semiFinals[0].seriesWinnerSeed !== null &&
                         semiFinals[1].seriesWinnerSeed !== null;

    if (bothSFsKnown) {
        if (semiFinals[0].seriesWinnerSeed <= semiFinals[1].seriesWinnerSeed) {
            fTeamA = semiFinals[0].seriesWinner; fSeedA = semiFinals[0].seriesWinnerSeed;
            fTeamB = semiFinals[1].seriesWinner; fSeedB = semiFinals[1].seriesWinnerSeed;
        } else {
            fTeamA = semiFinals[1].seriesWinner; fSeedA = semiFinals[1].seriesWinnerSeed;
            fTeamB = semiFinals[0].seriesWinner; fSeedB = semiFinals[0].seriesWinnerSeed;
        }
    } else {
        fTeamA = semiFinals[0].seriesWinner ?? null; fSeedA = semiFinals[0].seriesWinnerSeed;
        fTeamB = semiFinals[1].seriesWinner ?? null; fSeedB = semiFinals[1].seriesWinnerSeed;
    }

    const fg1 = r("fg1"), fg2 = r("fg2"), fg3 = r("fg3");
    const finalState = seriesState(fTeamA, fSeedA, fTeamB, fSeedB, fg1, fg2, fg3);

    const final = {
        id: "final",
        teamA: fTeamA, seedA: fSeedA,
        teamB: fTeamB, seedB: fSeedB,
        g1: fg1, g2: fg2, g3: fg3,
        ...finalState,
        labelA: "Gan. Semifinal 1",
        labelB: "Gan. Semifinal 2",
    };

    return { quarterFinals, semiFinals, final };
}