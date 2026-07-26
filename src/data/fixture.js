/**
 * TORNEO OFICIAL PROMOCIONAL 2026 — Asociación Santafesina de Básquetbol
 *
 * Fase Regular: zona única, 12 equipos, todos contra todos ida, 11 fechas.
 * Son las vueltas del Torneo Apertura (localía invertida).
 * Del 02/08 al 11/10.
 */

export const TEAMS = [
    "COLÓN SF",
    "COLÓN SJ",
    "REGATAS SF",
    "ALUMNI",
    "U. Y PROGRESO A",
    "U. Y PROGRESO B",
    "ATL. FRANCK A",
    "ATL. FRANCK B",
    "ALIANZA",
    "KIMBERLEY",
    "SANTA ROSA",
    "CENTRAL RINCÓN",
];

/** Fechas de la fase regular (ANEXO II del reglamento). */
export const ROUND_DATES = {
    1: "2026-08-02",
    2: "2026-08-09",
    3: "2026-08-16",
    4: "2026-08-23",
    5: "2026-08-30",
    6: "2026-09-06",
    7: "2026-09-13",
    8: "2026-09-20",
    9: "2026-09-27",
    10: "2026-10-04",
    11: "2026-10-11",
};

const RAW_ROUNDS = [
    [
        ["COLÓN SF", "COLÓN SJ"],
        ["REGATAS SF", "ALUMNI"],
        ["U. Y PROGRESO B", "KIMBERLEY"],
        ["ATL. FRANCK B", "U. Y PROGRESO A"],
        ["ALIANZA", "ATL. FRANCK A"],
        ["CENTRAL RINCÓN", "SANTA ROSA"],
    ],
    [
        ["U. Y PROGRESO A", "ALIANZA"],
        ["U. Y PROGRESO B", "ATL. FRANCK B"],
        ["ALUMNI", "KIMBERLEY"],
        ["COLÓN SJ", "REGATAS SF"],
        ["CENTRAL RINCÓN", "COLÓN SF"],
        ["SANTA ROSA", "ATL. FRANCK A"],
    ],
    [
        ["REGATAS SF", "CENTRAL RINCÓN"],
        ["KIMBERLEY", "COLÓN SJ"],
        ["ALUMNI", "ATL. FRANCK B"],
        ["ALIANZA", "U. Y PROGRESO B"],
        ["ATL. FRANCK A", "U. Y PROGRESO A"],
        ["COLÓN SF", "SANTA ROSA"],
    ],
    [
        ["U. Y PROGRESO B", "ATL. FRANCK A"],
        ["ALUMNI", "ALIANZA"],
        ["ATL. FRANCK B", "COLÓN SJ"],
        ["CENTRAL RINCÓN", "KIMBERLEY"],
        ["COLÓN SF", "REGATAS SF"],
        ["SANTA ROSA", "U. Y PROGRESO A"],
    ],
    [
        ["KIMBERLEY", "COLÓN SF"],
        ["CENTRAL RINCÓN", "ATL. FRANCK B"],
        ["ALIANZA", "COLÓN SJ"],
        ["ATL. FRANCK A", "ALUMNI"],
        ["U. Y PROGRESO A", "U. Y PROGRESO B"],
        ["REGATAS SF", "SANTA ROSA"],
    ],
    [
        ["ALUMNI", "U. Y PROGRESO A"],
        ["COLÓN SJ", "ATL. FRANCK A"],
        ["CENTRAL RINCÓN", "ALIANZA"],
        ["ATL. FRANCK B", "COLÓN SF"],
        ["REGATAS SF", "KIMBERLEY"],
        ["SANTA ROSA", "U. Y PROGRESO B"],
    ],
    [
        ["REGATAS SF", "ATL. FRANCK B"],
        ["ALIANZA", "COLÓN SF"],
        ["ATL. FRANCK A", "CENTRAL RINCÓN"],
        ["U. Y PROGRESO A", "COLÓN SJ"],
        ["U. Y PROGRESO B", "ALUMNI"],
        ["KIMBERLEY", "SANTA ROSA"],
    ],
    [
        ["COLÓN SJ", "U. Y PROGRESO B"],
        ["CENTRAL RINCÓN", "U. Y PROGRESO A"],
        ["COLÓN SF", "ATL. FRANCK A"],
        ["REGATAS SF", "ALIANZA"],
        ["ATL. FRANCK B", "KIMBERLEY"],
        ["SANTA ROSA", "ALUMNI"],
    ],
    [
        ["ALIANZA", "KIMBERLEY"],
        ["ATL. FRANCK A", "REGATAS SF"],
        ["U. Y PROGRESO A", "COLÓN SF"],
        ["U. Y PROGRESO B", "CENTRAL RINCÓN"],
        ["ALUMNI", "COLÓN SJ"],
        ["SANTA ROSA", "ATL. FRANCK B"],
    ],
    [
        ["CENTRAL RINCÓN", "ALUMNI"],
        ["COLÓN SF", "U. Y PROGRESO B"],
        ["REGATAS SF", "U. Y PROGRESO A"],
        ["KIMBERLEY", "ATL. FRANCK A"],
        ["ATL. FRANCK B", "ALIANZA"],
        ["SANTA ROSA", "COLÓN SJ"],
    ],
    [
        ["ATL. FRANCK A", "ATL. FRANCK B"],
        ["U. Y PROGRESO A", "KIMBERLEY"],
        ["U. Y PROGRESO B", "REGATAS SF"],
        ["ALUMNI", "COLÓN SF"],
        ["COLÓN SJ", "CENTRAL RINCÓN"],
        ["ALIANZA", "SANTA ROSA"],
    ],
];

export const FIXTURE = RAW_ROUNDS.map((matches, i) => {
    const round = i + 1;
    return {
        round,
        label: `${round}ª Fecha`,
        date: ROUND_DATES[round],
        matches: matches.map(([home, away], j) => ({
            id: `${round}-${j + 1}`,
            home,
            away,
        })),
    };
});

/** Formatea "2026-08-02" → "02/08/26" sin desfase de zona horaria. */
export function formatDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y.slice(2)}`;
}

/** Formatea "2026-08-02" → "dom 2 ago". */
export function formatDateLong(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d)
        .toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })
        .replace(/\./g, "");
}

export function getRoundDate(roundNumber) {
    return formatDate(ROUND_DATES[roundNumber]);
}
