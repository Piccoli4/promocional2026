/**
 * Simulación completa de la fase final para verificar el bracket.
 * Uso: node scripts/dev/simulate-playoffs.mjs
 */
import { computeBracket } from "../../src/utils/playoffCalculator.js";

const top12 = Array.from({ length: 12 }, (_, i) => ({ team: `T${i + 1}` }));

let ok = true;
const check = (label, actual, expected) => {
    const pass = JSON.stringify(actual) === JSON.stringify(expected);
    if (!pass) ok = false;
    console.log(`${pass ? "✓" : "✗"} ${label}${pass ? "" : `\n    esperado ${JSON.stringify(expected)}\n    obtuve   ${JSON.stringify(actual)}`}`);
};

const R = {};
/** Carga un juego: `winner` es "A" (mejor sembrado) o "B". */
const play = (bracket, seriesId, num, winner) => {
    const s = [
        ...bracket.playIn,
        ...bracket.quarterFinals,
        ...bracket.semiFinals,
        bracket.final,
    ].find((x) => x.id === seriesId);
    const g = s.games[num - 1];
    // El local del juego 2 es B; en 1 y 3 es A.
    const aIsHome = num !== 2;
    const aWins = winner === "A";
    const homeScore = aIsHome === aWins ? 80 : 60;
    R[g.id] = { homeScore, awayScore: 140 - homeScore };
};

const single = (id, homeWins) => {
    R[id] = homeWins ? { homeScore: 80, awayScore: 60 } : { homeScore: 60, awayScore: 80 };
};

// ── Play In: gana siempre el mejor sembrado salvo 8v9, que gana el 9° ──
let b = computeBracket(top12, R);
check("Play In 1 enfrenta 5° y 12°", [b.playIn[0].teamA, b.playIn[0].teamB], ["T5", "T12"]);
check("Play In juego 1 local = mejor sembrado", b.playIn[0].games[0].home, "T5");
check("Play In juego 2 local = peor sembrado", b.playIn[0].games[1].home, "T12");

play(b, "pi1", 1, "A"); play(b, "pi1", 2, "A");   // T5 2-0
play(b, "pi2", 1, "B"); play(b, "pi2", 2, "A"); play(b, "pi2", 3, "A"); // T6 2-1
play(b, "pi3", 1, "A"); play(b, "pi3", 2, "A");   // T7 2-0
play(b, "pi4", 1, "B"); play(b, "pi4", 2, "B");   // T9 2-0 (sorpresa)

b = computeBracket(top12, R);
check("Play In completo", b.playInComplete, true);
check("Ganadores del Play In ordenados", b.playInWinners.map((s) => s.team), ["T5", "T6", "T7", "T9"]);
check("Perdedores → 9° a 12°", b.repo.slots.map((s) => s.team), ["T8", "T10", "T11", "T12"]);
check("Serie 2-0 marca el juego 3 como no jugado", b.playIn[0].games[2].skipped, true);
check("Serie 2-1 no marca el juego 3", b.playIn[1].games[2].skipped, false);

check(
    "Sembrado de campeonato 1-8",
    b.champSeeds.map((s) => `${s.champSeed}:${s.team}`),
    ["1:T1", "2:T2", "3:T3", "4:T4", "5:T5", "6:T6", "7:T7", "8:T9"]
);

check("Cuartos 1 = 1° vs 8°", [b.quarterFinals[0].teamA, b.quarterFinals[0].teamB], ["T1", "T9"]);
check("Cuartos 4 = 4° vs 5°", [b.quarterFinals[3].teamA, b.quarterFinals[3].teamB], ["T4", "T5"]);

// ── Cuartos: ganan 1°, 7°(sorpresa sobre el 2°), 3° y 5° ──
play(b, "qf1", 1, "A"); play(b, "qf1", 2, "A");            // T1
play(b, "qf2", 1, "B"); play(b, "qf2", 2, "B");            // T7 elimina a T2
play(b, "qf3", 1, "A"); play(b, "qf3", 2, "B"); play(b, "qf3", 3, "A"); // T3
play(b, "qf4", 1, "B"); play(b, "qf4", 2, "B");            // T5 elimina a T4

b = computeBracket(top12, R);
check("Cuartos completos", b.qfComplete, true);
// Ganadores por sembrado: 1(T1), 3(T3), 5(T5), 7(T7) → semis 1v4 y 2v3
check("Semi 1 = mejor vs cuarto ganador", [b.semiFinals[0].teamA, b.semiFinals[0].teamB], ["T1", "T7"]);
check("Semi 2 = segundo vs tercero", [b.semiFinals[1].teamA, b.semiFinals[1].teamB], ["T3", "T5"]);
// Perdedores por sembrado: 2(T2), 4(T4), 6(T6), 8(T9) → 5v8 y 6v7
check("Cruce 5°v8°", [b.bracket58.a.home, b.bracket58.a.away], ["T2", "T9"]);
check("Cruce 6°v7°", [b.bracket58.b.home, b.bracket58.b.away], ["T4", "T6"]);

// ── 5° a 8° ──
single("g58a", true);   // T2
single("g58b", false);  // T6
b = computeBracket(top12, R);
check("Quinto puesto entre ganadores", [b.bracket58.p56.home, b.bracket58.p56.away], ["T2", "T6"]);
check("Séptimo puesto entre perdedores", [b.bracket58.p78.home, b.bracket58.p78.away], ["T9", "T4"]);
single("p56", true);    // T2 → 5°
single("p78", false);   // T4 → 7°

// ── Semis y final ──
play(b, "sf1", 1, "A"); play(b, "sf1", 2, "A");   // T1
play(b, "sf2", 1, "B"); play(b, "sf2", 2, "B");   // T5
b = computeBracket(top12, R);
check("Final = ganadores reordenados", [b.final.teamA, b.final.teamB], ["T1", "T5"]);
check("Tercer puesto entre perdedores", [b.p34.home, b.p34.away], ["T3", "T7"]);

play(b, "f", 1, "B"); play(b, "f", 2, "A"); play(b, "f", 3, "B");  // T5 campeón 2-1
single("p34", true);   // T3 → 3°

// ── Reposicionamiento ──
single("repo1a", true);  single("repo1b", true);
single("repo2a", true);  single("repo2b", true);
single("repo3a", true);  single("repo3b", true);

b = computeBracket(top12, R);
check("Campeón", b.champion, "T5");
check("Final 2-1", [b.final.winsA, b.final.winsB], [1, 2]);
check("Reposicionamiento: 3 partidos por equipo", b.repo.table.map((t) => t.played), [3, 3, 3, 3]);
check("Posiciones finales", b.finalPositions, [
    "T5", "T1", "T3", "T7", "T2", "T6", "T4", "T9",
    ...b.repo.table.map((t) => t.team),
]);

console.log(ok ? "\n✓ Bracket correcto de punta a punta" : "\n✗ Hay errores en el bracket");
process.exit(ok ? 0 : 1);
