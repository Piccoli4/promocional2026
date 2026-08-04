/**
 * Pruebas del lector de planillas de la CABB y del agregador de estadísticas.
 * Uso: node scripts/dev/test-stats.mjs
 *
 * Los .xlsx de `fixtures/` son las planillas reales de la 1ª Fecha 2026. Sirven
 * de regresión sobre un formato que no controlamos: si la CABB cambia su
 * exportación, estas pruebas avisan antes que un usuario.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { parseCabbXlsx, parseTitle, playerSlug, tiroSospechoso } from "../../src/utils/parseCabbXlsx.js";
import { mapCabbTeam, normalizeTeamName } from "../../src/data/cabbTeamNames.js";
import {
    agregarEstadisticas,
    conDerivados,
    pct,
    rankear,
    segundosAReloj,
    totalesVacios,
} from "../../src/utils/statsCalculator.js";
import { FIXTURE, TEAMS } from "../../src/data/fixture.js";

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "fixtures");

let ok = true;
const check = (label, condition, detalle = "") => {
    if (!condition) ok = false;
    console.log(`${condition ? "✓" : "✗"} ${label}${condition || !detalle ? "" : `\n    ${detalle}`}`);
};
const eq = (label, actual, esperado) =>
    check(label, JSON.stringify(actual) === JSON.stringify(esperado), `esperado ${JSON.stringify(esperado)}, obtuve ${JSON.stringify(actual)}`);

/* ── 1. Utilidades ───────────────────────────────────────────────────── */

console.log("\n— Normalización y mapeo —");

eq("quita tildes y apóstrofos", normalizeTeamName("UNIÓN Y PROGRESO 'A'"), "UNION Y PROGRESO A");
eq("Franck (Rojo) es el equipo B", mapCabbTeam("CLUB ATLETICO FRANCK (Rojo)"), "ATL. FRANCK B");
eq("Franck a secas es el equipo A", mapCabbTeam("CLUB ATLETICO FRANCK"), "ATL. FRANCK A");
eq("COLON sin tilde", mapCabbTeam("COLON SANTA FE"), "COLÓN SF");
eq("un nombre desconocido no se adivina", mapCabbTeam("CLUB INEXISTENTE DE PARANA"), null);
eq("las claves propias se aceptan", mapCabbTeam("CENTRAL RINCÓN"), "CENTRAL RINCÓN");

eq(
    "el título separa local y visitante",
    parseTitle("Estadísticas - CLUB ATLETICO FRANCK (Rojo) vs UNIÓN Y PROGRESO 'A' - MM - ASB - PROMOCIONAL MAYORES MASCULINO - 2026 - CABB - 2026"),
    { local: "CLUB ATLETICO FRANCK (Rojo)", visitante: "UNIÓN Y PROGRESO 'A'" }
);

eq("el id de jugador ignora el dorsal", playerSlug("COLÓN SF", "PÉREZ, JUAN"), "colon-sf__perez-juan");
eq("mismo jugador, distinta grafía de acento", playerSlug("ALUMNI", "MAURUTTO, TOMÁS"), playerSlug("ALUMNI", "MAURUTTO, TOMÁS".normalize("NFD")));

eq("porcentaje sin intentos es null", pct(0, 0), null);
eq("porcentaje redondeado", pct(3, 8), 38);
eq("reloj", segundosAReloj(1231), "20:31");

/* ── 2. Lectura de las planillas reales ──────────────────────────────── */

console.log("\n— Planillas reales de la 1ª Fecha —");

const archivos = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith(".xlsx")) : [];
check(`hay planillas de ejemplo (${archivos.length})`, archivos.length === 6, `en ${DIR}`);

const partidos = [];

for (const archivo of archivos) {
    const parsed = parseCabbXlsx(fs.readFileSync(path.join(DIR, archivo)));
    const [local, visitante] = parsed.equipos;

    check(`${archivo}: sin avisos`, parsed.avisos.length === 0, parsed.avisos.join(" | "));
    check(`${archivo}: los dos equipos mapean`, Boolean(local.key && visitante.key), `${local.crudo} / ${visitante.crudo}`);

    // La fila TOTALES tiene que coincidir con la suma de los jugadores.
    for (const lado of parsed.equipos) {
        const suma = totalesVacios();
        for (const j of lado.jugadores) {
            suma.pts += j.pts;
            suma.rt += j.rt;
            suma.ast += j.ast;
            suma.seg += j.seg;
        }
        check(
            `${lado.key}: puntos jugadores = TOTALES`,
            suma.pts === lado.totales.pts,
            `jugadores ${suma.pts} vs TOTALES ${lado.totales.pts}`
        );
        // La CABB trunca el reloj de cada jugador al segundo, así que la suma
        // queda 4–8 segundos por debajo de los 200 minutos reglamentarios.
        // Toleramos ese redondeo; una diferencia mayor sí indicaría un error.
        const desvio = Math.abs(suma.seg - 200 * 60);
        check(
            `${lado.key}: ~200 minutos repartidos`,
            desvio <= 15,
            `${segundosAReloj(suma.seg)} acumulados (${desvio}s de desvío)`
        );
        check(`${lado.key}: tiene jugadores`, lado.jugadores.length >= 5, `${lado.jugadores.length}`);
    }

    partidos.push({ archivo, parsed, local: local.key, visitante: visitante.key });
}

/* ── 3. Correspondencia con el fixture ───────────────────────────────── */

console.log("\n— Correspondencia con la 1ª Fecha del fixture —");

const fecha1 = FIXTURE.find((r) => r.round === 1);
const esperados = new Set(fecha1.matches.map((m) => `${m.home} vs ${m.away}`));
const obtenidos = new Set(partidos.map((p) => `${p.local} vs ${p.visitante}`));

for (const cruce of esperados) {
    check(`fixture tiene "${cruce}"`, obtenidos.has(cruce));
}
check("no sobra ningún partido", obtenidos.size === esperados.size, `${obtenidos.size} planillas, ${esperados.size} partidos`);

/* ── 4. Agregación ───────────────────────────────────────────────────── */

console.log("\n— Agregación —");

const docs = partidos.map((p) => {
    const match = fecha1.matches.find((m) => m.home === p.local && m.away === p.visitante);
    return {
        matchId: match.id,
        fase: "regular",
        fecha: 1,
        local: p.local,
        visitante: p.visitante,
        equipos: p.parsed.equipos.map((e) => ({ key: e.key, jugadores: e.jugadores })),
    };
});

const agregado = agregarEstadisticas(docs);

eq("se agregaron 6 partidos", agregado.partidos, 6);
eq("los 12 equipos aparecen", agregado.equipos.length, 12);
check("todos los equipos son del fixture", agregado.equipos.every((e) => TEAMS.includes(e.equipo)));
check("cada equipo jugó 1 partido", agregado.equipos.every((e) => e.pj === 1), JSON.stringify(agregado.equipos.map((e) => [e.equipo, e.pj])));

const totalPuntos = agregado.equipos.reduce((acc, e) => acc + e.pts, 0);
const totalContra = agregado.equipos.reduce((acc, e) => acc + e.ptsContra, 0);
eq("puntos a favor = puntos en contra en todo el torneo", totalPuntos, totalContra);

const jugadoresPorPartido = docs.reduce(
    (acc, d) => acc + d.equipos.reduce((a, e) => a + e.jugadores.length, 0), 0
);
eq("todos los jugadores tienen ficha", agregado.jugadores.length, jugadoresPorPartido);
check("cada jugador tiene su registro por partido", agregado.jugadores.every((j) => j.log.length === j.pj));

// Máximo anotador de la 1ª Fecha, verificado sobre las seis planillas.
const goleador = rankear(agregado.jugadores, "pts", "total", 1)[0];
eq("el goleador de la fecha", [goleador.nombre, goleador.pts], ["PEREYRA, GERONIMO", 31]);

const conPct = conDerivados(agregado.jugadores.find((j) => j.nombre === "DREWES, LEANDRO"));
eq("los porcentajes se recalculan desde convertidos/intentados", conPct.pctT3, pct(conPct.t3c, conPct.t3i));
check("el promedio es coherente con el total", conPct.prom.pts === conPct.pts / conPct.pj);

/* ── 5. Tamaño del documento agregado ────────────────────────────────── */

console.log("\n— Tamaño del agregado a fin de torneo —");

// Firestore no acepta documentos de más de 1 MB. Proyectamos el torneo completo
// (11 fechas + fase final) repitiendo estas planillas para comprobar que el
// agregado se mantiene lejos del techo. Si esta prueba falla, hay que sacar el
// registro `log` del agregado y leer las planillas de a una en la ficha.
const proyectados = [];
for (let fecha = 1; fecha <= 11; fecha++) {
    docs.forEach((d, i) => proyectados.push({ ...d, matchId: `${fecha}-${i + 1}`, fecha }));
}
for (let i = 0; i < 30; i++) {
    proyectados.push({ ...docs[i % docs.length], matchId: `po${i}`, fase: "playoffs", fecha: null });
}

const kb = JSON.stringify(agregarEstadisticas(proyectados)).length / 1024;
check(
    `el agregado proyectado entra en un documento (${kb.toFixed(0)} kB)`,
    kb < 700,
    "el límite de Firestore es 1024 kB"
);

/* ── 6. Detección de planillas con tiros mal cargados ────────────────── */

console.log("\n— Control de calidad del dato —");

const sospechosos = partidos.flatMap((p) =>
    p.parsed.equipos.filter(tiroSospechoso).map((e) => e.key)
);
check(
    `se detectan equipos sin ningún tiro errado (${sospechosos.length})`,
    sospechosos.length > 0,
    "estas planillas tienen % de tiro inflado y la app los marca"
);
console.log(`   equipos marcados: ${sospechosos.join(", ") || "ninguno"}`);

/* ── Resultado ───────────────────────────────────────────────────────── */

console.log(ok ? "\nTodo en orden.\n" : "\nHay pruebas que fallan.\n");
process.exit(ok ? 0 : 1);
