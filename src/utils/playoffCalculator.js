/**
 * playoffCalculator.js — Fase Final del Torneo Oficial Promocional 2026.
 *
 * Estructura (reglamento ASB):
 *   1°–4°  clasifican directo a Cuartos.
 *   5°–12° juegan PLAY IN: 5v12, 6v11, 7v10, 8v9 — series al mejor de 3 (1-1-1).
 *          Los 4 ganadores entran a la Fase Campeonato como 5° a 8°.
 *          Los 4 perdedores juegan el Reposicionamiento 9°–12° (round robin).
 *   CUARTOS   1v8, 2v7, 3v6, 4v5 — al mejor de 3 (1-1-1).
 *   SEMIS     reordenamiento: 1v4, 2v3 — al mejor de 3 (1-1-1).
 *   FINAL     1v2 — al mejor de 3 (1-1-1). Tercer puesto a un juego.
 *   5°–8°     los 4 perdedores de Cuartos, a un juego: 5v8 y 6v7, luego 5°/6° y 7°/8°.
 *
 * En toda serie 1-1-1 el mejor sembrado es local en los juegos 1 y 3.
 */

import { PLAYOFF_DATES } from "../data/playoffs.js";

/* ── Helpers básicos ──────────────────────────────────────────────── */

const isPlayed = (r) =>
    !!r &&
    r.homeScore !== null && r.homeScore !== undefined &&
    r.awayScore !== null && r.awayScore !== undefined;

/** Un competidor: { team, seed } donde seed es la posición de la fase regular. */
const slot = (team, seed) => (team ? { team, seed } : null);

const byRegSeed = (a, b) => a.seed - b.seed;

/* ── Partido único ────────────────────────────────────────────────── */

function singleGame({ id, stage, label, a, b, date, results, labelA, labelB }) {
    const result = results[id] ?? null;
    // Un resultado huérfano (por ejemplo, guardado y luego borrado aguas arriba)
    // no debe contar hasta que ambos equipos estén definidos.
    const ready = !!(a && b);
    const played = ready && isPlayed(result);
    const homeWon = played && Number(result.homeScore) > Number(result.awayScore);

    return {
        id,
        stage,
        label,
        kind: "game",
        date,
        home: a?.team ?? null,
        homeSeed: a?.seed ?? null,
        away: b?.team ?? null,
        awaySeed: b?.seed ?? null,
        labelA: labelA ?? "A definir",
        labelB: labelB ?? "A definir",
        result,
        played,
        ready,
        winner: played ? (homeWon ? a.team : b.team) : null,
        winnerSlot: played ? (homeWon ? a : b) : null,
        loser: played ? (homeWon ? b.team : a.team) : null,
        loserSlot: played ? (homeWon ? b : a) : null,
    };
}

/* ── Serie al mejor de 3, formato 1-1-1 ───────────────────────────── */

function series({ id, stage, label, a, b, dates, results, labelA, labelB }) {
    // Juego 1 y 3 en casa del mejor sembrado (a); juego 2 en casa de b.
    const layout = [
        { num: 1, host: a, guest: b },
        { num: 2, host: b, guest: a },
        { num: 3, host: a, guest: b },
    ];

    // Mientras falte definir alguno de los dos, un resultado guardado con ese
    // id se ignora: puede ser un remanente de una ronda que se recalculó.
    const ready = !!(a && b);

    let winsA = 0;
    let winsB = 0;

    const games = layout.map(({ num, host, guest }) => {
        const gameId = `${id}g${num}`;
        const result = results[gameId] ?? null;
        const played = ready && isPlayed(result);
        const hostWon = played && Number(result.homeScore) > Number(result.awayScore);

        // El local del juego 2 es `b`, así que hay que mapear a/b y no local/visitante.
        if (played) {
            const winnerIsA = num === 2 ? !hostWon : hostWon;
            if (winnerIsA) winsA++;
            else winsB++;
        }

        return {
            id: gameId,
            num,
            date: dates[num - 1],
            home: host?.team ?? null,
            homeSeed: host?.seed ?? null,
            away: guest?.team ?? null,
            awaySeed: guest?.seed ?? null,
            result,
            played,
            winner: played ? (hostWon ? host.team : guest.team) : null,
        };
    });

    const over = winsA >= 2 || winsB >= 2;
    const winnerSlot = winsA >= 2 ? a : winsB >= 2 ? b : null;
    const loserSlot = winsA >= 2 ? b : winsB >= 2 ? a : null;
    const decidedInTwo = (winsA >= 2 || winsB >= 2) && winsA + winsB === 2;

    // El juego 3 solo se juega si la serie va 1-1.
    games[2].skipped = decidedInTwo;
    games[2].needed = winsA === 1 && winsB === 1;

    return {
        id,
        stage,
        label,
        kind: "series",
        a,
        b,
        teamA: a?.team ?? null,
        seedA: a?.seed ?? null,
        teamB: b?.team ?? null,
        seedB: b?.seed ?? null,
        labelA: labelA ?? "A definir",
        labelB: labelB ?? "A definir",
        ready,
        games,
        winsA,
        winsB,
        over,
        winnerSlot,
        loserSlot,
        winner: winnerSlot?.team ?? null,
        loser: loserSlot?.team ?? null,
        // Progreso visible: cuántos juegos se jugaron sobre los que hacen falta
        gamesPlayed: winsA + winsB,
    };
}

/* ── Tabla del reposicionamiento (round robin de 4) ───────────────── */

function repoStandings(slots, matches) {
    const stats = {};
    slots.forEach((s) => {
        if (!s) return;
        stats[s.team] = {
            team: s.team,
            seed: s.seed,
            played: 0,
            won: 0,
            lost: 0,
            pointsFor: 0,
            pointsAgainst: 0,
            pointsDiff: 0,
            points: 0,
        };
    });

    matches.forEach((m) => {
        if (!m.played || !m.home || !m.away) return;
        const hs = Number(m.result.homeScore);
        const as = Number(m.result.awayScore);
        const home = stats[m.home];
        const away = stats[m.away];
        if (!home || !away) return;

        home.played++;
        away.played++;
        home.pointsFor += hs;
        home.pointsAgainst += as;
        away.pointsFor += as;
        away.pointsAgainst += hs;

        if (hs > as) {
            home.won++; home.points += 2;
            away.lost++; away.points += 1;
        } else {
            away.won++; away.points += 2;
            home.lost++; home.points += 1;
        }
    });

    return Object.values(stats)
        .map((e) => ({ ...e, pointsDiff: e.pointsFor - e.pointsAgainst }))
        .sort(
            (a, b) =>
                b.points - a.points ||
                b.won - a.won ||
                b.pointsDiff - a.pointsDiff ||
                b.pointsFor - a.pointsFor ||
                a.seed - b.seed
        );
}

/* ── Cálculo completo ─────────────────────────────────────────────── */

/**
 * @param {Array}  top12   standings.slice(0, 12), en orden de posición
 * @param {Object} results { [matchId]: { homeScore, awayScore } }
 */
export function computeBracket(top12 = [], results = {}) {
    const seedOf = (pos) => slot(top12[pos - 1]?.team ?? null, pos);

    /* ─── PLAY IN ─────────────────────────────────────────────────── */
    const playInPairs = [
        [5, 12],
        [6, 11],
        [7, 10],
        [8, 9],
    ];

    const playIn = playInPairs.map(([high, low], i) =>
        series({
            id: `pi${i + 1}`,
            stage: "playIn",
            label: `${high}° vs ${low}°`,
            a: seedOf(high),
            b: seedOf(low),
            dates: PLAYOFF_DATES.playIn,
            results,
            labelA: `${high}° de la fase regular`,
            labelB: `${low}° de la fase regular`,
        })
    );

    const playInWinners = playIn.map((s) => s.winnerSlot).filter(Boolean).sort(byRegSeed);
    const playInLosers = playIn.map((s) => s.loserSlot).filter(Boolean).sort(byRegSeed);
    const playInComplete = playIn.every((s) => s.over);

    /* ─── Sembrado de la Fase Campeonato (1 a 8) ──────────────────── */
    // 1° a 4° entran directo; los 4 ganadores del Play In ocupan 5° a 8°
    // ordenados por su posición en la fase regular.
    const champSeeds = [1, 2, 3, 4].map((p) => {
        const s = seedOf(p);
        return s ? { ...s, champSeed: p, regSeed: p, viaPlayIn: false } : null;
    });

    playInWinners.forEach((s, i) => {
        champSeeds[4 + i] = { ...s, champSeed: 5 + i, regSeed: s.seed, viaPlayIn: true };
    });

    // Dentro de la Fase Campeonato el sembrado que manda es champSeed (1-8).
    const cs = (n) => {
        const s = champSeeds[n - 1];
        return s ? { team: s.team, seed: s.champSeed, regSeed: s.regSeed, viaPlayIn: s.viaPlayIn } : null;
    };

    /* ─── CUARTOS: 1v8, 2v7, 3v6, 4v5 ─────────────────────────────── */
    const qfPairs = [
        [1, 8],
        [2, 7],
        [3, 6],
        [4, 5],
    ];

    const quarterFinals = qfPairs.map(([high, low], i) =>
        series({
            id: `qf${i + 1}`,
            stage: "quarters",
            label: `${high}° vs ${low}°`,
            a: cs(high),
            b: cs(low),
            dates: PLAYOFF_DATES.quarters,
            results,
            labelA: `${high}° clasificado`,
            labelB: low <= 4 ? `${low}° clasificado` : `Gan. Play In (${low}°)`,
        })
    );

    const qfWinners = quarterFinals.map((s) => s.winnerSlot).filter(Boolean).sort(byRegSeed);
    const qfLosers = quarterFinals.map((s) => s.loserSlot).filter(Boolean).sort(byRegSeed);
    const qfComplete = quarterFinals.every((s) => s.over);

    /* ─── SEMIS 1°–4°: reordenamiento 1v4, 2v3 ────────────────────── */
    const sfSlot = (i) => (qfComplete ? qfWinners[i] ?? null : null);

    const semiFinals = [
        { id: "sf1", pair: [0, 3], label: "1° vs 4°" },
        { id: "sf2", pair: [1, 2], label: "2° vs 3°" },
    ].map(({ id, pair, label }) =>
        series({
            id,
            stage: "semis",
            label,
            a: sfSlot(pair[0]),
            b: sfSlot(pair[1]),
            dates: PLAYOFF_DATES.semis,
            results,
            labelA: `${pair[0] + 1}° de cuartos`,
            labelB: `${pair[1] + 1}° de cuartos`,
        })
    );

    /* ─── FINAL + tercer puesto ───────────────────────────────────── */
    const sfComplete = semiFinals.every((s) => s.over);
    const finalists = sfComplete
        ? semiFinals.map((s) => s.winnerSlot).sort(byRegSeed)
        : [null, null];

    const final = series({
        id: "f",
        stage: "final",
        label: "Gran Final",
        a: finalists[0],
        b: finalists[1],
        dates: PLAYOFF_DATES.final,
        results,
        labelA: "Ganador Semifinal 1",
        labelB: "Ganador Semifinal 2",
    });

    const thirdPlaceSlots = sfComplete
        ? semiFinals.map((s) => s.loserSlot).sort(byRegSeed)
        : [null, null];

    const p34 = singleGame({
        id: "p34",
        stage: "final",
        label: "Tercer puesto",
        a: thirdPlaceSlots[0],
        b: thirdPlaceSlots[1],
        date: PLAYOFF_DATES.place34,
        results,
        labelA: "Perdedor Semifinal 1",
        labelB: "Perdedor Semifinal 2",
    });

    /* ─── Cruce 5°–8° (a un juego) ────────────────────────────────── */
    const l = (i) => (qfComplete ? qfLosers[i] ?? null : null);

    const g58a = singleGame({
        id: "g58a",
        stage: "bracket58",
        label: "5° vs 8°",
        a: l(0),
        b: l(3),
        date: PLAYOFF_DATES.semis58,
        results,
        labelA: "Mejor perdedor de cuartos",
        labelB: "4° perdedor de cuartos",
    });

    const g58b = singleGame({
        id: "g58b",
        stage: "bracket58",
        label: "6° vs 7°",
        a: l(1),
        b: l(2),
        date: PLAYOFF_DATES.semis58,
        results,
        labelA: "2° perdedor de cuartos",
        labelB: "3° perdedor de cuartos",
    });

    const p56Slots = [g58a.winnerSlot, g58b.winnerSlot];
    const p78Slots = [g58a.loserSlot, g58b.loserSlot];

    const p56 = singleGame({
        id: "p56",
        stage: "bracket58",
        label: "Quinto puesto",
        a: p56Slots[0],
        b: p56Slots[1],
        date: PLAYOFF_DATES.place56,
        results,
        labelA: "Ganador 5° vs 8°",
        labelB: "Ganador 6° vs 7°",
    });

    const p78 = singleGame({
        id: "p78",
        stage: "bracket58",
        label: "Séptimo puesto",
        a: p78Slots[0],
        b: p78Slots[1],
        date: PLAYOFF_DATES.place78,
        results,
        labelA: "Perdedor 5° vs 8°",
        labelB: "Perdedor 6° vs 7°",
    });

    /* ─── Reposicionamiento 9°–12° ────────────────────────────────── */
    // Los 4 perdedores del Play In, reordenados 9° a 12° por su posición regular.
    const repoSlots = playInComplete
        ? playInLosers.map((s, i) => ({ team: s.team, seed: 9 + i, regSeed: s.seed }))
        : [null, null, null, null];

    const rp = (n) => repoSlots[n - 9] ?? null;

    const repoMatches = [
        { id: "repo1a", round: 1, pair: [9, 10] },
        { id: "repo1b", round: 1, pair: [11, 12] },
        { id: "repo2a", round: 2, pair: [10, 11] },
        { id: "repo2b", round: 2, pair: [12, 9] },
        { id: "repo3a", round: 3, pair: [9, 11] },
        { id: "repo3b", round: 3, pair: [10, 12] },
    ].map(({ id, round, pair }) => ({
        round,
        ...singleGame({
            id,
            stage: "repo",
            label: `${pair[0]}° vs ${pair[1]}°`,
            a: rp(pair[0]),
            b: rp(pair[1]),
            date: PLAYOFF_DATES.repo[round - 1],
            results,
            labelA: `${pair[0]}° del Play In`,
            labelB: `${pair[1]}° del Play In`,
        }),
    }));

    const repoTable = repoStandings(repoSlots, repoMatches);

    /* ─── Posiciones finales ──────────────────────────────────────── */
    const finalPositions = [
        final.winner,
        final.loser,
        p34.winner,
        p34.loser,
        p56.winner,
        p56.loser,
        p78.winner,
        p78.loser,
        ...[0, 1, 2, 3].map((i) =>
            repoTable.length === 4 && repoTable.every((t) => t.played === 3)
                ? repoTable[i].team
                : null
        ),
    ];

    return {
        playIn,
        playInWinners,
        playInLosers,
        playInComplete,
        champSeeds: champSeeds.filter(Boolean),
        quarterFinals,
        qfComplete,
        semiFinals,
        sfComplete,
        final,
        p34,
        bracket58: { a: g58a, b: g58b, p56, p78 },
        repo: { slots: repoSlots.filter(Boolean), matches: repoMatches, table: repoTable },
        champion: final.winner,
        finalPositions,
    };
}

/** Etapa más avanzada que ya tiene equipos definidos, o null si no arrancó. */
export function activeStage(bracket) {
    if (!bracket) return null;
    if (bracket.final.ready) return "final";
    if (bracket.semiFinals.some((s) => s.ready)) return "semis";
    if (bracket.quarterFinals.some((s) => s.ready)) return "quarters";
    if (bracket.playIn.some((s) => s.ready)) return "playIn";
    return null;
}

/** Todos los partidos cargables del bracket, agrupados por etapa (para el admin). */
export function bracketSections(bracket) {
    return [
        {
            key: "playIn",
            title: "Play In",
            subtitle: "5°v12° · 6°v11° · 7°v10° · 8°v9° — al mejor de 3",
            series: bracket.playIn,
            games: [],
        },
        {
            key: "quarters",
            title: "Cuartos de Final",
            subtitle: "1°v8° · 2°v7° · 3°v6° · 4°v5° — al mejor de 3",
            series: bracket.quarterFinals,
            games: [],
        },
        {
            key: "semis",
            title: "Semifinales",
            subtitle: "1°v4° · 2°v3° — al mejor de 3",
            series: bracket.semiFinals,
            games: [],
        },
        {
            key: "final",
            title: "Final y Tercer Puesto",
            subtitle: "Final al mejor de 3 · 3° puesto a un juego",
            series: [bracket.final],
            games: [bracket.p34],
        },
        {
            key: "bracket58",
            title: "Puestos 5° a 8°",
            subtitle: "Todos a un juego",
            series: [],
            games: [
                bracket.bracket58.a,
                bracket.bracket58.b,
                bracket.bracket58.p56,
                bracket.bracket58.p78,
            ],
        },
        {
            key: "repo",
            title: "Reposicionamiento 9° a 12°",
            subtitle: "Round robin de 3 jornadas entre los perdedores del Play In",
            series: [],
            games: bracket.repo.matches,
        },
    ];
}
