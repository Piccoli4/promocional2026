import { useState, useEffect } from "react";
import { formatDateLong } from "../../data/fixture";

/**
 * Selector de día con Guardar / Restablecer, para reprogramar una fecha
 * completa o un partido suelto.
 * - date:        día vigente (ISO "AAAA-MM-DD")
 * - defaultDate: día que corresponde si no hay reprogramación
 * - onSave(iso): guarda el día elegido (el padre decide si es el por defecto)
 * - onReset():   quita la reprogramación
 * - compact:     versión chica para ir dentro de la tarjeta de un partido
 */
export default function DateEditor({ label, date, defaultDate, onSave, onReset, compact = false }) {
    const [value, setValue] = useState(date ?? "");
    const [busy, setBusy] = useState(null); // "save" | "reset"
    const [feedback, setFeedback] = useState(null);

    // Sincroniza cuando llega un cambio en tiempo real o se cambia de fecha
    useEffect(() => {
        setValue(date ?? "");
    }, [date]);

    const flash = (type) => {
        setFeedback(type);
        setTimeout(() => setFeedback(null), 2500);
    };

    const run = async (kind, action) => {
        setBusy(kind);
        try {
            await action();
            flash(kind === "save" ? "saved" : "reset");
        } catch (err) {
            console.error(err);
            flash("error");
        } finally {
            setBusy(null);
        }
    };

    const rescheduled = !!date && date !== defaultDate;
    const dirty = value !== "" && value !== date;

    const messages = {
        saved: { text: "✓ Día guardado", color: "var(--ok)" },
        reset: { text: "Vuelve al día original", color: "var(--ok)" },
        error: { text: "✗ No se pudo guardar", color: "var(--danger)" },
    };

    const small = "cond text-[0.6rem] font-bold uppercase tracking-[0.14em]";

    return (
        <div className={compact ? "flex flex-col gap-2 border-t pt-3" : "nm nm-edge a-rise flex flex-col gap-3 p-4"}
            style={compact ? { borderColor: "var(--line)" } : undefined}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={compact ? small : "eyebrow"} style={compact ? { color: "var(--text-3)" } : undefined}>
                    {label}
                </span>
                <span className={small} style={{ color: rescheduled ? "var(--red)" : "var(--text-3)" }}>
                    {rescheduled ? `Reprogramado · original ${formatDateLong(defaultDate)}` : "Según calendario"}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <input
                    type="date"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    aria-label={label}
                    className={`nm-input min-w-0 flex-1 px-3 ${compact ? "py-1.5 text-sm" : "py-2 text-base"}`}
                />
                <button
                    onClick={() => run("save", () => onSave(value))}
                    disabled={!dirty || busy !== null}
                    className={`nm-btn text-xs disabled:opacity-40 ${compact ? "px-3 py-2" : "px-4 py-2.5"}`}
                >
                    {busy === "save" ? "…" : "Guardar"}
                </button>
                {rescheduled && (
                    <button
                        onClick={() => run("reset", onReset)}
                        disabled={busy !== null}
                        className={`nm-btn text-xs disabled:opacity-40 ${compact ? "px-3 py-2" : "px-4 py-2.5"}`}
                    >
                        {busy === "reset" ? "…" : "Restablecer"}
                    </button>
                )}
            </div>

            {feedback && (
                <span className={small} style={{ color: messages[feedback].color }}>
                    {messages[feedback].text}
                </span>
            )}
        </div>
    );
}
