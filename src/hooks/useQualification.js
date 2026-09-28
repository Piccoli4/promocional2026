import { useEffect, useState } from "react";
import { FIXTURE } from "../data/fixture";
import { analyzeQualification } from "../utils/qualificationCalculator";
import { useFixture } from "./useFixture";

/**
 * Análisis de "¿qué necesita cada equipo?" en tiempo real.
 * Se calcula en un Web Worker; si llega un resultado nuevo mientras
 * calcula, el cálculo viejo se descarta.
 *
 * @returns {{ analysis: Object|null, loading: boolean }}
 */
export function useQualification() {
    const { results, loading: resultsLoading } = useFixture();
    const [state, setState] = useState({ results: null, analysis: null });

    useEffect(() => {
        if (resultsLoading) return;

        const worker = new Worker(new URL("../workers/qualification.worker.js", import.meta.url), {
            type: "module",
        });
        worker.onmessage = (event) => setState({ results, analysis: event.data });
        // Si el navegador no puede levantar el worker, se calcula acá.
        worker.onerror = () => setState({ results, analysis: analyzeQualification(results, FIXTURE) });
        worker.postMessage(results);

        return () => worker.terminate();
    }, [results, resultsLoading]);

    return {
        analysis: state.analysis,
        loading: resultsLoading || state.results !== results,
    };
}
