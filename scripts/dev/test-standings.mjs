/**
 * Pruebas de la tabla de posiciones y los desempates FIBA.
 * Uso: node scripts/dev/test-standings.mjs
 */
import { calculateStandings, TEAM_SANCTIONS } from "../../src/utils/standingsCalculator.js";
import { FIXTURE, TEAMS } from "../../src/data/fixture.js";

/** Total de puntos descontados por sanción en el torneo en curso. */
const TOTAL_SANCIONES = Object.values(TEAM_SANCTIONS).reduce((a, s) => a + s, 0);

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

/* ── 1. Puntaje base ───────────────────────────────────────────────── */
{
    const R = {};
    win(R, "KIMBERLEY", "ALIANZA", 80, 70);
    const t = calculateStandings(R, FIXTURE, {});

    check("Ganador suma 2", entry(t, "KIMBERLEY").points, 2);
    check("Perdedor suma 1", entry(t, "ALIANZA").points, 1);
    check("Equipo sin jugar queda en 0", entry(t, "ALUMNI").points, 0);
    check("Diferencia del ganador", entry(t, "KIMBERLEY").pointsDiff, 10);
    check("La tabla tiene 12 equipos", t.length, 12);
    check("Se numeran las posiciones", t[0].position, 1);
}

/* ── 1b. Descuento por sanción ─────────────────────────────────────── */
{
    // Las sanciones cambian de un torneo a otro y hoy `TEAM_SANCTIONS` está
    // vacío. Inyectamos una para que el mecanismo quede probado igual, en vez
    // de fijar en el test los equipos sancionados de una temporada pasada.
    const R = {};
    win(R, "KIMBERLEY", "ALIANZA", 80, 70);
    const t = calculateStandings(R, FIXTURE, { KIMBERLEY: 2, ALUMNI: 1 });

    check("Se descuenta al ganador sancionado", entry(t, "KIMBERLEY").points, 0);
    check("Se descuenta a un equipo que no jugó", entry(t, "ALUMNI").points, -1);
    check("El equipo sin sanción queda intacto", entry(t, "ALIANZA").points, 1);
    check("La sanción queda registrada en la entrada", entry(t, "KIMBERLEY").sanction, 2);
    check("La sanción no altera la diferencia", entry(t, "KIMBERLEY").pointsDiff, 10);
}

/* ── 1c. Sanciones vigentes del torneo ─────────────────────────────── */
{
    const t = calculateStandings({}, FIXTURE);

    Object.entries(TEAM_SANCTIONS).forEach(([team, penalty]) => {
        check(`Sanción vigente de ${team}`, entry(t, team).points, -penalty);
    });
    check(
        "Los equipos sin sanción arrancan en 0",
        t.filter((e) => !(e.team in TEAM_SANCTIONS)).every((e) => e.points === 0),
        true
    );
    console.log(`  (sanciones vigentes: ${TOTAL_SANCIONES || "ninguna"})`);
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
    // Cada partido reparte 3 puntos (2 al ganador, 1 al perdedor).
    check("Total de puntos = 3 por partido - sanciones",
        t.reduce((a, e) => a + e.points, 0), 66 * 3 - TOTAL_SANCIONES);
    check("Suma de diferencias = 0", t.reduce((a, e) => a + e.pointsDiff, 0), 0);
    check("Sin equipos duplicados", new Set(t.map((e) => e.team)).size, TEAMS.length);
}

console.log(ok ? "\n✓ Tabla y desempates correctos" : "\n✗ Hay errores");
process.exit(ok ? 0 : 1);
