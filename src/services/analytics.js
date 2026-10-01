/**
 * Eventos propios para Google Analytics. `gtag` se define en index.html; si un
 * bloqueador frenó el script de Google, los eventos se encolan y no salen,
 * que es lo que queremos: medir nunca puede romper la app.
 *
 * Los nombres son los que aparecen en Analytics (Informes → Interacción →
 * Eventos), por eso van en castellano.
 */
export function trackEvent(name, params = {}) {
    try {
        window.gtag?.("event", name, params);
    } catch {
        // Nada que hacer: sin Analytics la app funciona igual.
    }
}
