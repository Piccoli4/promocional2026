import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

/*
 * Reprogramaciones de la fase regular, en dos niveles:
 * - "roundDates": día de toda una fecha (ID = número de fecha, ej: "6").
 * - "matchDates": día de un partido suelto (ID = id del partido, ej: "6-3").
 *   Tiene prioridad sobre el día de su fecha.
 */

async function saveDate(collectionName, id, date) {
    await setDoc(doc(db, collectionName, String(id)), {
        date,
        updatedAt: new Date().toISOString(),
    });
}

/** Reprograma una fecha completa. @param {string} date "AAAA-MM-DD" */
export const saveRoundDate = (round, date) => saveDate("roundDates", round, date);

/** La fecha vuelve al día del calendario por defecto. */
export const deleteRoundDate = (round) => deleteDoc(doc(db, "roundDates", String(round)));

/** Reprograma un partido suelto. @param {string} date "AAAA-MM-DD" */
export const saveMatchDate = (matchId, date) => saveDate("matchDates", matchId, date);

/** El partido vuelve a jugarse el día de su fecha. */
export const deleteMatchDate = (matchId) => deleteDoc(doc(db, "matchDates", matchId));
