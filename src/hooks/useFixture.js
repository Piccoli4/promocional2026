// src/hooks/useFixture.js

import { useMemo } from "react";
import { FIXTURE } from "../data/fixture";
import { almacenDeColeccion } from "./liveStore";

// Un único listener por colección para toda la app (ver liveStore.js).
// Cada documento de "results" tiene como ID el id del partido (ej: "1-1").
const useResultados = almacenDeColeccion("results");
// Reprogramaciones cargadas desde el admin: días de fechas completas
// ("roundDates") y de partidos sueltos ("matchDates"), como { id: "AAAA-MM-DD" }.
// Si falla la lectura seguimos con el calendario por defecto.
const useFechasDeRonda = almacenDeColeccion("roundDates", (doc) => doc.date);
const useFechasDePartido = almacenDeColeccion("matchDates", (doc) => doc.date);

/**
 * Retorna el fixture completo con los resultados y las fechas reprogramadas
 * obtenidos en tiempo real desde Firebase.
 */
export function useFixture() {
    const { data: results, loading, error } = useResultados();
    const { data: roundDates } = useFechasDeRonda();
    const { data: matchDates } = useFechasDePartido();

    // Combinamos el fixture estático con los resultados y reprogramaciones de Firebase.
    // Prioridad del día de un partido: el suyo propio > el de su fecha > el calendario.
    const fixtureWithResults = useMemo(
        () =>
            FIXTURE.map((round) => {
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
            }),
        [results, roundDates, matchDates]
    );

    return { fixtureWithResults, results, loading, error };
}
