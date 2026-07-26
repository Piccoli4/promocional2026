import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Guarda o actualiza el resultado de un partido de la fase regular.
 * @param {string} matchId   ID del partido (ej: "1-1")
 * @param {number} homeScore Puntos del local
 * @param {number} awayScore Puntos del visitante
 * @param {"home"|"away"|null} walkover Equipo que no se presentó (partido perdido por default)
 */
export async function saveResult(matchId, homeScore, awayScore, walkover = null) {
    const ref = doc(db, "results", matchId);
    await setDoc(ref, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        walkover: walkover ?? null,
        updatedAt: new Date().toISOString(),
    });
}

/** Elimina el resultado de un partido de la fase regular. */
export async function deleteResult(matchId) {
    await deleteDoc(doc(db, "results", matchId));
}
