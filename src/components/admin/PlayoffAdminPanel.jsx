import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { usePlayoffs } from "../../hooks/usePlayoffs";
import { savePlayoffResult, deletePlayoffResult } from "../../services/playoffService";

/**
 * Formulario individual para cargar resultado de un partido de playoffs.
 */
function PlayoffResultForm({ matchId, homeTeam, awayTeam, existingResult, gameLabel }) {
    const { theme } = useTheme();
    const [homeScore, setHomeScore] = useState(existingResult ? String(existingResult.homeScore) : "");
    const [awayScore, setAwayScore] = useState(existingResult ? String(existingResult.awayScore) : "");
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
            <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}>
                    {gameLabel}
                </span>
                {hasResult && (
                    <span className="text-xs font-bold" style={{ color: theme.textGreen }}>✓ Cargado</span>
                )}
            </div>

            {/* Local */}
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: "#A90000", color: "white" }}>L</span>
                    <span className="text-sm font-bold uppercase tracking-wide truncate"
                        style={{ color: theme.textPrimary }}>
                        {homeTeam ?? "Por definir"}
                    </span>
                </div>
                <input
                    type="number" min="0" value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    placeholder="0" disabled={!homeTeam || !awayTeam}
                    className="w-16 text-center text-xl font-black rounded-xl py-2 outline-none focus:ring-2 focus:ring-red-700 shrink-0 transition-all disabled:opacity-40"
                    style={{ backgroundColor: theme.bgInput, border: `1px solid ${theme.borderStrong}`, color: theme.textPrimary }}
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
                    <span className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: theme.borderStrong, color: theme.textSecondary }}>V</span>
                    <span className="text-sm font-bold uppercase tracking-wide truncate"
                        style={{ color: theme.textPrimary }}>
                        {awayTeam ?? "Por definir"}
                    </span>
                </div>
                <input
                    type="number" min="0" value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    placeholder="0" disabled={!homeTeam || !awayTeam}
                    className="w-16 text-center text-xl font-black rounded-xl py-2 outline-none focus:ring-2 focus:ring-red-700 shrink-0 transition-all disabled:opacity-40"
                    style={{ backgroundColor: theme.bgInput, border: `1px solid ${theme.borderStrong}`, color: theme.textPrimary }}
                />
            </div>

            {(!homeTeam || !awayTeam) && (
                <p className="text-xs text-center" style={{ color: theme.textMuted }}>
                    Esperando definición de fase anterior
                </p>
            )}

            {feedback === "saved" && (
                <p className="text-xs text-center font-bold" style={{ color: theme.textGreen }}>✓ Guardado</p>
            )}
            {feedback === "deleted" && (
                <p className="text-xs text-center font-bold" style={{ color: theme.textMuted }}>Eliminado</p>
            )}
            {feedback === "error" && (
                <p className="text-xs text-center font-bold text-red-500">Error al guardar</p>
            )}

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
                            style={{ backgroundColor: theme.bgCardAlt ?? theme.border, color: theme.textSecondary }}
                        >
                            {deleting ? "..." : "✕"}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Componente principal ────────────────────────────────────────────────────

const phases = [
    { id: "qf",    label: "Cuartos" },
    { id: "sf",    label: "Semis 1–4" },
    { id: "sf58",  label: "Semis 5–8" },
    { id: "pos",   label: "Posiciones" },
    { id: "final", label: "Final" },
    { id: "repo",  label: "Reposic." },
];

export default function PlayoffAdminPanel() {
    const { theme } = useTheme();
    const { bracket, playoffResults, loading } = usePlayoffs();
    const [selectedPhase, setSelectedPhase] = useState("qf");

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 rounded-full border-4 animate-spin"
                    style={{ borderColor: "#A90000", borderTopColor: "transparent" }} />
            </div>
        );
    }

    const { quarterFinals, semiFinals, final, sf58a, sf58b, p56, p78, p34, repoMatches } = bracket;

    return (
        <div className="flex flex-col gap-6">

            {/* Selector de fase */}
            <div>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
                    Seleccioná una fase
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {phases.map((phase) => {
                        const isSelected = selectedPhase === phase.id;
                        return (
                            <button
                                key={phase.id}
                                onClick={() => setSelectedPhase(phase.id)}
                                className="px-2 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200"
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

            {/* ── SEMIFINALES 1°–4° ── */}
            {selectedPhase === "sf" && (
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                            Semifinales 1° – 4°
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                            IDA y VUELTA. TERCERO solo si van 1–1.
                        </p>
                    </div>
                    {semiFinals.map((sf, idx) => {
                        const { teamA, teamB, g1, g2, g3, winsA, winsB, seriesOver } = sf;
                        const games = [
                            { id: `${sf.id}g1`, label: `SF${idx + 1} · IDA`,     home: teamA,  away: teamB,  result: g1 },
                            { id: `${sf.id}g2`, label: `SF${idx + 1} · VUELTA`,  home: teamB,  away: teamA,  result: g2 },
                            { id: `${sf.id}g3`, label: `SF${idx + 1} · TERCERO`, home: teamA,  away: teamB,  result: g3 },
                        ];
                        return (
                            <div key={sf.id} className="flex flex-col gap-3">
                                <div className="flex items-center gap-2">
                                    <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                                        Semifinal {idx + 1}
                                    </h4>
                                    {teamA && teamB && (
                                        <span className="text-xs" style={{ color: theme.textMuted }}>
                                            {teamA} vs {teamB}
                                        </span>
                                    )}
                                    {seriesOver && (
                                        <span className="ml-auto text-xs px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: "#A9000022", color: "#A90000" }}>
                                            Serie terminada
                                        </span>
                                    )}
                                </div>
                                <div className="text-xs px-3 py-1.5 rounded-xl"
                                    style={{ backgroundColor: theme.bgCardAlt ?? theme.border, color: theme.textMuted }}>
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

            {/* ── SEMIFINALES 5°–8° ── */}
            {selectedPhase === "sf58" && (
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                            Semifinales 5° – 8°
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                            Partidos únicos entre los perdedores de cuartos.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <PlayoffResultForm
                            matchId="sf58a"
                            homeTeam={sf58a.home} awayTeam={sf58a.away}
                            existingResult={playoffResults["sf58a"] ?? null}
                            gameLabel={`Per. ${quarterFinals[1].homeSeed}°/${quarterFinals[1].awaySeed}° vs Per. ${quarterFinals[0].homeSeed}°/${quarterFinals[0].awaySeed}°`}
                        />
                        <PlayoffResultForm
                            matchId="sf58b"
                            homeTeam={sf58b.home} awayTeam={sf58b.away}
                            existingResult={playoffResults["sf58b"] ?? null}
                            gameLabel={`Per. ${quarterFinals[3].homeSeed}°/${quarterFinals[3].awaySeed}° vs Per. ${quarterFinals[2].homeSeed}°/${quarterFinals[2].awaySeed}°`}
                        />
                    </div>
                </div>
            )}

            {/* ── POSICIONES 3° AL 8° ── */}
            {selectedPhase === "pos" && (
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                            Posiciones 3° – 8°
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                            Partidos únicos para definir posiciones finales.
                        </p>
                    </div>

                    {/* 7° y 8° */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: theme.textMuted }}>
                            7° y 8°
                        </h4>
                        <PlayoffResultForm
                            matchId="p78"
                            homeTeam={p78.home} awayTeam={p78.away}
                            existingResult={playoffResults["p78"] ?? null}
                            gameLabel="7° y 8°"
                        />
                    </div>

                    {/* 5° y 6° */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: theme.textMuted }}>
                            5° y 6°
                        </h4>
                        <PlayoffResultForm
                            matchId="p56"
                            homeTeam={p56.home} awayTeam={p56.away}
                            existingResult={playoffResults["p56"] ?? null}
                            gameLabel="5° y 6°"
                        />
                    </div>

                    {/* 3° y 4° */}
                    <div className="flex flex-col gap-2">
                        <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: theme.textMuted }}>
                            3° y 4°
                        </h4>
                        <PlayoffResultForm
                            matchId="p34"
                            homeTeam={p34.home} awayTeam={p34.away}
                            existingResult={playoffResults["p34"] ?? null}
                            gameLabel="3° y 4°"
                        />
                    </div>
                </div>
            )}

            {/* ── GRAN FINAL ── */}
            {selectedPhase === "final" && (
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                            Gran Final
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                            IDA y VUELTA. TERCERO solo si van 1–1.
                        </p>
                    </div>
                    {final.seriesOver && (
                        <div className="rounded-xl px-4 py-2 text-center text-sm font-bold"
                            style={{ backgroundColor: "#A9000022", color: "#A90000" }}>
                            🏆 Campeón: {final.seriesWinner}
                        </div>
                    )}
                    {!final.seriesOver && (
                        <div className="text-xs px-3 py-1.5 rounded-xl"
                            style={{ backgroundColor: theme.bgCardAlt ?? theme.border, color: theme.textMuted }}>
                            Serie: {final.winsA} – {final.winsB}
                        </div>
                    )}
                    {[
                        { id: "fg1", label: "Final · IDA",     home: final.teamA, away: final.teamB, result: final.g1 },
                        { id: "fg2", label: "Final · VUELTA",  home: final.teamB, away: final.teamA, result: final.g2 },
                        { id: "fg3", label: "Final · TERCERO", home: final.teamA, away: final.teamB, result: final.g3 },
                    ].map((game) => (
                        <PlayoffResultForm
                            key={game.id}
                            matchId={game.id}
                            homeTeam={game.home} awayTeam={game.away}
                            existingResult={playoffResults[game.id] ?? null}
                            gameLabel={game.label}
                        />
                    ))}
                </div>
            )}

            {/* ── REPOSICIONAMIENTO 9°–12° ── */}
            {selectedPhase === "repo" && (
                <div className="flex flex-col gap-6">
                    <div>
                        <h3 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                            Reposicionamiento 9° – 12°
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                            Round-robin en 3 jornadas. Cada equipo juega contra todos.
                        </p>
                    </div>
                    {[1, 2, 3].map((round) => {
                        const roundLabels = { 1: "31 may", 2: "7 jun", 3: "14 jun" };
                        const roundMatches = repoMatches.filter((m) => m.round === round);
                        return (
                            <div key={round} className="flex flex-col gap-3">
                                <h4 className="text-sm font-black uppercase tracking-wider" style={{ color: theme.textMuted }}>
                                    Jornada {round} — {roundLabels[round]}
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {roundMatches.map((m) => (
                                        <PlayoffResultForm
                                            key={m.id}
                                            matchId={m.id}
                                            homeTeam={m.home} awayTeam={m.away}
                                            existingResult={playoffResults[m.id] ?? null}
                                            gameLabel={`${m.homeSeed}° vs ${m.awaySeed}°`}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}