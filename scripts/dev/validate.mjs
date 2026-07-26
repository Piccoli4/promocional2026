/**
 * Verifica la integridad del fixture de la fase regular.
 * Uso: node scripts/dev/validate.mjs
 */
import { TEAMS, FIXTURE, ROUND_DATES } from "../../src/data/fixture.js";

let ok = true;
const fail = (m) => { ok = false; console.log("✗", m); };

if (TEAMS.length !== 12) fail(`TEAMS = ${TEAMS.length}, esperaba 12`);
if (new Set(TEAMS).size !== TEAMS.length) fail("Hay equipos repetidos en TEAMS");
if (FIXTURE.length !== 11) fail(`fechas = ${FIXTURE.length}, esperaba 11`);

const seen = new Map();
FIXTURE.forEach((r) => {
    const inRound = new Set();
    if (r.matches.length !== 6) fail(`fecha ${r.round}: ${r.matches.length} partidos, esperaba 6`);
    if (r.date !== ROUND_DATES[r.round]) fail(`fecha ${r.round}: sin fecha de calendario`);

    r.matches.forEach((m) => {
        [m.home, m.away].forEach((t) => {
            if (!TEAMS.includes(t)) fail(`fecha ${r.round}: equipo desconocido "${t}"`);
            if (inRound.has(t)) fail(`fecha ${r.round}: ${t} juega dos veces`);
            inRound.add(t);
        });
        const key = [m.home, m.away].sort().join(" | ");
        if (seen.has(key)) fail(`cruce repetido ${key} (fechas ${seen.get(key)} y ${r.round})`);
        seen.set(key, r.round);
    });

    if (inRound.size !== 12) fail(`fecha ${r.round}: juegan ${inRound.size} equipos, esperaba 12`);
});

if (seen.size !== 66) fail(`cruces distintos = ${seen.size}, esperaba 66`);

// Todas las fechas del calendario caen domingo (el reglamento las fija así)
Object.entries(ROUND_DATES).forEach(([round, iso]) => {
    const [y, m, d] = iso.split("-").map(Number);
    if (new Date(y, m - 1, d).getDay() !== 0) fail(`fecha ${round} (${iso}) no cae domingo`);
});

const homeCount = {};
TEAMS.forEach((t) => (homeCount[t] = 0));
FIXTURE.forEach((r) => r.matches.forEach((m) => homeCount[m.home]++));
console.log(
    "Localías:",
    Object.entries(homeCount).map(([t, n]) => `${t}:${n}`).join("  ")
);

console.log(
    ok
        ? "\n✓ Fixture válido: 11 fechas, 66 cruces únicos, todos juegan cada fecha"
        : "\n✗ Hay errores en el fixture"
);
process.exit(ok ? 0 : 1);
