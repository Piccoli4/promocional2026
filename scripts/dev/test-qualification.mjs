/**
 * Pruebas de la calculadora de clasificación.
 * Uso: node scripts/dev/test-qualification.mjs
 *
 * La prueba central es de propiedad: se completa la temporada con marcadores
 * al azar muchas veces y, en cada final, la posición real de cada equipo
 * (según la tabla oficial) tiene que caer dentro del rango que predijo la
 * calculadora, tanto el general como el de "si gana X partidos".
 */
import { analyzeQualification, MAX_PENDING } from "../../src/utils/qualificationCalculator.js";
import { calculateStandings } from "../../src/utils/standingsCalculator.js";
import { FIXTURE, TEAMS } from "../../src/data/fixture.js";

let ok = true;
const check = (label, pass, detail = "") => {
    if (!pass) ok = false;
    console.log(`${pass ? "✓" : "✗"} ${label}${pass ? "" : `\n    ${detail}`}`);
};

/** Generador determinístico para que las corridas sean reproducibles. */
function rng(seed) {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 2 ** 32;
    };
}

/** Marcador al azar. `margin` chico fuerza empates en diferencia de puntos. */
const score = (rand, margin = 30) => {
    const a = 50 + Math.floor(rand() * 40);
    let b = a + (Math.floor(rand() * margin) + 1) * (rand() < 0.5 ? 1 : -1);
    return [a, b];
};

/** Resultados de las primeras `rounds` fechas. */
function seasonUpTo(rounds, rand) {
    const results = {};
    FIXTURE.slice(0, rounds).forEach((r) =>
        r.matches.forEach((m) => {
            const [h, a] = score(rand);
            results[m.id] = { homeScore: h, awayScore: a, walkover: null };
        })
    );
    return results;
}

/** Completa lo que falta con marcadores al azar. */
function completeSeason(results, rand, margin) {
    const full = { ...results };
    FIXTURE.forEach((r) =>
        r.matches.forEach((m) => {
            if (full[m.id]) return;
            const [h, a] = score(rand, margin);
            full[m.id] = { homeScore: h, awayScore: a, walkover: null };
        })
    );
    return full;
}

const pendingGamesOf = (results, team) =>
    FIXTURE.flatMap((r) => r.matches).filter((m) => !results[m.id] && (m.home === team || m.away === team));

/* ── 1. Modos según lo que falta ───────────────────────────────────── */
{
    const rand = rng(1);
    check("Sin partidos jugados no calcula (demasiados pendientes)", analyzeQualification({}, FIXTURE).mode === "unavailable");

    const full = completeSeason({}, rand, 30);
    const final = analyzeQualification(full, FIXTURE);
    const table = calculateStandings(full, FIXTURE);
    check("Temporada terminada: modo final", final.mode === "final");
    check(
        "Temporada terminada: el rango es la posición real",
        table.every((e) => final.teams[e.team].minPos === e.position && final.teams[e.team].maxPos === e.position)
    );
}

/* ── 2. Propiedad: el final real siempre cae en el rango predicho ─── */
for (const [rounds, seed] of [[8, 7], [9, 11], [10, 23]]) {
    const rand = rng(seed);
    const results = seasonUpTo(rounds, rand);
    const t0 = performance.now();
    const q = analyzeQualification(results, FIXTURE);
    const ms = Math.round(performance.now() - t0);

    check(`${11 - rounds} fechas por jugar: calcula en modo exacto (${q.pending} pendientes, ${ms} ms)`, q.mode === "exact");
    check(`${11 - rounds} fechas por jugar: se mantiene bajo el límite`, q.pending <= MAX_PENDING);

    let fuera = null;
    let casos = 0;
    // Márgenes chicos y grandes: los chicos generan empates en diferencia.
    for (let i = 0; i < 1500 && !fuera; i++) {
        const full = completeSeason(results, rand, i % 2 ? 3 : 40);
        const table = calculateStandings(full, FIXTURE);
        for (const e of table) {
            const info = q.teams[e.team];
            const wins = pendingGamesOf(results, e.team).filter((m) => {
                const r = full[m.id];
                return m.home === e.team ? r.homeScore > r.awayScore : r.awayScore > r.homeScore;
            }).length;
            const byW = info.byWins.find((b) => b.wins === wins);
            casos++;
            if (e.position < info.minPos || e.position > info.maxPos) {
                fuera = `${e.team} terminó ${e.position}° y el rango era ${info.minPos}°–${info.maxPos}°`;
            } else if (e.position < byW.minPos || e.position > byW.maxPos) {
                fuera = `${e.team} ganó ${wins}, terminó ${e.position}° y el rango era ${byW.minPos}°–${byW.maxPos}°`;
            }
        }
    }
    check(`${11 - rounds} fechas por jugar: ${casos} posiciones finales dentro del rango`, !fuera, fuera);

    // Coherencia interna.
    const coherente = TEAMS.every((team) => {
        const info = q.teams[team];
        return (
            info.minPos <= info.maxPos &&
            info.byWins.length === info.remaining + 1 &&
            info.byWins.every((b) => b.minPos >= info.minPos && b.maxPos <= info.maxPos)
        );
    });
    check(`${11 - rounds} fechas por jugar: rangos coherentes`, coherente);
}

/* ── 3. Casos armados a mano ───────────────────────────────────────── */
{
    // Una fecha por jugar con la tabla muy estirada: los de arriba ya están
    // asegurados y los de abajo ya no llegan.
    const rand = rng(99);
    const results = {};
    const fuerza = Object.fromEntries(TEAMS.map((t, i) => [t, i])); // COLÓN SF el más fuerte
    FIXTURE.slice(0, 10).forEach((r) =>
        r.matches.forEach((m) => {
            const homeWins = fuerza[m.home] < fuerza[m.away];
            const [w, l] = [80 + Math.floor(rand() * 10), 60];
            results[m.id] = { homeScore: homeWins ? w : l, awayScore: homeWins ? l : w, walkover: null };
        })
    );
    const q = analyzeQualification(results, FIXTURE);
    const table = calculateStandings(results, FIXTURE);
    const primero = table[0].team;
    const ultimo = table[table.length - 1].team;
    check("Tabla estirada: el 1° ya tiene Cuartos asegurado", q.teams[primero].status === "cuartos");
    check("Tabla estirada: el último ya está en el Play In", q.teams[ultimo].status === "playin");
    check(
        "Ganar más nunca empeora el mejor puesto posible",
        TEAMS.every((team) => {
            const b = q.teams[team].byWins; // de más victorias a menos
            return b.every((x, i) => i === 0 || x.minPos >= b[i - 1].minPos);
        })
    );
}

console.log(ok ? "\nTodo en orden." : "\nHay pruebas que fallan.");
process.exit(ok ? 0 : 1);
