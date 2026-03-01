import { useState } from "react";
import Layout from "../components/ui/Layout";
import RoundCard from "../components/fixture/RoundCard";
import { useFixture } from "../hooks/useFixture";
import { useTheme } from "../context/ThemeContext";

export default function Fixture() {
    const { fixtureWithResults, loading } = useFixture();
    const { theme } = useTheme();
    const [selectedRound, setSelectedRound] = useState(1);

    const handleRoundClick = (round) => {
        setSelectedRound(selectedRound === round ? null : round);
    };

    const totalMatches = fixtureWithResults.reduce((acc, r) => acc + r.matches.length, 0);
    const playedMatches = fixtureWithResults.reduce((acc, r) => acc + r.matches.filter((m) => m.result !== null).length, 0);
    const pendingMatches = totalMatches - playedMatches;

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wide" style={{ color: theme.textPrimary }}>
                        Fixture
                    </h1>
                    <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                        Fase Clasificatoria — Torneo Promocional 2026
                    </p>
                </div>

                {!loading && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Jugados", value: playedMatches, color: theme.textGreen },
                            { label: "Pendientes", value: pendingMatches, color: theme.textSecondary },
                            { label: "Total", value: totalMatches, color: "#A90000" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl p-4 flex flex-col items-center gap-1"
                                style={{
                                    backgroundColor: theme.bgCard,
                                    border: `1px solid ${theme.border}`,
                                    boxShadow: theme.shadowCard,
                                }}
                            >
                                <span className="text-2xl font-black" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                <span className="text-xs uppercase tracking-wider text-center" style={{ color: theme.textMuted }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-10 h-10 rounded-full border-4 animate-spin"
                            style={{ borderColor: "#A90000", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {fixtureWithResults.map((round) => (
                            <RoundCard
                                key={round.round}
                                round={round}
                                isSelected={selectedRound === round.round}
                                onClick={() => handleRoundClick(round.round)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}