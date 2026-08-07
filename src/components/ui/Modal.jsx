import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";

/**
 * Shell de diálogo: portal, cierre por Escape y por click en el fondo,
 * bloqueo del scroll, foco inicial y Tab atrapado adentro.
 *
 * Va por `createPortal` sobre el body para que ningún `overflow` o `transform`
 * de los contenedores padres lo recorte.
 */
export default function Modal({ titulo, accion, onCerrar, children, alFondoEnMovil = true }) {
    const panel = useRef(null);
    const idTitulo = useId();

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape") {
                onCerrar();
                return;
            }
            if (e.key !== "Tab" || !panel.current) return;

            const focosables = panel.current.querySelectorAll(
                'button:not([disabled]), a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focosables.length === 0) return;

            const primero = focosables[0];
            const ultimo = focosables[focosables.length - 1];

            if (e.shiftKey && document.activeElement === primero) {
                e.preventDefault();
                ultimo.focus();
            } else if (!e.shiftKey && document.activeElement === ultimo) {
                e.preventDefault();
                primero.focus();
            }
        };

        document.addEventListener("keydown", onKey);

        const overflowPrevio = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        // Foco en el primer control del panel, no en el documento.
        panel.current?.querySelector("button, a[href], input")?.focus();

        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = overflowPrevio;
        };
    }, [onCerrar]);

    return createPortal(
        <div
            /* La franja inferior respeta el indicador de inicio del iPhone: sin
               esto el último elemento de la hoja queda tapado. */
            className={`fixed inset-0 z-50 flex justify-center p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${alFondoEnMovil ? "items-end sm:items-center" : "items-center"
                }`}
            style={{ background: "rgba(6,6,26,0.62)", backdropFilter: "blur(6px)" }}
            onClick={onCerrar}
        >
            <div
                ref={panel}
                role="dialog"
                aria-modal="true"
                aria-labelledby={idTitulo}
                onClick={(e) => e.stopPropagation()}
                className="nm-lg nm-edge a-sheet flex w-full max-w-sm flex-col gap-4 p-5"
                style={{ maxHeight: "92vh", overflowY: "auto" }}
            >
                <div className="flex items-baseline justify-between gap-3">
                    <h2 id={idTitulo} className="display text-2xl" style={{ color: "var(--text-1)" }}>
                        {titulo}
                    </h2>
                    {accion && <div className="shrink-0">{accion}</div>}
                </div>

                {children}
            </div>
        </div>,
        document.body
    );
}
