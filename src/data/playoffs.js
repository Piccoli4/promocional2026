/**
 * Calendario y metadatos de la Fase Final — Torneo Oficial Promocional 2026.
 * Fuente: reglamento ASB (páginas 1 y 2) + planilla oficial.
 * La fase regular terminó una semana más tarde (25/10), así que todo el
 * calendario se corrió dos semanas: el Play In arrancó el 01/11.
 */

export const PLAYOFF_DATES = {
    playIn: ["2026-11-01", "2026-11-08", "2026-11-10"],
    quarters: ["2026-11-15", "2026-11-22", "2026-11-24"],
    semis: ["2026-11-29", "2026-12-06", "2026-12-08"],
    final: ["2026-12-13", "2026-12-19", "2026-12-26"],
    // Cruces 5°–8°: a un solo juego
    semis58: "2026-11-29",
    place56: "2026-12-06",
    place78: "2026-12-06",
    place34: "2026-12-13",
    // Reposicionamiento 9°–12°: round robin de 3 jornadas
    repo: ["2026-11-15", "2026-11-22", "2026-11-29"],
};

export const STAGES = {
    playIn: { key: "playIn", name: "Play In", short: "Play In" },
    quarters: { key: "quarters", name: "Cuartos de Final", short: "Cuartos" },
    semis: { key: "semis", name: "Semifinales", short: "Semis" },
    final: { key: "final", name: "Final", short: "Final" },
    bracket58: { key: "bracket58", name: "Puestos 5° a 8°", short: "5°–8°" },
    repo: { key: "repo", name: "Reposicionamiento 9° a 12°", short: "9°–12°" },
};

/**
 * Nombre legible de un juego de la fase final a partir de su id
 * (el mismo que arma playoffCalculator): "pi2g1" → "Play In · J1".
 */
export function etiquetaJuegoPlayoff(id = "") {
    const serie = id.match(/^(pi|qf|sf|f)\d*g(\d)$/);
    if (serie) {
        const etapa = { pi: STAGES.playIn, qf: STAGES.quarters, sf: STAGES.semis, f: STAGES.final }[serie[1]];
        return `${etapa.short} · J${serie[2]}`;
    }

    const repo = id.match(/^repo(\d)[ab]$/);
    if (repo) return `Reposicionamiento · ${repo[1]}ª jornada`;

    return (
        {
            p34: "Tercer puesto",
            g58a: "Puestos 5° a 8°",
            g58b: "Puestos 5° a 8°",
            p56: "Quinto puesto",
            p78: "Séptimo puesto",
        }[id] ?? "Fase Final"
    );
}

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
