/**
 * Calendario y metadatos de la Fase Final — Torneo Oficial Promocional 2026.
 * Fuente: reglamento ASB (páginas 1 y 2) + planilla oficial.
 */

export const PLAYOFF_DATES = {
    playIn: ["2026-10-18", "2026-10-25", "2026-10-27"],
    quarters: ["2026-11-01", "2026-11-08", "2026-11-10"],
    semis: ["2026-11-15", "2026-11-22", "2026-11-24"],
    final: ["2026-11-29", "2026-12-05", "2026-12-12"],
    // Cruces 5°–8°: a un solo juego
    semis58: "2026-11-15",
    place56: "2026-11-22",
    place78: "2026-11-22",
    place34: "2026-11-29",
    // Reposicionamiento 9°–12°: round robin de 3 jornadas
    repo: ["2026-11-01", "2026-11-08", "2026-11-15"],
};

export const STAGES = {
    playIn: { key: "playIn", name: "Play In", short: "Play In" },
    quarters: { key: "quarters", name: "Cuartos de Final", short: "Cuartos" },
    semis: { key: "semis", name: "Semifinales", short: "Semis" },
    final: { key: "final", name: "Final", short: "Final" },
    bracket58: { key: "bracket58", name: "Puestos 5° a 8°", short: "5°–8°" },
    repo: { key: "repo", name: "Reposicionamiento 9° a 12°", short: "9°–12°" },
};

/** Etiqueta ordinal: 1 → "1°" */
export const ord = (n) => (n == null ? "—" : `${n}°`);

/**
 * Zona de clasificación de un puesto de la tabla:
 * 1° a 4° van directo a Cuartos, 5° a 12° pasan por el Play In.
 */
export function zoneOf(position) {
    return position <= 4
        ? { key: "direct", color: "var(--gold)", label: "Directo a Cuartos" }
        : { key: "playin", color: "var(--red)", label: "Play In" };
}
