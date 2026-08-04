/**
 * Puente entre los nombres oficiales de la CABB y las claves internas de la app.
 *
 * La app exporta estadísticas desde la plataforma de la Confederación Argentina
 * de Basquetbol, que usa la razón social completa de cada club. Nuestro fixture
 * usa nombres cortos. Sin esta traducción, cada Excel entra como un equipo nuevo.
 *
 * Ojo con dos casos que se prestan a confusión:
 *   - "CLUB ATLETICO FRANCK (Rojo)" es el equipo B, no una variante del A.
 *   - La CABB escribe "COLON" sin tilde y "UNIÓN" con tilde; por eso todo se
 *     compara normalizado (mayúsculas, sin acentos ni apóstrofos).
 */

import { TEAMS } from "./fixture.js";

/**
 * Lleva un nombre a su forma canónica para comparar: mayúsculas, sin acentos,
 * sin apóstrofos ni puntuación, con los espacios colapsados.
 */
export function normalizeTeamName(raw) {
    return String(raw ?? "")
        .toUpperCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\u2018\u2019\u0060\u00b4\"]/g, "")
        .replace(/[^A-Z0-9() ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

/** Nombre CABB normalizado → clave del fixture. */
const CABB_TO_APP = {
    "COLON SANTA FE": "COLÓN SF",
    "COLON SAN JUSTO": "COLÓN SJ",
    "REGATAS DE SANTA FE": "REGATAS SF",
    "ALUMNI LAGUNA PAVIA": "ALUMNI",
    "UNION Y PROGRESO A": "U. Y PROGRESO A",
    "UNION Y PROGRESO B": "U. Y PROGRESO B",
    "CLUB ATLETICO FRANCK": "ATL. FRANCK A",
    "CLUB ATLETICO FRANCK (ROJO)": "ATL. FRANCK B",
    "CLUB ATLETICO Y CULTURAL ALIANZA": "ALIANZA",
    "CLUB ATLETICO KIMBERLEY": "KIMBERLEY",
    "SANTA ROSA": "SANTA ROSA",
    "CLUB ATLETICO CENTRAL RINCON": "CENTRAL RINCÓN",
};

/**
 * Variantes que aparecieron o podrían aparecer según cómo cargue el planillero.
 * Sumar acá cualquier forma nueva que rechace el panel de carga.
 */
const ALIASES = {
    "CLUB ATLETICO FRANCK (AZUL)": "ATL. FRANCK A",
    "CLUB ATLETICO FRANCK A": "ATL. FRANCK A",
    "CLUB ATLETICO FRANCK B": "ATL. FRANCK B",
    "ATLETICO FRANCK": "ATL. FRANCK A",
    "COLON DE SANTA FE": "COLÓN SF",
    "COLON DE SAN JUSTO": "COLÓN SJ",
    "CLUB ATLETICO COLON": "COLÓN SF",
    "REGATAS SANTA FE": "REGATAS SF",
    "CLUB DE REGATAS SANTA FE": "REGATAS SF",
    "ALUMNI DE LAGUNA PAVIA": "ALUMNI",
    "CLUB ATLETICO ALUMNI": "ALUMNI",
    "UNION Y PROGRESO": "U. Y PROGRESO A",
    "CENTRAL RINCON": "CENTRAL RINCÓN",
    "CLUB CENTRAL RINCON": "CENTRAL RINCÓN",
    "KIMBERLEY": "KIMBERLEY",
    "CLUB SANTA ROSA": "SANTA ROSA",
    "SANTA ROSA DE CALCHINES": "SANTA ROSA",
    "ALIANZA": "ALIANZA",
};

const LOOKUP = { ...CABB_TO_APP, ...ALIASES };

/** Las propias claves de la app también se aceptan tal cual. */
for (const team of TEAMS) LOOKUP[normalizeTeamName(team)] = team;

/**
 * Traduce un nombre de la CABB a la clave del fixture.
 * Devuelve null si no hay coincidencia: en ese caso el panel de carga le pide
 * al admin que elija el equipo a mano, en vez de adivinar y ensuciar los datos.
 */
export function mapCabbTeam(raw) {
    const key = normalizeTeamName(raw);
    if (!key) return null;
    if (LOOKUP[key]) return LOOKUP[key];

    // Coincidencia por contención: "CLUB ATLETICO KIMBERLEY DE SANTA FE"
    // sigue reconociéndose como KIMBERLEY. Exigimos que el candidato sea
    // suficientemente largo para no confundir "SANTA FE" con "REGATAS SF".
    const candidates = Object.keys(LOOKUP).filter(
        (k) => k.length >= 6 && (key.includes(k) || k.includes(key))
    );
    if (candidates.length === 1) return LOOKUP[candidates[0]];

    return null;
}

/**
 * Sugerencias ordenadas para el desplegable de corrección manual: primero los
 * equipos cuyo nombre comparte más palabras con el texto del Excel.
 */
export function suggestTeams(raw) {
    const words = new Set(normalizeTeamName(raw).split(" ").filter((w) => w.length > 2));
    return [...TEAMS]
        .map((team) => {
            const teamWords = normalizeTeamName(team).split(" ");
            const score = teamWords.filter((w) => words.has(w)).length;
            return { team, score };
        })
        .sort((a, b) => b.score - a.score)
        .map((x) => x.team);
}
