// src/hooks/useStandings.js

import { useMemo } from "react";
import { FIXTURE } from "../data/fixture";
import { calculateStandings } from "../utils/standingsCalculator";
import { useFixture } from "./useFixture";

/**
 * Retorna la tabla de posiciones calculada
 * a partir de los resultados en tiempo real.
 */
export function useStandings() {
    const { results, loading, error } = useFixture();

    // useMemo evita recalcular la tabla si los resultados no cambiaron
    const standings = useMemo(() => {
        return calculateStandings(results, FIXTURE);
    }, [results]);

    return { standings, loading, error };
}
