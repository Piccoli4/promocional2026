import { useMemo } from "react";
import { suscribirAgregado } from "../services/statsService";
import { conDerivados } from "../utils/statsCalculator";
import { crearAlmacenEnVivo } from "./liveStore";

/**
 * Almacén compartido del documento agregado.
 *
 * Hay muchos componentes que quieren saber si un partido tiene planilla (cada
 * tarjeta del fixture, por ejemplo). Si cada uno abriera su propio `onSnapshot`
 * tendríamos decenas de suscripciones a Firestore por pantalla. Con un único
 * listener a nivel de módulo, todos leen del mismo lugar.
 */
const useAlmacenAgregado = crearAlmacenEnVivo(suscribirAgregado, null);

function useAgregado() {
    const { data, loading, error } = useAlmacenAgregado();
    return { agregado: data, loading, error };
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
