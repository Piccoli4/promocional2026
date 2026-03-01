import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Guarda o actualiza el resultado de un partido en Firestore.
 * @param {string} matchId   - ID del partido (ej: "1-1")
 * @param {number} homeScore - Puntos del equipo local
 * @param {number} awayScore - Puntos del equipo visitante
 */
export async function saveResult(matchId, homeScore, awayScore) {
    const ref = doc(db, "results", matchId);
    await setDoc(ref, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Elimina el resultado de un partido de Firestore.
 * @param {string} matchId - ID del partido (ej: "1-1")
 */
export async function deleteResult(matchId) {
    const ref = doc(db, "results", matchId);
    await deleteDoc(ref);
}