// src/hooks/useFixture.js

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { FIXTURE } from "../data/fixture";

/**
 * Retorna el fixture completo con los resultados
 * obtenidos en tiempo real desde Firebase.
 */
export function useFixture() {
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Escuchamos la colección "results" en Firestore en tiempo real
        const unsubscribe = onSnapshot(
            collection(db, "results"),
            (snapshot) => {
                const data = {};
                snapshot.forEach((doc) => {
                    // Cada documento tiene como ID el id del partido (ej: "1-1")
                    data[doc.id] = doc.data();
                });
                setResults(data);
                setLoading(false);
            },
            (err) => {
                console.error("Error al obtener resultados:", err);
                setError(err);
                setLoading(false);
            }
        );

        // Limpia el listener cuando el componente se desmonta
        return () => unsubscribe();
    }, []);

    // Combinamos el fixture estático con los resultados dinámicos de Firebase
    const fixtureWithResults = FIXTURE.map((round) => ({
        ...round,
        matches: round.matches.map((match) => ({
            ...match,
            result: results[match.id] || null,
        })),
    }));

    return { fixtureWithResults, results, loading, error };
}