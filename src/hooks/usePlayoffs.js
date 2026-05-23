// src/hooks/usePlayoffs.js
import { useEffect, useState, useMemo } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { computeBracket } from "../utils/playoffCalculator";
import { useStandings } from "./useStandings";

/**
 * Devuelve los resultados de playoffs en tiempo real desde Firestore
 * y el bracket calculado en base a la tabla de posiciones actual.
 */
export function usePlayoffs() {
    const [playoffResults, setPlayoffResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { standings, loading: standingsLoading } = useStandings();

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, "playoff_results"),
            (snapshot) => {
                const data = {};
                snapshot.forEach((doc) => {
                    data[doc.id] = doc.data();
                });
                setPlayoffResults(data);
                setLoading(false);
            },
            (err) => {
                console.error("Error al obtener resultados de playoffs:", err);
                setError(err);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

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