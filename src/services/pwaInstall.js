/**
 * Instalación de la PWA: detección de plataforma, captura del evento nativo
 * y estado compartido.
 *
 * `beforeinstallprompt` se dispara apenas carga la página, muchas veces antes
 * de que React monte. Si lo escucháramos recién desde un efecto, en una visita
 * repetida con el service worker caliente el evento ya pasó y no habría forma
 * de ofrecer la instalación. Por eso `iniciarCaptura()` se llama desde
 * `main.jsx`, antes de renderizar.
 */

const CLAVE_DESCARTE = "pwa_install_dismissed";
const CLAVE_INSTALADA = "pwa_instalada";
const DIAS_ESPERA = 14;

/* Safari en modo privado tira excepción al tocar localStorage. */
function leer(clave) {
    try {
        return localStorage.getItem(clave);
    } catch {
        return null;
    }
}

function escribir(clave, valor) {
    try {
        localStorage.setItem(clave, valor);
    } catch {
        /* Sin persistencia: el modal volverá a aparecer, no es grave. */
    }
}

/* ── Plataforma ────────────────────────────────────────────────────── */

// iPadOS 13+ se hace pasar por Mac: hay que mirar los puntos táctiles.
export const esIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const esAndroid = /Android/.test(navigator.userAgent);

export const esMovil = esIOS || esAndroid;

export function yaInstalada() {
    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone === true ||
        leer(CLAVE_INSTALADA) === "1"
    );
}

/* ── Descarte ──────────────────────────────────────────────────────── */

export function descartadaHacePoco() {
    const ts = leer(CLAVE_DESCARTE);
    if (!ts) return false;
    const dias = (Date.now() - Number.parseInt(ts, 10)) / 86_400_000;
    return Number.isFinite(dias) && dias < DIAS_ESPERA;
}

export function registrarDescarte() {
    escribir(CLAVE_DESCARTE, String(Date.now()));
}

/* ── Evento nativo ─────────────────────────────────────────────────── */

let evento = null;
let instalada = false;
const oyentes = new Set();

function avisar() {
    for (const fn of oyentes) fn();
}

export function iniciarCaptura() {
    window.addEventListener("beforeinstallprompt", (e) => {
        // Sin esto Chrome muestra su propia barrita, que no podemos estilar.
        e.preventDefault();
        evento = e;
        avisar();
    });

    window.addEventListener("appinstalled", () => {
        evento = null;
        instalada = true;
        escribir(CLAVE_INSTALADA, "1");
        avisar();
    });
}

export function suscribir(fn) {
    oyentes.add(fn);
    return () => {
        oyentes.delete(fn);
    };
}

/** Instantánea primitiva y estable, como pide `useSyncExternalStore`. */
export function instantanea() {
    return `${evento ? 1 : 0}|${instalada ? 1 : 0}`;
}

export function hayPrompt() {
    return evento !== null;
}

export function fueInstalada() {
    return instalada;
}

/** 'accepted' | 'dismissed' | 'no-disponible' */
export async function lanzarPrompt() {
    if (!evento) return "no-disponible";
    const actual = evento;
    actual.prompt();
    const { outcome } = await actual.userChoice;
    // El evento se consume: no se puede volver a usar el mismo.
    evento = null;
    avisar();
    return outcome;
}
