import { useMemo, useSyncExternalStore } from "react";
import { suscribirAgregado } from "../services/statsService";
import { conDerivados } from "../utils/statsCalculator";

/**
 * Almacén compartido del documento agregado.
 *
 * Hay muchos componentes que quieren saber si un partido tiene planilla (cada
 * tarjeta del fixture, por ejemplo). Si cada uno abriera su propio `onSnapshot`
 * tendríamos decenas de suscripciones a Firestore por pantalla. Con un único
 * listener a nivel de módulo, todos leen del mismo lugar.
 */

let estado = { agregado: null, loading: true, error: null };
const oyentes = new Set();
let desuscribir = null;

function emitir(siguiente) {
    estado = siguiente;
    for (const oyente of oyentes) oyente();
}

function suscribir(oyente) {
    oyentes.add(oyente);

    if (!desuscribir) {
        desuscribir = suscribirAgregado(
            (data) => emitir({ agregado: data, loading: false, error: null }),
            (error) => emitir({ agregado: null, loading: false, error })
        );
    }

    return () => {
        oyentes.delete(oyente);
        // Sin nadie escuchando cerramos el listener; el próximo montaje lo reabre.
        if (oyentes.size === 0 && desuscribir) {
            desuscribir();
            desuscribir = null;
            estado = { agregado: null, loading: true, error: null };
        }
    };
}

const leer = () => estado;

function useAgregado() {
    return useSyncExternalStore(suscribir, leer, leer);
}

/* ── Hooks públicos ──────────────────────────────────────────────────── */

/** Estadísticas del torneo, ya sumadas y con los derivados calculados. */
export function useStats() {
    const { agregado, loading, error } = useAgregado();

    const jugadores = useMemo(
        () => (agregado?.jugadores ?? []).map(conDerivados),
        [agregado]
    );

    const equipos = useMemo(
        () => (agregado?.equipos ?? []).map(conDerivados),
        [agregado]
    );

    return {
        jugadores,
        equipos,
        partidos: agregado?.partidos ?? 0,
        fases: agregado?.fases ?? { regular: 0, playoffs: 0 },
        ids: agregado?.ids ?? [],
        actualizado: agregado?.actualizado ?? null,
        hayDatos: (agregado?.partidos ?? 0) > 0,
        loading,
        error,
    };
}

/** Un jugador concreto, con sus derivados y el registro partido a partido. */
export function usePlayer(playerId) {
    const { jugadores, loading, error } = useStats();
    const jugador = useMemo(
        () => jugadores.find((j) => j.id === playerId) ?? null,
        [jugadores, playerId]
    );
    return { jugador, loading, error };
}

/**
 * Conjunto de partidos que ya tienen planilla, para decidir si mostrar el
 * enlace al box score. Es una lectura barata: sale del mismo documento agregado.
 */
export function useMatchesWithStats() {
    const { agregado } = useAgregado();
    return useMemo(() => new Set(agregado?.ids ?? []), [agregado]);
}
