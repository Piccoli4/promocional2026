import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { saveResult, deleteResult } from "../../services/resultsService";

export default function MatchResultForm({ match }) {
    const { theme } = useTheme();
    const existingResult = match.result;

    const [homeScore, setHomeScore] = useState(
        existingResult ? String(existingResult.homeScore) : ""
    );
    const [awayScore, setAwayScore] = useState(
        existingResult ? String(existingResult.awayScore) : ""
    );
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [feedback, setFeedback] = useState(null);

    const showFeedback = (type) => {
        setFeedback(type);
        setTimeout(() => setFeedback(null), 2500);
    };

    const handleSave = async () => {
        if (homeScore === "" || awayScore === "") return;
        setSaving(true);
        try {
            await saveResult(match.id, homeScore, awayScore);
            showFeedback("saved");

            // Enviar notificación push a todos los suscriptos
            await fetch('/api/send-notification', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-key': import.meta.env.VITE_INTERNAL_FUNCTION_KEY,
                },
                body: JSON.stringify({
                    title: '🏀 Resultado cargado',
                    body: `${match.home} ${homeScore} - ${awayScore} ${match.away}`,
                }),
            });
        } catch (err) {
            console.error(err);
            showFeedback("error");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!existingResult) return;
        setDeleting(true);
        try {
            await deleteResult(match.id);
            setHomeScore("");
            setAwayScore("");
            showFeedback("deleted");
        } catch (err) {
            console.error(err);
            showFeedback("error");
        } finally {
            setDeleting(false);
        }
    };

    const hasResult = existingResult !== null;

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-4 transition-all duration-200"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${hasResult ? "#A9000044" : theme.border}`,
                boxShadow: theme.shadowCard,
            }}
        >
            {hasResult && (
                <div
                    className="text-xs font-bold uppercase tracking-widest text-center py-1 rounded-lg"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}
                >
                    ✓ Resultado cargado
                </div>
            )}

            {/* Local */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                        className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: "#A90000", color: "white" }}
                    >
                        L
                    </span>
                    <span
                        className="text-sm font-bold uppercase tracking-wide truncate"
                        style={{ color: theme.textPrimary }}
                    >
                        {match.home}
                    </span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    placeholder="0"
                    className="w-16 text-center text-xl font-black rounded-xl py-2 outline-none focus:ring-2 focus:ring-red-700 shrink-0 transition-all"
                    style={{
                        backgroundColor: theme.bgInput,
                        border: `1px solid ${theme.borderStrong}`,
                        color: theme.textPrimary,
                    }}
                />
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                <span className="text-xs font-black" style={{ color: theme.textMuted }}>VS</span>
                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
            </div>

            {/* Visitante */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                        className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: theme.borderStrong, color: theme.textSecondary }}
                    >
                        V
                    </span>
                    <span
                        className="text-sm font-bold uppercase tracking-wide truncate"
                        style={{ color: theme.textPrimary }}
                    >
                        {match.away}
                    </span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    placeholder="0"
                    className="w-16 text-center text-xl font-black rounded-xl py-2 outline-none focus:ring-2 focus:ring-red-700 shrink-0 transition-all"
                    style={{
                        backgroundColor: theme.bgInput,
                        border: `1px solid ${theme.borderStrong}`,
                        color: theme.textPrimary,
                    }}
                />
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-1">
                <button
                    onClick={handleSave}
                    disabled={saving || homeScore === "" || awayScore === ""}
                    className="flex-1 py-2.5 rounded-xl text-sm font-black text-white uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ backgroundColor: "#A90000" }}
                    onMouseEnter={e => { if (!saving) e.target.style.backgroundColor = "#8a0000" }}
                    onMouseLeave={e => { if (!saving) e.target.style.backgroundColor = "#A90000" }}
                >
                    {saving ? "Guardando..." : "Guardar"}
                </button>

                {hasResult && (
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-200 disabled:opacity-40"
                        style={{
                            backgroundColor: "transparent",
                            border: `1px solid ${theme.borderStrong}`,
                            color: theme.textSecondary,
                        }}
                    >
                        {deleting ? "..." : "Borrar"}
                    </button>
                )}
            </div>

            {feedback === "saved" && <p className="text-center text-xs font-semibold" style={{ color: theme.textGreen }}>✓ Resultado guardado</p>}
            {feedback === "deleted" && <p className="text-center text-xs font-semibold" style={{ color: "#facc15" }}>✓ Resultado eliminado</p>}
            {feedback === "error" && <p className="text-center text-xs font-semibold" style={{ color: theme.textRed }}>✗ Error, intentá de nuevo</p>}
        </div>
    );
}