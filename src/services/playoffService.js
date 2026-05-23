// src/services/playoffService.js
import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Guarda o actualiza el resultado de un partido de playoffs en Firestore.
 * Los IDs de partidos siguen el patrón: qf1, qf2, qf3, qf4,
 * sf1g1, sf1g2, sf1g3, sf2g1, sf2g2, sf2g3, fg1, fg2, fg3
 */
export async function savePlayoffResult(matchId, homeScore, awayScore) {
    const ref = doc(db, "playoff_results", matchId);
    await setDoc(ref, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Elimina el resultado de un partido de playoffs de Firestore.
 */
export async function deletePlayoffResult(matchId) {
    const ref = doc(db, "playoff_results", matchId);
    await deleteDoc(ref);
}
