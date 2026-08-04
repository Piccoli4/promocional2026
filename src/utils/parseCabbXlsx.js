/**
 * Interpreta la planilla de estadísticas que exporta la app de la CABB.
 *
 * Anatomía del archivo (verificada sobre los 6 partidos de la 1ª Fecha):
 *
 *   fila 6   "Estadísticas - LOCAL vs VISITANTE - MM - ASB - ... - 2026"
 *   fila 11  nombre del equipo local
 *   fila 12  encabezado de grupos: TC 2P | TC 3P | TL | Rebotes | TAP | FAL
 *   fila 13  encabezado de columnas, empieza con "Num."
 *   filas +  un jugador por fila
 *   fila N   "TOTALES"
 *   ...      el mismo bloque para el visitante
 *
 * Las posiciones exactas cambian entre archivos (según cuántos jugadores tenga
 * cada equipo), así que en vez de leer filas fijas buscamos los anclajes
 * "Num." y "TOTALES".
 */

// Las extensiones .js son necesarias para que los scripts de `npm run check`
// puedan importar estos módulos directamente con node.
import { readSheetRows } from "./xlsxReader.js";
import { mapCabbTeam } from "../data/cabbTeamNames.js";

/* ── Columnas de la planilla (índice 0 = columna A) ──────────────────── */

const COL = {
    num: 0,
    nombre: 1,
    min: 2,
    pts: 3,
    t2: 4, // "3/4" → convertidos/intentados
    t3: 6,
    tl: 8,
    rd: 10, // rebotes defensivos
    ro: 11, // rebotes ofensivos
    rt: 12, // total (lo recalculamos igual)
    ast: 13,
    rec: 14, // recuperos
    per: 15, // pérdidas
    tap: 16, // tapones cometidos
    tapR: 17, // tapones recibidos
    fc: 18, // faltas cometidas
    fr: 19, // faltas recibidas
    val: 20,
    pm: 21, // +/-
};

/* ── Conversiones ────────────────────────────────────────────────────── */

const text = (value) => String(value ?? "").trim();

/** "12" → 12, "" → 0. Nunca devuelve NaN. */
function num(value) {
    const parsed = parseInt(text(value).replace(",", "."), 10);
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * "3/4" → { c: 3, i: 4 }. Guardamos convertidos e intentados por separado
 * porque los porcentajes de la CABB no se pueden sumar entre partidos.
 *
 * Si el intento es menor al convertido (pasa cuando el planillero carga los
 * aciertos pero no los errados) tomamos el convertido como piso, para no
 * generar porcentajes por encima de 100.
 */
function shots(value) {
    const raw = text(value);
    const match = raw.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (!match) return { c: 0, i: 0 };
    const c = parseInt(match[1], 10);
    const i = parseInt(match[2], 10);
    return { c, i: Math.max(c, i) };
}

/** "09:40" → 580 segundos. "200:00" → 12000. */
function clockToSeconds(value) {
    const match = text(value).match(/^(\d+):([0-5]?\d)$/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

/** Identificador estable de jugador: no incluye el dorsal, que cambia de fecha en fecha. */
export function playerSlug(teamKey, name) {
    const slug = (value) =>
        String(value ?? "")
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^A-Z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .toLowerCase();
    return `${slug(teamKey)}__${slug(name)}`;
}

/* ── Lectura de una fila de jugador ──────────────────────────────────── */

function readPlayerRow(row, teamKey) {
    const name = text(row[COL.nombre]);
    const t2 = shots(row[COL.t2]);
    const t3 = shots(row[COL.t3]);
    const tl = shots(row[COL.tl]);
    const rd = num(row[COL.rd]);
    const ro = num(row[COL.ro]);

    return {
        num: text(row[COL.num]),
        nombre: name,
        playerId: playerSlug(teamKey, name),
        seg: clockToSeconds(row[COL.min]),
        pts: num(row[COL.pts]),
        t2c: t2.c,
        t2i: t2.i,
        t3c: t3.c,
        t3i: t3.i,
        tlc: tl.c,
        tli: tl.i,
        rd,
        ro,
        rt: rd + ro,
        ast: num(row[COL.ast]),
        rec: num(row[COL.rec]),
        per: num(row[COL.per]),
        tap: num(row[COL.tap]),
        tapR: num(row[COL.tapR]),
        fc: num(row[COL.fc]),
        fr: num(row[COL.fr]),
        val: num(row[COL.val]),
        pm: num(row[COL.pm]),
    };
}

/* ── Localización de los bloques ─────────────────────────────────────── */

/** Filas cuyo primer valor es "Num.": marcan el inicio de cada bloque. */
function findHeaderRows(rows) {
    const found = [];
    rows.forEach((row, index) => {
        if (/^num\.?$/i.test(text(row?.[COL.num]))) found.push(index);
    });
    return found;
}

/**
 * Sube desde el encabezado hasta encontrar el nombre del equipo: es la primera
 * fila hacia arriba con texto en la columna A. La fila de grupos ("TC 2P", ...)
 * no estorba porque tiene la columna A vacía.
 */
function findTeamNameAbove(rows, headerIndex) {
    for (let i = headerIndex - 1; i >= 0 && i >= headerIndex - 6; i--) {
        const value = text(rows[i]?.[COL.num]);
        if (value) return { name: value, row: i };
    }
    return { name: "", row: -1 };
}

/** Del encabezado hacia abajo hasta "TOTALES", salteando filas en blanco. */
function readBlock(rows, headerIndex, teamKey) {
    const players = [];
    let totalsRow = null;

    for (let i = headerIndex + 1; i < rows.length; i++) {
        const row = rows[i] ?? [];
        const nombre = text(row[COL.nombre]);

        if (/^totales$/i.test(nombre)) {
            totalsRow = row;
            break;
        }
        if (!nombre && !text(row[COL.num])) continue; // fila separadora
        if (!nombre) continue; // dorsal suelto sin nombre: no es un jugador

        players.push(readPlayerRow(row, teamKey));
    }

    return { players, totalsRow };
}

/* ── Título ──────────────────────────────────────────────────────────── */

/**
 * "Estadísticas - LOCAL vs VISITANTE - MM - ASB - ..." → { local, visitante }
 *
 * El sufijo del torneo arranca en el primer " - " posterior al " vs ".
 * Ningún nombre de club del torneo contiene " - ", así que el corte es seguro.
 */
export function parseTitle(title) {
    const raw = text(title).replace(/^estad[íi]sticas\s*[-–]\s*/i, "");
    const vs = raw.match(/^([\s\S]+?)\s+vs\.?\s+([\s\S]+)$/i);
    if (!vs) return { local: "", visitante: "" };

    const local = vs[1].trim();
    const visitante = vs[2].split(/\s+[-–]\s+/)[0].trim();
    return { local, visitante };
}

/* ── Punto de entrada ────────────────────────────────────────────────── */

/**
 * Convierte el contenido de un .xlsx de la CABB en un partido estructurado.
 *
 * No decide a qué partido del fixture corresponde ni escribe nada: eso queda
 * para el panel de carga, que muestra el resultado y pide confirmación.
 *
 * @param {Uint8Array|ArrayBuffer} bytes
 * @returns {{
 *   titulo: string,
 *   equipos: Array<{ crudo: string, key: string|null, jugadores: object[], totales: object }>,
 *   avisos: string[],
 * }}
 */
export function parseCabbXlsx(bytes) {
    return parseCabbRows(readSheetRows(bytes));
}

/** Igual que `parseCabbXlsx` pero sobre la matriz ya leída (así se puede testear sin archivo). */
export function parseCabbRows(rows) {
    const avisos = [];

    const tituloRow = rows.find((row) =>
        (row ?? []).some((cell) => /^estad[íi]sticas\s*[-–]/i.test(text(cell)))
    );
    const titulo = tituloRow
        ? text(tituloRow.find((cell) => /^estad[íi]sticas\s*[-–]/i.test(text(cell))))
        : "";
    const { local, visitante } = parseTitle(titulo);

    const headers = findHeaderRows(rows);
    if (headers.length < 2) {
        throw new Error(
            "No se reconoce el formato: la planilla debería tener dos bloques de jugadores " +
                `(se encontraron ${headers.length}). ¿Es el Excel que exporta la app de la CABB?`
        );
    }
    if (headers.length > 2) {
        avisos.push(`La planilla tiene ${headers.length} bloques; se usan los dos primeros.`);
    }

    const equipos = headers.slice(0, 2).map((headerIndex, position) => {
        const { name } = findTeamNameAbove(rows, headerIndex);
        // El nombre del título es el más confiable; el del bloque puede venir cortado.
        const crudo = name || (position === 0 ? local : visitante);
        const key = mapCabbTeam(crudo);
        const { players, totalsRow } = readBlock(rows, headerIndex, key ?? crudo);

        return {
            crudo,
            key,
            jugadores: players,
            totales: totalsRow ? readPlayerRow(totalsRow, key ?? crudo) : null,
        };
    });

    /* Controles de coherencia: preferimos avisar antes que guardar datos torcidos. */
    for (const equipo of equipos) {
        if (!equipo.key) {
            avisos.push(`Equipo no reconocido: "${equipo.crudo}". Elegilo a mano.`);
        }
        if (equipo.jugadores.length === 0) {
            avisos.push(`"${equipo.crudo}" no tiene jugadores cargados en la planilla.`);
        }
        if (equipo.totales) {
            const suma = equipo.jugadores.reduce((acc, j) => acc + j.pts, 0);
            if (suma !== equipo.totales.pts) {
                avisos.push(
                    `En "${equipo.crudo}" los puntos de los jugadores suman ${suma} ` +
                        `pero la fila TOTALES dice ${equipo.totales.pts}.`
                );
            }
        }
    }

    if (equipos[0].key && equipos[0].key === equipos[1].key) {
        avisos.push("Los dos bloques apuntan al mismo equipo. Revisá la asignación.");
    }

    return { titulo, equipos, avisos };
}

/**
 * Marca la planilla como sospechosa cuando un equipo no registró ni un solo
 * tiro errado: significa que el planillero cargó únicamente los aciertos y los
 * porcentajes de ese partido no son representativos.
 */
export function tiroSospechoso(equipo) {
    const intentos =
        equipo.jugadores.reduce((acc, j) => acc + j.t2i + j.t3i, 0);
    const convertidos =
        equipo.jugadores.reduce((acc, j) => acc + j.t2c + j.t3c, 0);
    return intentos > 0 && intentos === convertidos;
}
