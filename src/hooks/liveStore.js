import { useSyncExternalStore } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

/**
 * Almacenes compartidos para los listeners de Firestore.
 *
 * Cada página que pedía el fixture abría sus propios `onSnapshot` y arrancaba
 * en "cargando", así que al pasar de una pantalla a otra se volvía a esperar
 * al servidor. Con un almacén por colección:
 *
 *   - hay un único listener, lo use un componente o veinte;
 *   - el último dato se conserva: al volver a una página se ve al instante;
 *   - el listener sigue abierto un rato después de salir, para que ir y volver
 *     (fixture → planilla → fixture) no lo cierre y lo reabra.
 */

// Margen antes de cerrar un listener que se quedó sin nadie escuchando.
const GRACIA_MS = 60_000;

/**
 * @param {(onData: Function, onError: Function) => Function} abrir
 *        abre el listener y devuelve la función para cerrarlo
 * @param {*} inicial valor de `data` mientras no llega nada
 * @returns un hook que devuelve { data, loading, error }
 */
export function crearAlmacenEnVivo(abrir, inicial) {
    let estado = { data: inicial, loading: true, error: null };
    const oyentes = new Set();
    let cerrar = null;
    let temporizador = null;

    function emitir(cambios) {
        estado = { ...estado, ...cambios };
        for (const oyente of oyentes) oyente();
    }

    function suscribir(oyente) {
        oyentes.add(oyente);
        clearTimeout(temporizador);

        if (!cerrar) {
            cerrar = abrir(
                (data) => emitir({ data, loading: false, error: null }),
                (error) => {
                    // Firestore ya cortó el listener: el próximo montaje reintenta.
                    cerrar = null;
                    emitir({ loading: false, error });
                }
            );
        }

        return () => {
            oyentes.delete(oyente);
            if (oyentes.size > 0) return;
            temporizador = setTimeout(() => {
                cerrar?.();
                cerrar = null;
            }, GRACIA_MS);
        };
    }

    const leer = () => estado;

    return function useAlmacenEnVivo() {
        return useSyncExternalStore(suscribir, leer, leer);
    };
}

/**
 * Almacén de una colección entera como mapa { id: valor }.
 * @param {string} nombre      colección de Firestore
 * @param {Function} [mapear]  qué guardar de cada documento (por defecto, todo)
 */
export function almacenDeColeccion(nombre, mapear = (data) => data) {
    return crearAlmacenEnVivo(
        (onData, onError) =>
            onSnapshot(
                collection(db, nombre),
                (snapshot) => {
                    const data = {};
                    snapshot.forEach((doc) => {
                        data[doc.id] = mapear(doc.data());
                    });
                    onData(data);
                },
                (err) => {
                    console.error(`Error al obtener "${nombre}":`, err);
                    onError(err);
                }
            ),
        {}
    );
}
