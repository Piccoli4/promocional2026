// src/hooks/useFixture.js

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";
import { FIXTURE } from "../data/fixture";

/**
 * Escucha en tiempo real una colección de reprogramaciones ({ id: "AAAA-MM-DD" }).
 * Si falla la lectura seguimos con el calendario por defecto.
 */
function useDateOverrides(collectionName) {
    const [dates, setDates] = useState({});

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, collectionName),
            (snapshot) => {
                const data = {};
                snapshot.forEach((doc) => {
                    data[doc.id] = doc.data().date;
                });
                setDates(data);
            },
            (err) => console.error(`Error al obtener "${collectionName}":`, err)
        );

        return () => unsubscribe();
    }, [collectionName]);

    return dates;
}

/**
 * Retorna el fixture completo con los resultados y las fechas reprogramadas
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

    // Reprogramaciones cargadas desde el admin: días de fechas completas
    // ("roundDates") y de partidos sueltos ("matchDates").
    const roundDates = useDateOverrides("roundDates");
    const matchDates = useDateOverrides("matchDates");

    // Combinamos el fixture estático con los resultados y reprogramaciones de Firebase.
    // Prioridad del día de un partido: el suyo propio > el de su fecha > el calendario.
    const fixtureWithResults = FIXTURE.map((round) => {
        const roundDate = roundDates[String(round.round)] || round.date;
        return {
            ...round,
            date: roundDate,
            defaultDate: round.date,
            rescheduled: roundDate !== round.date,
            matches: round.matches.map((match) => {
                const date = matchDates[match.id] || roundDate;
                return {
                    ...match,
                    date,
                    rescheduled: date !== roundDate,
                    result: results[match.id] || null,
                };
            }),
        };
    });

    return { fixtureWithResults, results, loading, error };
}
