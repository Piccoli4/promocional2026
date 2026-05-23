/**
 * playoffCalculator.js
 * Calcula el estado completo del bracket de playoffs.
 *
 * Estructura:
 * ─ CUARTOS (1 partido):           1vs8, 4vs5, 2vs7, 3vs6
 * ─ SEMIFINALES 1°–4° (IDA/VUELTA/TERCERO): S1vsS4, S2vsS3
 * ─ SEMIFINALES 5°–8° (1 partido): L4vsL1, L3vsL2
 * ─ POSICIONES:                    7°y8°, 5°y6°, 3°y4°, FINAL (IDA/VUELTA/TERCERO)
 * ─ REPOSICIONAMIENTO (round-robin 4 equipos, 3 jornadas): 9°–12°
 */

function gameWinner(result, homeTeam, awayTeam) {
    if (!result || homeTeam === null || awayTeam === null) return null;
    return Number(result.homeScore) > Number(result.awayScore) ? homeTeam : awayTeam;
}

function gameLoser(result, homeTeam, awayTeam) {
    if (!result || homeTeam === null || awayTeam === null) return null;
    return Number(result.homeScore) > Number(result.awayScore) ? awayTeam : homeTeam;
}

function gameWinnerSeed(result, homeSeed, awaySeed) {
    if (!result) return null;
    return Number(result.homeScore) > Number(result.awayScore) ? homeSeed : awaySeed;
}

function gameLoserSeed(result, homeSeed, awaySeed) {
    if (!result) return null;
    return Number(result.homeScore) > Number(result.awayScore) ? awaySeed : homeSeed;
}

/**
 * Calcula el estado de una serie IDA/VUELTA/TERCERO (mejor de 3 por partidos ganados).
 * teamA siempre tiene localía en IDA y TERCERO.
 * En VUELTA, teamB es local → homeScore = teamB.
 */
function seriesState(teamA, seedA, teamB, seedB, g1, g2, g3) {
    let winsA = 0, winsB = 0;

    // IDA: teamA local → homeScore = teamA
    if (g1 && teamA && teamB) {
        Number(g1.homeScore) > Number(g1.awayScore) ? winsA++ : winsB++;
    }
    // VUELTA: teamB local → homeScore = teamB
    if (g2 && teamA && teamB) {
        Number(g2.homeScore) > Number(g2.awayScore) ? winsB++ : winsA++;
    }
    // TERCERO: teamA local → homeScore = teamA
    if (g3 && teamA && teamB) {
        Number(g3.homeScore) > Number(g3.awayScore) ? winsA++ : winsB++;
    }

    const seriesWinner = winsA >= 2 ? teamA : (winsB >= 2 ? teamB : null);
    const seriesWinnerSeed = seriesWinner === teamA ? seedA : (seriesWinner ? seedB : null);
    const seriesLoser = seriesWinner ? (seriesWinner === teamA ? teamB : teamA) : null;
    const needsG3 = winsA === 1 && winsB === 1 && !g3;
    const seriesOver = winsA >= 2 || winsB >= 2;

    return { winsA, winsB, seriesWinner, seriesWinnerSeed, seriesLoser, needsG3, seriesOver };
}

/**
 * Calcula standings del reposicionamiento (round-robin 9°–12°).
 */
function computeRepoStandings(teams, matches) {
    const stats = {};
    teams.forEach((t) => {
        if (t?.team) stats[t.team] = { team: t.team, pj: 0, w: 0, l: 0, gf: 0, gc: 0 };
    });

    matches.forEach((m) => {
        if (!m.result || !m.home || !m.away) return;
        const hs = Number(m.result.homeScore);
        const as_ = Number(m.result.awayScore);
        if (stats[m.home]) {
            stats[m.home].pj++;
            stats[m.home].gf += hs;
            stats[m.home].gc += as_;
            if (hs > as_) stats[m.home].w++;
            else stats[m.home].l++;
        }
        if (stats[m.away]) {
            stats[m.away].pj++;
            stats[m.away].gf += as_;
            stats[m.away].gc += hs;
            if (as_ > hs) stats[m.away].w++;
            else stats[m.away].l++;
        }
    });

    return Object.values(stats).sort((a, b) => {
        const wDiff = b.w - a.w;
        if (wDiff !== 0) return wDiff;
        return (b.gf - b.gc) - (a.gf - a.gc);
    });
}

/**
 * Computa el bracket completo a partir de las primeras 12 posiciones y
 * los resultados de playoffs guardados en Firestore.
 *
 * @param {Array}  top12Teams    - standings.slice(0, 12) — en orden de posición
 * @param {Object} playoffResults - { [matchId]: { homeScore, awayScore } }
 */
export function computeBracket(top12Teams, playoffResults) {
    const r = (id) => playoffResults[id] || null;
    const t = (i) => top12Teams[i]?.team ?? null;

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
        const loser = gameLoser(result, qf.home, qf.away);
        const loserSeed = gameLoserSeed(result, qf.homeSeed, qf.awaySeed);
        return { ...qf, result, winner, winnerSeed, loser, loserSeed };
    });

    // ─── Semifinales 1°–4° (IDA/VUELTA/TERCERO) ─────────────────────────
    // SF1 = S1 (gan. qf1: 1°vs8°) vs S4 (gan. qf2: 4°vs5°)
    // SF2 = S2 (gan. qf3: 2°vs7°) vs S3 (gan. qf4: 3°vs6°)
    const sfDefs = [
        { id: "sf1", qfA: quarterFinals[0], qfB: quarterFinals[1] }, // S1 vs S4
        { id: "sf2", qfA: quarterFinals[2], qfB: quarterFinals[3] }, // S2 vs S3
    ];

    const semiFinals = sfDefs.map(({ id, qfA, qfB }) => {
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
            teamA = qfA.winner ?? null; seedA = qfA.winnerSeed;
            teamB = qfB.winner ?? null; seedB = qfB.winnerSeed;
        }

        const g1 = r(`${id}g1`), g2 = r(`${id}g2`), g3 = r(`${id}g3`);
        const state = seriesState(teamA, seedA, teamB, seedB, g1, g2, g3);

        return {
            id, teamA, seedA, teamB, seedB,
            g1, g2, g3,
            ...state,
            labelA: `Gan. ${qfA.homeSeed}° vs ${qfA.awaySeed}°`,
            labelB: `Gan. ${qfB.homeSeed}° vs ${qfB.awaySeed}°`,
        };
    });

    // ─── Bracket 5°–8° (partidos únicos) ─────────────────────────────────
    // sf58a: L4 (per. qf2: 4°vs5°) vs L1 (per. qf1: 1°vs8°)
    // sf58b: L3 (per. qf4: 3°vs6°) vs L2 (per. qf3: 2°vs7°)
    const sf58aResult = r("sf58a");
    const sf58aHome = quarterFinals[1].loser;
    const sf58aAway = quarterFinals[0].loser;
    const sf58a = {
        id: "sf58a", label: "Semi 5°–8° (A)",
        home: sf58aHome, homeSeed: quarterFinals[1].loserSeed,
        away: sf58aAway, awaySeed: quarterFinals[0].loserSeed,
        result: sf58aResult,
        winner: gameWinner(sf58aResult, sf58aHome, sf58aAway),
        loser: gameLoser(sf58aResult, sf58aHome, sf58aAway),
    };

    const sf58bResult = r("sf58b");
    const sf58bHome = quarterFinals[3].loser;
    const sf58bAway = quarterFinals[2].loser;
    const sf58b = {
        id: "sf58b", label: "Semi 5°–8° (B)",
        home: sf58bHome, homeSeed: quarterFinals[3].loserSeed,
        away: sf58bAway, awaySeed: quarterFinals[2].loserSeed,
        result: sf58bResult,
        winner: gameWinner(sf58bResult, sf58bHome, sf58bAway),
        loser: gameLoser(sf58bResult, sf58bHome, sf58bAway),
    };

    // 7° y 8°: perdedores de sf58
    const p78Result = r("p78");
    const p78 = {
        id: "p78", label: "7° y 8°",
        home: sf58a.loser, away: sf58b.loser,
        result: p78Result,
        winner: gameWinner(p78Result, sf58a.loser, sf58b.loser),
    };

    // 5° y 6°: ganadores de sf58
    const p56Result = r("p56");
    const p56 = {
        id: "p56", label: "5° y 6°",
        home: sf58a.winner, away: sf58b.winner,
        result: p56Result,
        winner: gameWinner(p56Result, sf58a.winner, sf58b.winner),
    };

    // ─── 3° y 4° ─────────────────────────────────────────────────────────
    const p34Result = r("p34");
    const p34 = {
        id: "p34", label: "3° y 4°",
        home: semiFinals[0].seriesLoser, away: semiFinals[1].seriesLoser,
        result: p34Result,
        winner: gameWinner(p34Result, semiFinals[0].seriesLoser, semiFinals[1].seriesLoser),
    };

    // ─── Gran Final (IDA/VUELTA/TERCERO) ─────────────────────────────────
    let fTeamA, fSeedA, fTeamB, fSeedB;
    const bothSFsKnown = semiFinals[0].seriesWinnerSeed !== null && semiFinals[1].seriesWinnerSeed !== null;

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

    // ─── Reposicionamiento 9°–12° (round-robin, 3 jornadas) ──────────────
    const repoTeams = top12Teams.slice(8, 12);
    const repoMatches = [
        // Jornada 1 (31-may)
        { id: "repo_r1_1", home: t(8),  homeSeed: 9,  away: t(9),  awaySeed: 10, round: 1, roundLabel: "31 may" },
        { id: "repo_r1_2", home: t(10), homeSeed: 11, away: t(11), awaySeed: 12, round: 1, roundLabel: "31 may" },
        // Jornada 2 (7-jun)
        { id: "repo_r2_1", home: t(9),  homeSeed: 10, away: t(10), awaySeed: 11, round: 2, roundLabel: "7 jun" },
        { id: "repo_r2_2", home: t(11), homeSeed: 12, away: t(8),  awaySeed: 9,  round: 2, roundLabel: "7 jun" },
        // Jornada 3 (14-jun)
        { id: "repo_r3_1", home: t(8),  homeSeed: 9,  away: t(10), awaySeed: 11, round: 3, roundLabel: "14 jun" },
        { id: "repo_r3_2", home: t(9),  homeSeed: 10, away: t(11), awaySeed: 12, round: 3, roundLabel: "14 jun" },
    ].map((m) => {
        const result = r(m.id);
        const winner = gameWinner(result, m.home, m.away);
        return { ...m, result, winner };
    });

    const repoStandings = computeRepoStandings(repoTeams, repoMatches);

    return {
        quarterFinals,
        semiFinals,
        final,
        sf58a,
        sf58b,
        p56,
        p78,
        p34,
        repoMatches,
        repoStandings,
    };
}