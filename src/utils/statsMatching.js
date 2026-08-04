/**
 * Empareja una planilla de la CABB con el partido que le corresponde.
 *
 * El Excel no trae ni fecha ni identificador de partido: lo único que lo ata
 * al torneo son los dos equipos. Con 12 equipos que juegan una sola vez por
 * fecha, el par de equipos identifica el partido sin ambigüedad en la fase
 * regular. En playoffs una misma serie repite el cruce hasta tres veces, así
 * que ahí la propuesta se limita a los juegos que todavía no tienen planilla.
 */

import { bracketSections } from "./playoffCalculator.js";

/**
 * Aplana el fixture y el bracket en una lista única de partidos cargables.
 *
 * @param {Array} fixture  salida de `useFixture().fixtureWithResults`
 * @param {Object} bracket salida de `usePlayoffs().bracket` (puede ser null)
 * @returns {Array<{id, fase, fecha, etiqueta, grupo, home, away, result}>}
 */
export function listarPartidos(fixture = [], bracket = null) {
    const partidos = [];

    for (const ronda of fixture) {
        for (const match of ronda.matches) {
            partidos.push({
                id: match.id,
                fase: "regular",
                fecha: ronda.round,
                grupo: ronda.label,
                etiqueta: `${match.home} vs ${match.away}`,
                home: match.home,
                away: match.away,
                result: match.result ?? null,
            });
        }
    }

    if (bracket) {
        for (const seccion of bracketSections(bracket)) {
            const juegos = [
                ...seccion.series.flatMap((s) => (s?.ready ? s.games : [])),
                ...seccion.games.filter(Boolean),
            ];

            for (const juego of juegos) {
                if (!juego?.home || !juego?.away) continue; // cruce sin definir
                partidos.push({
                    id: juego.id,
                    fase: "playoffs",
                    fecha: null,
                    grupo: seccion.title,
                    etiqueta: `${juego.home} vs ${juego.away}${juego.num ? ` (J${juego.num})` : ""}`,
                    home: juego.home,
                    away: juego.away,
                    result: juego.result ?? null,
                });
            }
        }
    }

    return partidos;
}

/**
 * Busca el partido que corresponde a un par de equipos.
 *
 * Devuelve también si la localía viene invertida respecto del fixture: pasa
 * cuando se reprograma un partido y se cambia la cancha, y conviene que el
 * admin lo vea antes de guardar en vez de que pase inadvertido.
 *
 * @param {Array} partidos      salida de `listarPartidos`
 * @param {string} local        clave del equipo que figura primero en el Excel
 * @param {string} visitante    clave del segundo equipo
 * @param {Object} yaCargados   mapa matchId → planilla existente
 * @returns {{ partido: object, invertido: boolean, alternativas: object[] } | null}
 */
export function emparejar(partidos, local, visitante, yaCargados = {}) {
    if (!local || !visitante || local === visitante) return null;

    const coincidencias = partidos.filter(
        (p) =>
            (p.home === local && p.away === visitante) ||
            (p.home === visitante && p.away === local)
    );
    if (coincidencias.length === 0) return null;

    // Con varias opciones (una serie de playoffs) proponemos el primer juego
    // que todavía no tenga estadísticas cargadas.
    const libres = coincidencias.filter((p) => !yaCargados[p.id]);
    const elegido = libres[0] ?? coincidencias[0];

    return {
        partido: elegido,
        invertido: elegido.home !== local,
        alternativas: coincidencias,
    };
}

/**
 * Compara el marcador que trae la planilla con el resultado ya cargado a mano.
 * No corrige nada: solo describe la discrepancia para mostrarla.
 */
export function compararMarcador(partido, ptsLocal, ptsVisitante, invertido) {
    if (!partido?.result) return null;

    const { homeScore, awayScore } = partido.result;
    const ptsHome = invertido ? ptsVisitante : ptsLocal;
    const ptsAway = invertido ? ptsLocal : ptsVisitante;

    if (Number(homeScore) === ptsHome && Number(awayScore) === ptsAway) return null;

    return {
        cargado: `${homeScore}-${awayScore}`,
        planilla: `${ptsHome}-${ptsAway}`,
    };
}
