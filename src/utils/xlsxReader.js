/**
 * Lector mínimo de .xlsx, suficiente para las planillas de la CABB.
 *
 * ¿Por qué no una librería? La única opción seria en npm (`xlsx`) quedó
 * congelada en 0.18.5 con vulnerabilidades abiertas; SheetJS se mudó a su
 * propio CDN, lo que ataría cada deploy de Netlify a un host externo. Un .xlsx
 * es un ZIP con XML adentro y estas planillas usan un subconjunto muy acotado
 * del formato, así que alcanza con `fflate` (2 kB) y unas pocas expresiones
 * regulares. A cambio no soportamos fórmulas, fechas ni hojas múltiples: nada
 * de eso aparece en los archivos de la CABB.
 *
 * Dato clave del formato de la CABB: TODOS los valores viajan como cadenas
 * compartidas (`t="s"`), incluso los números. Por eso el lector devuelve
 * siempre texto y la conversión numérica queda en manos del parser.
 */

import { unzipSync, strFromU8 } from "fflate";

const NAMED_ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

function decodeXml(text) {
    if (!text || text.indexOf("&") === -1) return text ?? "";
    return text.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (match, entity) => {
        if (entity[0] === "#") {
            const code =
                entity[1] === "x" || entity[1] === "X"
                    ? parseInt(entity.slice(2), 16)
                    : parseInt(entity.slice(1), 10);
            return Number.isFinite(code) ? String.fromCodePoint(code) : match;
        }
        return NAMED_ENTITIES[entity] ?? match;
    });
}

/** Concatena todos los `<t>` de un fragmento (el texto enriquecido viene partido en varios). */
function textOf(fragment) {
    let out = "";
    const re = /<t\b[^>]*>([\s\S]*?)<\/t>|<t\b[^>]*\/>/g;
    let match;
    while ((match = re.exec(fragment))) out += decodeXml(match[1] ?? "");
    return out;
}

function parseSharedStrings(xml) {
    if (!xml) return [];
    const strings = [];
    const re = /<si\b[^>]*>([\s\S]*?)<\/si>|<si\b[^>]*\/>/g;
    let match;
    while ((match = re.exec(xml))) strings.push(textOf(match[1] ?? ""));
    return strings;
}

/** "AB" → 27 (índice 0). Corta al llegar a los dígitos de la fila. */
function columnIndex(ref) {
    let n = 0;
    for (let i = 0; i < ref.length; i++) {
        const code = ref.charCodeAt(i);
        if (code < 65 || code > 90) break;
        n = n * 26 + (code - 64);
    }
    return n - 1;
}

function attr(attrs, name) {
    const match = attrs.match(new RegExp(`${name}="([^"]*)"`));
    return match ? match[1] : null;
}

/**
 * Convierte la primera hoja de un .xlsx en una matriz de texto.
 * `rows[i]` es la fila i+1 de la planilla; las celdas vacías quedan como "".
 *
 * @param {Uint8Array|ArrayBuffer} bytes contenido del archivo
 * @returns {string[][]}
 */
export function readSheetRows(bytes) {
    const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

    let zip;
    try {
        zip = unzipSync(data);
    } catch {
        throw new Error("El archivo no es un .xlsx válido (no se pudo descomprimir).");
    }

    const sheetPath = Object.keys(zip)
        .filter((path) => /^xl\/worksheets\/sheet\d+\.xml$/.test(path))
        .sort((a, b) => {
            const n = (p) => parseInt(p.match(/(\d+)\.xml$/)[1], 10);
            return n(a) - n(b);
        })[0];

    if (!sheetPath) throw new Error("El .xlsx no contiene ninguna hoja de cálculo.");

    const shared = parseSharedStrings(
        zip["xl/sharedStrings.xml"] ? strFromU8(zip["xl/sharedStrings.xml"]) : null
    );
    const sheet = strFromU8(zip[sheetPath]);

    const rows = [];
    // El cuantificador va perezoso a propósito: con `[^>]*` goloso, en una
    // etiqueta auto-cerrada como <c r="A12" s="3"/> los atributos se tragan la
    // barra, la alternativa `/>` nunca entra y el contenido se toma hasta el
    // </c> de una celda posterior, corriendo los valores de lugar.
    const rowRe = /<row\b([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g;
    let rowMatch;

    while ((rowMatch = rowRe.exec(sheet))) {
        const rowNumber = parseInt(attr(rowMatch[1], "r") ?? "0", 10);
        const body = rowMatch[2] ?? "";
        const cells = [];

        const cellRe = /<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
        let cellMatch;
        let cursor = 0;

        while ((cellMatch = cellRe.exec(body))) {
            const attrs = cellMatch[1];
            const content = cellMatch[2] ?? "";
            const ref = attr(attrs, "r");
            const index = ref ? columnIndex(ref) : cursor;
            const type = attr(attrs, "t");

            const rawValue = content.match(/<v>([\s\S]*?)<\/v>/);

            let value = "";
            if (type === "s") {
                // Referencia a sharedStrings.xml: el <v> es el índice.
                const position = rawValue ? parseInt(rawValue[1], 10) : -1;
                value = shared[position] ?? "";
            } else if (type === "inlineStr") {
                value = textOf(content);
            } else {
                // Números, "str" (fórmula con resultado de texto) y booleanos.
                value = rawValue ? decodeXml(rawValue[1]) : "";
            }

            cells[index] = value;
            cursor = index + 1;
        }

        // Rellenamos los huecos para que el parser pueda indexar por columna sin miedo.
        for (let i = 0; i < cells.length; i++) if (cells[i] === undefined) cells[i] = "";

        if (rowNumber > 0) rows[rowNumber - 1] = cells;
        else rows.push(cells);
    }

    for (let i = 0; i < rows.length; i++) if (rows[i] === undefined) rows[i] = [];

    return rows;
}
