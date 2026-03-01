import { useState } from "react";
import Layout from "../components/ui/Layout";
import MatchResultForm from "../components/admin/MatchResultForm";
import { useFixture } from "../hooks/useFixture";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Admin() {
    const { fixtureWithResults, loading } = useFixture();
    const { logout } = useAuth();
    const { theme } = useTheme();
    const [selectedRound, setSelectedRound] = useState(1);

    const currentRound = fixtureWithResults.find((r) => r.round === selectedRound);
    const totalMatches = fixtureWithResults.reduce((acc, r) => acc + r.matches.length, 0);
    const playedMatches = fixtureWithResults.reduce(
        (acc, r) => acc + r.matches.filter((m) => m.result !== null).length, 0
    );

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Encabezado */}
                <div
                    className="rounded-2xl p-5 flex flex-col gap-3"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}
                >
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-black uppercase tracking-wide" style={{ color: theme.textPrimary }}>
                                Panel Admin
                            </h1>
                            <p className="text-xs mt-0.5" style={{ color: theme.textMuted }}>
                                Torneo Promocional 2026
                            </p>
                        </div>
                        <button
                            onClick={logout}
                            className="text-xs px-3 py-2 rounded-xl font-bold uppercase tracking-wider text-white shrink-0"
                            style={{ backgroundColor: "#A90000" }}
                        >
                            Cerrar sesión
                        </button>
                    </div>

                    {/* Barra de progreso */}
                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs" style={{ color: theme.textMuted }}>
                            <span>Progreso del torneo</span>
                            <span>{playedMatches} / {totalMatches} partidos</span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: theme.border }}>
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(playedMatches / totalMatches) * 100}%`,
                                    backgroundColor: "#A90000",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Selector de fechas */}
                <div>
                    <p className="text-xs uppercase tracking-widest mb-3" style={{ color: theme.textMuted }}>
                        Seleccioná una fecha
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {fixtureWithResults.map((round) => {
                            const isSelected = round.round === selectedRound;
                            const hasResults = round.matches.some((m) => m.result !== null);
                            const allDone = round.matches.every((m) => m.result !== null);

                            return (
                                <button
                                    key={round.round}
                                    onClick={() => setSelectedRound(round.round)}
                                    className="relative shrink-0 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-200"
                                    style={{
                                        backgroundColor: isSelected ? "#A90000" : theme.bgCard,
                                        color: isSelected ? "#ffffff" : theme.textSecondary,
                                        border: `1px solid ${isSelected ? "#A90000" : theme.border}`,
                                        boxShadow: isSelected ? "0 4px 12px rgba(169,0,0,0.3)" : theme.shadowCard,
                                    }}
                                >
                                    {round.label}
                                    {!isSelected && hasResults && (
                                        <span
                                            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2"
                                            style={{
                                                backgroundColor: allDone ? theme.textGreen : "#A90000",
                                                borderColor: theme.bgApp,
                                            }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Partidos */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-10 h-10 rounded-full border-4 animate-spin"
                            style={{ borderColor: "#A90000", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                                {currentRound?.label}
                            </h2>
                            <span
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ backgroundColor: theme.border, color: theme.textMuted }}
                            >
                                {currentRound?.matches.filter(m => m.result !== null).length} / {currentRound?.matches.length} cargados
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {currentRound?.matches.map((match) => (
                                <MatchResultForm key={match.id} match={match} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}