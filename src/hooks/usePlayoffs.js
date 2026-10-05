// src/hooks/usePlayoffs.js
import { useMemo } from "react";
import { computeBracket } from "../utils/playoffCalculator";
import { useStandings } from "./useStandings";
import { almacenDeColeccion } from "./liveStore";

const useResultadosPlayoffs = almacenDeColeccion("playoff_results");

/**
 * Devuelve los resultados de playoffs en tiempo real desde Firestore
 * y el bracket calculado en base a la tabla de posiciones actual.
 */
export function usePlayoffs() {
    const { data: playoffResults, loading, error } = useResultadosPlayoffs();
    const { standings, loading: standingsLoading } = useStandings();

    const top12 = useMemo(() => standings.slice(0, 12), [standings]);
    const top8   = useMemo(() => top12.slice(0, 8),     [top12]);

    const bracket = useMemo(
        () => computeBracket(top12, playoffResults),
        [top12, playoffResults]
    );

    return {
        bracket,
        top8,
        top12,
        playoffResults,
        loading: loading || standingsLoading,
        error,
    };
}
