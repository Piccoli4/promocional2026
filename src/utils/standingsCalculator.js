import { TEAMS } from "../data/fixture.js";

/**
 * Tabla de posiciones — Sistema Olímpico (ANEXO I del reglamento):
 *   Partido ganado: 2 puntos · perdido: 1 punto · perdido por default: 0 (20-0 en contra).
 *
 * Criterios de desempate FIBA, en cadena:
 *   1. Enfrentamientos directos entre los empatados (tabla reducida).
 *   2. Diferencia de puntos considerando todos los partidos.
 *   3. Mayor cantidad de puntos a favor.
 */

/** Sanciones de puntos por equipo (se restan al total). */
export const TEAM_SANCTIONS = {};

const WIN_POINTS = 2;
const LOSS_POINTS = 1;
const WALKOVER_POINTS = 0;

const emptyEntry = (team, sanctions) => ({
    team,
    played: 0,
    won: 0,
    lost: 0,
    pointsFor: 0,
    pointsAgainst: 0,
    pointsDiff: 0,
    points: 0,
    sanction: sanctions[team] ?? 0,
    walkovers: 0,
});

const hasScores = (r) =>
    !!r &&
    r.homeScore !== null && r.homeScore !== undefined &&
    r.awayScore !== null && r.awayScore !== undefined;

/** Aplana el fixture a la lista de partidos efectivamente jugados. */
function playedMatches(results, fixture) {
    const list = [];
    fixture.forEach((round) => {
        round.matches.forEach((match) => {
            const result = results[match.id];
            if (!hasScores(result)) return;
            list.push({
                home: match.home,
                away: match.away,
                homeScore: Number(result.homeScore),
                awayScore: Number(result.awayScore),
                // "home" | "away": el equipo que no se presentó
                walkover: result.walkover ?? null,
            });
        });
    });
    return list;
}

/**
 * Suma los partidos de `matches` en una tabla acotada a `teams`.
 *
 * Las sanciones se anotan en cada entrada pero no se descuentan acá: la resta
 * ocurre en `calculateStandings`. Por eso la tabla reducida de desempates la
 * llama sin sanciones — un descuento de puntos no debe alterar quién ganó el
 * enfrentamiento directo.
 */
function tabulate(teams, matches, sanctions = {}) {
    const table = {};
    teams.forEach((t) => {
        table[t] = emptyEntry(t, sanctions);
    });

    matches.forEach((m) => {
        const home = table[m.home];
        const away = table[m.away];
        if (!home || !away) return;

        home.played++;
        away.played++;
        home.pointsFor += m.homeScore;
        home.pointsAgainst += m.awayScore;
        away.pointsFor += m.awayScore;
        away.pointsAgainst += m.homeScore;

        const homeWon = m.homeScore > m.awayScore;
        const winner = homeWon ? home : away;
        const loser = homeWon ? away : home;

        winner.won++;
        winner.points += WIN_POINTS;
        loser.lost++;
        loser.points += m.walkover ? WALKOVER_POINTS : LOSS_POINTS;
        if (m.walkover) loser.walkovers++;
    });

    Object.values(table).forEach((e) => {
        e.pointsDiff = e.pointsFor - e.pointsAgainst;
    });

    return table;
}

/** Compara dos entradas por diferencia general y luego puntos a favor. */
const byOverall = (a, b) => b.pointsDiff - a.pointsDiff || b.pointsFor - a.pointsFor;

/**
 * Ordena un grupo de equipos empatados en puntos.
 * Aplica la tabla reducida de enfrentamientos directos y, si persiste el
 * empate, los criterios generales sobre todos los partidos de la fase.
 */
function breakTie(group, allMatches) {
    if (group.length < 2) return group;

    const names = group.map((e) => e.team);
    const between = allMatches.filter(
        (m) => names.includes(m.home) && names.includes(m.away)
    );

    // Sin partidos entre ellos: se resuelve directamente por criterios generales.
    if (between.length === 0) return [...group].sort(byOverall);

    const mini = tabulate(names, between);

    const sorted = [...group].sort((a, b) => {
        const ma = mini[a.team];
        const mb = mini[b.team];
        return (
            mb.points - ma.points ||
            mb.pointsDiff - ma.pointsDiff ||
            mb.pointsFor - ma.pointsFor
        );
    });

    // Subgrupos que la tabla reducida no logró separar.
    const stillTied = (a, b) => {
        const ma = mini[a.team];
        const mb = mini[b.team];
        return (
            ma.points === mb.points &&
            ma.pointsDiff === mb.pointsDiff &&
            ma.pointsFor === mb.pointsFor
        );
    };

    const out = [];
    let i = 0;
    while (i < sorted.length) {
        let j = i + 1;
        while (j < sorted.length && stillTied(sorted[i], sorted[j])) j++;
        const sub = sorted.slice(i, j);

        if (sub.length === 1) {
            out.push(sub[0]);
        } else if (sub.length === group.length) {
            // La tabla reducida no aportó nada: criterios generales.
            out.push(...[...sub].sort(byOverall));
        } else {
            // Subgrupo más chico: se vuelve a aplicar la cadena desde el inicio.
            out.push(...breakTie(sub, allMatches));
        }
        i = j;
    }

    return out;
}

/**
 * @param {Object} results   { [matchId]: { homeScore, awayScore, walkover } }
 * @param {Array}  fixture   fechas con sus partidos
 * @param {Object} [sanctions] descuentos por equipo; por defecto los del torneo.
 *                             Se puede inyectar para probar el mecanismo aunque
 *                             la temporada en curso no tenga sanciones.
 */
export function calculateStandings(results = {}, fixture = [], sanctions = TEAM_SANCTIONS) {
    const matches = playedMatches(results, fixture);
    const table = tabulate(TEAMS, matches, sanctions);

    const standings = Object.values(table).map((entry) => ({
        ...entry,
        points: entry.points - entry.sanction,
    }));

    // Primer orden por puntos; los empates se resuelven por la cadena FIBA.
    standings.sort((a, b) => b.points - a.points);

    const final = [];
    let i = 0;
    while (i < standings.length) {
        let j = i + 1;
        while (j < standings.length && standings[j].points === standings[i].points) j++;
        final.push(...breakTie(standings.slice(i, j), matches));
        i = j;
    }

    return final.map((entry, index) => ({ ...entry, position: index + 1 }));
}
