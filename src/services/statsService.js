/**
 * Persistencia de las estadísticas de partido.
 *
 * Dos colecciones, con responsabilidades distintas:
 *
 *   matchStats/{matchId}        una planilla completa por partido. Es la fuente
 *                               de verdad y lo que alimenta el box score.
 *   statsAggregates/current     un único documento con los totales ya sumados.
 *
 * El agregado existe por una razón concreta: al final del torneo habrá más de
 * 70 planillas y la mayoría de los usuarios entra desde el celular. Leer el
 * agregado es una lectura de ~100 kB en vez de 70 lecturas de ~8 kB cada una.
 * Se recalcula cuando el admin guarda o borra, nunca desde la app pública.
 *
 * IMPORTANTE: nada de esto toca la colección `results`. El marcador se sigue
 * cargando a mano desde `MatchResultForm` y las posiciones no se ven afectadas.
 */

import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    setDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { agregarEstadisticas } from "../utils/statsCalculator";

const COL_PARTIDOS = "matchStats";
const COL_AGREGADO = "statsAggregates";
const DOC_AGREGADO = "current";

/* ── Escritura (solo admin) ──────────────────────────────────────────── */

/**
 * Guarda la planilla de un partido y recalcula el agregado.
 *
 * @param {string} matchId  id del fixture ("4-3") o del playoff ("qf1g2")
 * @param {object} datos    { fase, fecha, local, visitante, equipos, origen }
 */
export async function guardarEstadisticasPartido(matchId, datos) {
    await setDoc(doc(db, COL_PARTIDOS, matchId), {
        ...datos,
        matchId,
        actualizado: new Date().toISOString(),
    });
    await recalcularAgregado();
}

/** Guarda varias planillas de una y recalcula el agregado una sola vez al final. */
export async function guardarVariasPlanillas(planillas) {
    for (const { matchId, datos } of planillas) {
        await setDoc(doc(db, COL_PARTIDOS, matchId), {
            ...datos,
            matchId,
            actualizado: new Date().toISOString(),
        });
    }
    await recalcularAgregado();
}

export async function borrarEstadisticasPartido(matchId) {
    await deleteDoc(doc(db, COL_PARTIDOS, matchId));
    await recalcularAgregado();
}

/**
 * Relee todas las planillas, recalcula totales y reescribe el agregado.
 * Es la única operación cara del sistema, y solo la ejecuta el admin.
 */
export async function recalcularAgregado() {
    const snapshot = await getDocs(collection(db, COL_PARTIDOS));
    const partidos = snapshot.docs.map((d) => d.data());
    const agregado = agregarEstadisticas(partidos);

    await setDoc(doc(db, COL_AGREGADO, DOC_AGREGADO), {
        ...agregado,
        actualizado: new Date().toISOString(),
    });

    return agregado;
}

/* ── Lectura ─────────────────────────────────────────────────────────── */

/** Escucha el documento agregado. Devuelve la función para desuscribirse. */
export function suscribirAgregado(onData, onError) {
    return onSnapshot(
        doc(db, COL_AGREGADO, DOC_AGREGADO),
        (snap) => onData(snap.exists() ? snap.data() : null),
        (error) => {
            console.error("Error al leer las estadísticas agregadas:", error);
            onError?.(error);
        }
    );
}

/** Planilla completa de un partido, para el box score. */
export async function obtenerEstadisticasPartido(matchId) {
    const snap = await getDoc(doc(db, COL_PARTIDOS, matchId));
    return snap.exists() ? snap.data() : null;
}

/** Lista liviana de qué partidos ya tienen planilla, para el panel de admin. */
export function suscribirPartidosCargados(onData) {
    return onSnapshot(collection(db, COL_PARTIDOS), (snap) => {
        const mapa = {};
        snap.forEach((d) => {
            const data = d.data();
            mapa[d.id] = {
                matchId: d.id,
                fase: data.fase,
                fecha: data.fecha,
                local: data.local,
                visitante: data.visitante,
                actualizado: data.actualizado,
                origen: data.origen,
                jugadores:
                    (data.equipos ?? []).reduce((acc, e) => acc + (e.jugadores?.length ?? 0), 0),
            };
        });
        onData(mapa);
    });
}
