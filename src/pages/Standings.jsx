import Layout from "../components/ui/Layout";
import StandingsTable from "../components/standings/StandingsTable";
import { useStandings } from "../hooks/useStandings";
import { useTheme } from "../context/ThemeContext";

export default function Standings() {
    const { standings, loading } = useStandings();
    const { theme } = useTheme();
    const playedMatches = standings.reduce((acc, e) => acc + e.played, 0) / 2;

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wide" style={{ color: theme.textPrimary }}>
                        Tabla de Posiciones
                    </h1>
                    <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                        Fase Clasificatoria — Torneo Promocional 2026
                    </p>
                </div>

                {!loading && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                            { label: "Equipos", value: standings.length },
                            { label: "Fechas", value: 11 },
                            { label: "Partidos jugados", value: playedMatches },
                            { label: "Clasifican", value: "Top 8" },
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
                                <span className="text-2xl font-black" style={{ color: theme.textPrimary }}>
                                    {stat.value}
                                </span>
                                <span className="text-xs uppercase tracking-wider text-center" style={{ color: theme.textMuted }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <StandingsTable standings={standings} loading={loading} />
            </div>
        </Layout>
    );
}