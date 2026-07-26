/**
 * Pruebas de la tabla de posiciones y los desempates FIBA.
 * Uso: node scripts/dev/test-standings.mjs
 */
import { calculateStandings } from "../../src/utils/standingsCalculator.js";
import { FIXTURE, TEAMS } from "../../src/data/fixture.js";

let ok = true;
const check = (label, actual, expected) => {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    if (!pass) ok = false;
    console.log(`${pass ? "✓" : "✗"} ${label}${pass ? "" : `\n    esperado ${JSON.stringify(expected)}\n    obtuve   ${JSON.stringify(actual)}`}`);
};

/** Busca el id del partido entre dos equipos (en cualquier orden). */
const idOf = (a, b) => {
    for (const r of FIXTURE) {
        for (const m of r.matches) {
            if ((m.home === a && m.away === b) || (m.home === b && m.away === a)) {
                return { id: m.id, home: m.home, away: m.away };
            }
        }
    }
    throw new Error(`No hay partido entre ${a} y ${b}`);
};

/** Carga un resultado indicando el ganador y el marcador desde su lado. */
const win = (results, winner, loser, forPts, againstPts, walkover = null) => {
    const m = idOf(winner, loser);
    const winnerIsHome = m.home === winner;
    results[m.id] = {
        homeScore: winnerIsHome ? forPts : againstPts,
        awayScore: winnerIsHome ? againstPts : forPts,
        walkover: walkover ? (winnerIsHome ? "away" : "home") : null,
    };
};

const posOf = (table, team) => table.findIndex((e) => e.team === team) + 1;
const entry = (table, team) => table.find((e) => e.team === team);

/* ── 1. Puntaje base y sanción ─────────────────────────────────────── */
{
    const R = {};
    win(R, "KIMBERLEY", "ALIANZA", 80, 70);
    const t = calculateStandings(R, FIXTURE);

    check("Ganador suma 2", entry(t, "KIMBERLEY").points, 2);
    check("Perdedor suma 1", entry(t, "ALIANZA").points, 1);
    check("Equipo sin jugar queda en 0", entry(t, "ALUMNI").points, 0);
    check("Sanción de UyP A se resta", entry(t, "U. Y PROGRESO A").points, -1);
    check("Diferencia del ganador", entry(t, "KIMBERLEY").pointsDiff, 10);
    check("La tabla tiene 12 equipos", t.length, 12);
    check("Se numeran las posiciones", t[0].position, 1);
}

/* ── 2. Partido perdido por default ────────────────────────────────── */
{
    const R = {};
    win(R, "COLÓN SF", "COLÓN SJ", 20, 0, true);
    const t = calculateStandings(R, FIXTURE);

    check("Ganador por default suma 2", entry(t, "COLÓN SF").points, 2);
    check("Ausente suma 0", entry(t, "COLÓN SJ").points, 0);
    check("Se registra el default", entry(t, "COLÓN SJ").walkovers, 1);
}

/* ── 3. Desempate por enfrentamiento directo entre dos ─────────────── */
{
    const R = {};
    // ALIANZA y KIMBERLEY quedan con 3 pts; ALIANZA tiene peor diferencia
    // pero le ganó a KIMBERLEY en el duelo directo.
    win(R, "ALIANZA", "KIMBERLEY", 61, 60);
    win(R, "REGATAS SF", "ALIANZA", 70, 65);
    win(R, "KIMBERLEY", "ALUMNI", 90, 60);

    const t = calculateStandings(R, FIXTURE);
    check("Ambos con 3 puntos", [entry(t, "ALIANZA").points, entry(t, "KIMBERLEY").points], [3, 3]);
    check("Manda el partido entre sí, no la diferencia",
        posOf(t, "ALIANZA") < posOf(t, "KIMBERLEY"), true);
}

/* ── 4. Sin partido entre sí: manda la diferencia general ──────────── */
{
    const R = {};
    win(R, "SANTA ROSA", "CENTRAL RINCÓN", 90, 50); // +40
    win(R, "ALUMNI", "REGATAS SF", 61, 60);         // +1
    const t = calculateStandings(R, FIXTURE);

    check("Ambos con 2 puntos", [entry(t, "SANTA ROSA").points, entry(t, "ALUMNI").points], [2, 2]);
    check("Ordena por diferencia", posOf(t, "SANTA ROSA") < posOf(t, "ALUMNI"), true);
}

/* ── 5. Triple empate resuelto por tabla reducida ──────────────────── */
{
    const R = {};
    // Triángulo entre A, B y C: cada uno gana uno y pierde uno (3 pts cada uno
    // en la reducida), así que decide la diferencia dentro del triángulo.
    win(R, "ATL. FRANCK A", "ATL. FRANCK B", 90, 60);  // A +30
    win(R, "ATL. FRANCK B", "COLÓN SF", 80, 70);       // B +10 (−30 acumulado)
    win(R, "COLÓN SF", "ATL. FRANCK A", 75, 70);       // C +5 (−25 acumulado)

    const t = calculateStandings(R, FIXTURE);
    const trio = ["ATL. FRANCK A", "ATL. FRANCK B", "COLÓN SF"];
    check("Los tres con 3 puntos", trio.map((x) => entry(t, x).points), [3, 3, 3]);
    check("Orden por diferencia en la tabla reducida",
        trio.slice().sort((a, b) => posOf(t, a) - posOf(t, b)),
        ["ATL. FRANCK A", "COLÓN SF", "ATL. FRANCK B"]);
}

/* ── 6. Fase regular completa: todos juegan 11 ─────────────────────── */
{
    const R = {};
    FIXTURE.forEach((r) =>
        r.matches.forEach((m, i) => {
            R[m.id] = { homeScore: 70 + i, awayScore: 60 + ((i * 3) % 11) };
        })
    );
    const t = calculateStandings(R, FIXTURE);
    check("Todos juegan 11 partidos", t.every((e) => e.played === 11), true);
    check("Total de puntos = 3 por partido + sanciones",
        t.reduce((a, e) => a + e.points, 0), 66 * 3 - 1);
    check("Suma de diferencias = 0", t.reduce((a, e) => a + e.pointsDiff, 0), 0);
    check("Sin equipos duplicados", new Set(t.map((e) => e.team)).size, TEAMS.length);
}

console.log(ok ? "\n✓ Tabla y desempates correctos" : "\n✗ Hay errores");
process.exit(ok ? 0 : 1);
