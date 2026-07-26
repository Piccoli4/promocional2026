import { useState, useEffect } from "react";
import TeamLogo from "../ui/TeamLogo";
import { teamTinyNames } from "../../data/teamLogos";

/** Fila de un equipo con su input de puntos. Vive fuera del componente
 *  padre para que el input no pierda el foco entre pulsaciones. */
function Side({ team, score, setScore, isHome, locked }) {
    return (
        <div className="flex items-center gap-2.5">
            {team ? (
                <TeamLogo team={team} size={30} />
            ) : (
                <span
                    className="nm-in-sm flex h-[30px] w-[30px] items-center justify-center rounded-full text-[0.6rem]"
                    style={{ color: "var(--text-3)" }}
                >
                    ?
                </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span
                    className="cond truncate text-[0.86rem] font-bold uppercase tracking-wide"
                    style={{ color: team ? "var(--text-1)" : "var(--text-3)" }}
                >
                    {team ? teamTinyNames[team] ?? team : "A definir"}
                </span>
                <span
                    className="cond text-[0.58rem] font-bold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-3)" }}
                >
                    {isHome ? "Local" : "Visitante"}
                </span>
            </span>
            <input
                type="number"
                min="0"
                inputMode="numeric"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                disabled={locked}
                placeholder="0"
                aria-label={`Puntos de ${team ?? (isHome ? "local" : "visitante")}`}
                className="nm-input w-16 shrink-0 py-2 text-center text-xl disabled:opacity-40"
            />
        </div>
    );
}

/**
 * Editor de marcador reutilizable (fase regular y fase final).
 * Soporta partido perdido por default: 20-0 y 0 puntos de tabla para el ausente.
 */
export default function ScoreEditor({
    home,
    away,
    title,
    subtitle,
    result,
    onSave,
    onDelete,
    disabled = false,
    disabledHint,
    allowWalkover = true,
    delay = 0,
}) {
    const [homeScore, setHomeScore] = useState("");
    const [awayScore, setAwayScore] = useState("");
    const [walkover, setWalkover] = useState(null);
    const [busy, setBusy] = useState(null); // "save" | "delete"
    const [feedback, setFeedback] = useState(null);

    // Sincroniza con lo que hay guardado (y con los cambios en tiempo real)
    useEffect(() => {
        setHomeScore(result ? String(result.homeScore) : "");
        setAwayScore(result ? String(result.awayScore) : "");
        setWalkover(result?.walkover ?? null);
    }, [result]);

    const flash = (type) => {
        setFeedback(type);
        setTimeout(() => setFeedback(null), 2500);
    };

    const applyWalkover = (side) => {
        const next = walkover === side ? null : side;
        setWalkover(next);
        if (next === "away") {
            setHomeScore("20");
            setAwayScore("0");
        } else if (next === "home") {
            setHomeScore("0");
            setAwayScore("20");
        }
    };

    const handleSave = async () => {
        if (homeScore === "" || awayScore === "") return;
        setBusy("save");
        try {
            await onSave(Number(homeScore), Number(awayScore), walkover);
            flash("saved");
        } catch (err) {
            console.error(err);
            flash("error");
        } finally {
            setBusy(null);
        }
    };

    const handleDelete = async () => {
        setBusy("delete");
        try {
            await onDelete();
            setHomeScore("");
            setAwayScore("");
            setWalkover(null);
            flash("deleted");
        } catch (err) {
            console.error(err);
            flash("error");
        } finally {
            setBusy(null);
        }
    };

    const hasResult = !!result;
    const locked = disabled || !home || !away;

    return (
        <div
            className="nm nm-edge a-rise flex flex-col gap-3 p-4"
            style={{ "--d": `${delay}ms`, opacity: locked && !hasResult ? 0.72 : 1 }}
        >
            <header className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 flex-col leading-tight">
                    <span className="display truncate text-base" style={{ color: "var(--text-1)" }}>
                        {title}
                    </span>
                    {subtitle && (
                        <span
                            className="cond truncate text-[0.62rem] font-semibold uppercase tracking-[0.14em]"
                            style={{ color: "var(--text-3)" }}
                        >
                            {subtitle}
                        </span>
                    )}
                </div>
                {hasResult && (
                    <span
                        className="cond shrink-0 text-[0.6rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: "var(--ok)" }}
                    >
                        ✓ Cargado
                    </span>
                )}
            </header>

            <Side team={home} score={homeScore} setScore={setHomeScore} isHome locked={locked} />
            <Side team={away} score={awayScore} setScore={setAwayScore} isHome={false} locked={locked} />

            {locked && disabledHint && (
                <p
                    className="cond text-center text-[0.65rem] font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-3)" }}
                >
                    {disabledHint}
                </p>
            )}

            {allowWalkover && !locked && (
                <div className="flex items-center gap-2">
                    <span
                        className="cond text-[0.58rem] font-bold uppercase tracking-[0.12em]"
                        style={{ color: "var(--text-3)" }}
                    >
                        No se presentó
                    </span>
                    <button
                        onClick={() => applyWalkover("home")}
                        className={`nm-btn px-2.5 py-1 text-[0.6rem] ${walkover === "home" ? "nm-btn-on" : ""}`}
                    >
                        Local
                    </button>
                    <button
                        onClick={() => applyWalkover("away")}
                        className={`nm-btn px-2.5 py-1 text-[0.6rem] ${walkover === "away" ? "nm-btn-on" : ""}`}
                    >
                        Visitante
                    </button>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={handleSave}
                    disabled={locked || busy !== null || homeScore === "" || awayScore === ""}
                    className="nm-btn nm-btn-accent flex-1 py-2.5 text-xs"
                >
                    {busy === "save" ? "Guardando..." : "Guardar"}
                </button>
                {hasResult && (
                    <button
                        onClick={handleDelete}
                        disabled={busy !== null}
                        className="nm-btn px-4 py-2.5 text-xs"
                    >
                        {busy === "delete" ? "..." : "Borrar"}
                    </button>
                )}
            </div>

            {feedback && (
                <p
                    className="cond text-center text-[0.66rem] font-bold uppercase tracking-wider"
                    style={{
                        color:
                            feedback === "saved"
                                ? "var(--ok)"
                                : feedback === "deleted"
                                    ? "var(--warn)"
                                    : "var(--danger)",
                    }}
                >
                    {feedback === "saved"
                        ? "✓ Resultado guardado"
                        : feedback === "deleted"
                            ? "Resultado eliminado"
                            : "✗ Error, intentá de nuevo"}
                </p>
            )}
        </div>
    );
}
