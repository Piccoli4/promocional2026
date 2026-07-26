/**
 * Piezas reutilizables del sistema neumórfico.
 */

export function SectionTitle({ eyebrow, title, right, className = "" }) {
    return (
        <div className={`flex items-end justify-between gap-4 ${className}`}>
            <div className="min-w-0">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h2
                    className="display truncate text-2xl sm:text-3xl"
                    style={{ color: "var(--text-1)" }}
                >
                    {title}
                </h2>
            </div>
            {right && <div className="shrink-0">{right}</div>}
        </div>
    );
}

export function Chip({ children, tone = "muted", className = "", style }) {
    const tones = {
        muted: { color: "var(--text-3)" },
        accent: { color: "var(--red)" },
        ok: { color: "var(--ok)" },
        warn: { color: "var(--warn)" },
        gold: { color: "var(--gold)" },
    };

    return (
        <span
            className={`nm-in-sm cond inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-widest ${className}`}
            style={{ ...tones[tone], ...style }}
        >
            {children}
        </span>
    );
}

export function StatTile({ label, value, tone = "default", delay = 0 }) {
    const colors = {
        default: "var(--text-1)",
        accent: "var(--red)",
        ok: "var(--ok)",
        muted: "var(--text-2)",
        gold: "var(--gold)",
    };

    return (
        <div
            className="nm nm-edge a-rise flex flex-col items-center justify-center gap-0.5 px-2 py-4"
            style={{ "--d": `${delay}ms` }}
        >
            <span
                className="display text-3xl sm:text-4xl"
                style={{ color: colors[tone] }}
            >
                {value}
            </span>
            <span
                className="cond text-center text-[0.66rem] font-bold uppercase leading-tight tracking-[0.14em]"
                style={{ color: "var(--text-3)" }}
            >
                {label}
            </span>
        </div>
    );
}

export function Spinner({ size = 42 }) {
    return (
        <div className="flex items-center justify-center py-16">
            <div
                className="a-spin rounded-full"
                style={{
                    width: size,
                    height: size,
                    border: "3px solid var(--line)",
                    borderTopColor: "var(--red)",
                }}
            />
        </div>
    );
}

export function EmptyState({ icon = "🏀", title, description, action }) {
    return (
        <div className="nm nm-edge a-rise flex flex-col items-center gap-3 px-6 py-12 text-center">
            <span className="a-float text-4xl">{icon}</span>
            <h3 className="display text-2xl" style={{ color: "var(--text-1)" }}>
                {title}
            </h3>
            {description && (
                <p className="max-w-sm text-sm" style={{ color: "var(--text-3)" }}>
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}

/** Barra de progreso hundida con relleno degradado. */
export function ProgressBar({ value, max, label, hint }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

    return (
        <div className="flex flex-col gap-1.5">
            {(label || hint) && (
                <div
                    className="cond flex justify-between text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-3)" }}
                >
                    <span>{label}</span>
                    <span>{hint}</span>
                </div>
            )}
            <div className="nm-in-sm h-2.5 w-full overflow-hidden rounded-full">
                <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                        width: `${pct}%`,
                        background: "linear-gradient(90deg, var(--red), var(--red-bright))",
                        boxShadow: "0 0 12px -2px var(--red)",
                    }}
                />
            </div>
        </div>
    );
}
