import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { usePlayoffs } from "../../hooks/usePlayoffs";
import { savePlayoffResult, deletePlayoffResult } from "../../services/playoffService";

/**
 * Formulario individual para cargar resultado de un partido de playoffs.
 */
function PlayoffResultForm({ matchId, homeTeam, awayTeam, existingResult, gameLabel }) {
    const { theme } = useTheme();
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
            await savePlayoffResult(matchId, homeScore, awayScore);
            showFeedback("saved");
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
            await deletePlayoffResult(matchId);
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

    const hasResult = existingResult !== null && existingResult !== undefined;

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${hasResult ? "#A9000044" : theme.border}`,
                boxShadow: theme.shadowCard,
            }}
        >
            {/* Etiqueta del partido */}
            <div className="flex items-center justify-between">
                <span
                    className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}
                >
                    {gameLabel}
                </span>
                {hasResult && (
                    <span className="text-xs font-bold" style={{ color: theme.textGreen }}>
                        ✓ Cargado
                    </span>
                )}
            </div>

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
                        {homeTeam ?? "Por definir"}
                    </span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    placeholder="0"
                    disabled={!homeTeam || !awayTeam}
                    className="w-16 text-center text-xl font-black rounded-xl py-2 outline-none focus:ring-2 focus:ring-red-700 shrink-0 transition-all disabled:opacity-40"
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
                        {awayTeam ?? "Por definir"}
                    </span>
                </div>
                <input
                    type="number"
                    min="0"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    placeholder="0"
                    disabled={!homeTeam || !awayTeam}
                    className="w-16 text-center text-xl font-black rounded-xl py-2 outline-none focus:ring-2 focus:ring-red-700 shrink-0 transition-all disabled:opacity-40"
                    style={{
                        backgroundColor: theme.bgInput,
                        border: `1px solid ${theme.borderStrong}`,
                        color: theme.textPrimary,
                    }}
                />
            </div>

            {(!homeTeam || !awayTeam) && (
                <p className="text-xs text-center" style={{ color: theme.textMuted }}>
                    Esperando definición de fase anterior
                </p>
            )}

            {/* Botones */}
            {homeTeam && awayTeam && (
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={handleSave}
                        disabled={saving || homeScore === "" || awayScore === ""}
                        className="flex-1 py-2.5 rounded-xl text-sm font-black text-white uppercase tracking-wider transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#A90000" }}
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
            )}

            {feedback === "saved" && <p className="text-center text-xs font-semibold" style={{ color: theme.textGreen }}>✓ Guardado</p>}
            {feedback === "deleted" && <p className="text-center text-xs font-semibold" style={{ color: "#facc15" }}>✓ Eliminado</p>}
            {feedback === "error" && <p className="text-center text-xs font-semibold" style={{ color: theme.textRed }}>✗ Error, intentá de nuevo</p>}
        </div>
    );
}

/**
 * Panel completo de administración de playoffs.
 * Organizado por fase: QF / SF / Final
 */
export default function PlayoffAdminPanel() {
    const { theme } = useTheme();
    const { bracket, playoffResults, loading } = usePlayoffs();
    const [selectedPhase, setSelectedPhase] = useState("qf");

    const phases = [
        { id: "qf", label: "Cuartos" },
        { id: "sf", label: "Semifinales" },
        { id: "final", label: "Final" },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div
                    className="w-10 h-10 rounded-full border-4 animate-spin"
                    style={{ borderColor: "#A90000", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    const { quarterFinals, semiFinals, final } = bracket;

    return (
        <div className="flex flex-col gap-6">

            {/* Selector de fase */}
            <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
                    Seleccioná una fase
                </p>
                <div className="flex gap-2">
                    {phases.map((phase) => {
                        const isSelected = selectedPhase === phase.id;
                        return (
                            <button
                                key={phase.id}
                                onClick={() => setSelectedPhase(phase.id)}
                                className="flex-1 px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200"
                                style={{
                                    backgroundColor: isSelected ? "#A90000" : theme.bgCard,
                                    color: isSelected ? "#ffffff" : theme.textSecondary,
                                    border: `1px solid ${isSelected ? "#A90000" : theme.border}`,
                                    boxShadow: isSelected ? "0 4px 12px rgba(169,0,0,0.3)" : theme.shadowCard,
                                }}
                            >
                                {phase.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── CUARTOS DE FINAL ── */}
            {selectedPhase === "qf" && (
                <div className="flex flex-col gap-4">
                    <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                        Cuartos de Final
                    </h3>
                    <p className="text-xs -mt-2" style={{ color: theme.textMuted }}>
                        Un solo partido. Local = mejor ubicado.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quarterFinals.map((qf) => (
                            <PlayoffResultForm
                                key={qf.id}
                                matchId={qf.id}
                                homeTeam={qf.home}
                                awayTeam={qf.away}
                                existingResult={playoffResults[qf.id] ?? null}
                                gameLabel={`QF: ${qf.homeSeed}° vs ${qf.awaySeed}°`}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* ── SEMIFINALES ── */}
            {selectedPhase === "sf" && (
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                            Semifinales
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                            Mejor de 3. P1 y P3: local = mejor ubicado. P2: local = peor ubicado.
                        </p>
                    </div>

                    {semiFinals.map((sf, idx) => {
                        const { teamA, teamB, seedA, seedB, g1, g2, g3, winsA, winsB, seriesOver } = sf;
                        // G2: teamB es local
                        const games = [
                            { id: `${sf.id}g1`, label: `SF${idx + 1} · P1`, home: teamA, away: teamB, result: g1 },
                            { id: `${sf.id}g2`, label: `SF${idx + 1} · P2`, home: teamB, away: teamA, result: g2 },
                            { id: `${sf.id}g3`, label: `SF${idx + 1} · P3`, home: teamA, away: teamB, result: g3 },
                        ];

                        return (
                            <div key={sf.id} className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                                        Semifinal {idx + 1}
                                    </h4>
                                    {teamA && teamB && (
                                        <span className="text-xs" style={{ color: theme.textMuted }}>
                                            {teamA} ({seedA}°) vs {teamB} ({seedB}°)
                                        </span>
                                    )}
                                    {seriesOver && (
                                        <span
                                            className="ml-auto text-xs px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: "#A9000022", color: "#A90000" }}
                                        >
                                            Serie terminada
                                        </span>
                                    )}
                                </div>
                                <div
                                    className="text-xs px-3 py-1.5 rounded-xl"
                                    style={{ backgroundColor: theme.bgCardAlt ?? theme.border, color: theme.textMuted }}
                                >
                                    Serie: {winsA} – {winsB}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {games.map((game) => (
                                        <PlayoffResultForm
                                            key={game.id}
                                            matchId={game.id}
                                            homeTeam={game.home}
                                            awayTeam={game.away}
                                            existingResult={playoffResults[game.id] ?? null}
                                            gameLabel={game.label}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── FINAL ── */}
            {selectedPhase === "final" && (
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                            Gran Final
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                            Mejor de 3. P1 y P3: local = mejor ubicado. P2: local = peor ubicado.
                        </p>
                    </div>

                    {final.seriesOver && (
                        <div
                            className="rounded-xl px-4 py-2 text-center text-sm font-bold"
                            style={{ backgroundColor: "#A9000022", color: "#A90000" }}
                        >
                            🏆 Campeón: {final.seriesWinner}
                        </div>
                    )}

                    {!final.seriesOver && (
                        <div className="text-xs px-3 py-1.5 rounded-xl" style={{ backgroundColor: theme.bgCardAlt ?? theme.border, color: theme.textMuted }}>
                            Serie: {final.winsA} – {final.winsB}
                        </div>
                    )}

                    {/* G2: teamB es local */}
                    {[
                        { id: "fg1", label: "Final · P1", home: final.teamA, away: final.teamB, result: final.g1 },
                        { id: "fg2", label: "Final · P2", home: final.teamB, away: final.teamA, result: final.g2 },
                        { id: "fg3", label: "Final · P3", home: final.teamA, away: final.teamB, result: final.g3 },
                    ].map((game) => (
                        <PlayoffResultForm
                            key={game.id}
                            matchId={game.id}
                            homeTeam={game.home}
                            awayTeam={game.away}
                            existingResult={playoffResults[game.id] ?? null}
                            gameLabel={game.label}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
