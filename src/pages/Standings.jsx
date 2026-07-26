import Layout from "../components/ui/Layout";
import StandingsTable from "../components/standings/StandingsTable";
import { SectionTitle, StatTile } from "../components/ui/Primitives";
import { useStandings } from "../hooks/useStandings";

const TIEBREAKERS = [
    "Enfrentamientos directos entre los equipos empatados (tabla reducida).",
    "Diferencia de puntos considerando todos los partidos de la fase.",
    "Mayor cantidad de puntos a favor.",
];

export default function Standings() {
    const { standings, loading } = useStandings();

    const playedMatches = standings.reduce((a, e) => a + e.played, 0) / 2;
    const totalPoints = standings.reduce((a, e) => a + e.pointsFor, 0);

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <SectionTitle
                    eyebrow="Fase Regular · Zona única"
                    title="Tabla de Posiciones"
                />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatTile label="Equipos" value={standings.length} delay={0} />
                    <StatTile label="Fechas" value="11" delay={60} />
                    <StatTile
                        label="Partidos jugados"
                        value={loading ? "–" : playedMatches}
                        tone="accent"
                        delay={120}
                    />
                    <StatTile
                        label="Puntos anotados"
                        value={loading ? "–" : totalPoints}
                        tone="muted"
                        delay={180}
                    />
                </div>

                <StandingsTable standings={standings} loading={loading} />

                {/* Criterios de desempate */}
                <div className="nm nm-edge a-rise flex flex-col gap-3 p-5" style={{ "--d": "200ms" }}>
                    <span className="eyebrow">Criterios de desempate (FIBA)</span>
                    <ol className="flex flex-col gap-2">
                        {TIEBREAKERS.map((text, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <span
                                    className="tabular mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs"
                                    style={{
                                        background: "var(--sunken)",
                                        boxShadow: "var(--nm-in-sm)",
                                        color: "var(--red)",
                                    }}
                                >
                                    {i + 1}
                                </span>
                                <span className="text-sm" style={{ color: "var(--text-2)" }}>
                                    {text}
                                </span>
                            </li>
                        ))}
                    </ol>
                    <p className="text-xs" style={{ color: "var(--text-3)" }}>
                        Partido ganado 2 puntos · perdido 1 punto · perdido por default 0 puntos
                        (con marcador de 20-0 en contra).
                    </p>
                </div>
            </div>
        </Layout>
    );
}
