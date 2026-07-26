import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

/**
 * Guarda o actualiza el resultado de un partido de la fase final.
 * Los IDs siguen los patrones: pi1g1..pi4g3, qf1g1..qf4g3, sf1g1..sf2g3,
 * fg1..fg3, p34, g58a, g58b, p56, p78, repo1a..repo3b.
 */
export async function savePlayoffResult(matchId, homeScore, awayScore, walkover = null) {
    const ref = doc(db, "playoff_results", matchId);
    await setDoc(ref, {
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        walkover: walkover ?? null,
        updatedAt: new Date().toISOString(),
    });
}

/** Elimina el resultado de un partido de la fase final. */
export async function deletePlayoffResult(matchId) {
    await deleteDoc(doc(db, "playoff_results", matchId));
}
