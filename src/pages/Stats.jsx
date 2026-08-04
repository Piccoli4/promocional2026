import { useMemo, useState } from "react";
import Layout from "../components/ui/Layout";
import TeamFilter from "../components/fixture/TeamFilter";
import LeaderCard from "../components/stats/LeaderCard";
import PlayersTable from "../components/stats/PlayersTable";
import TeamsTable from "../components/stats/TeamsTable";
import { SectionTitle, Spinner, EmptyState, Chip } from "../components/ui/Primitives";
import { useStats } from "../hooks/useStats";
import { METRICAS, maxPartidos } from "../utils/statsCalculator";
import { TEAMS } from "../data/fixture";

const VISTAS = [
    { id: "lideres", label: "Líderes" },
    { id: "jugadores", label: "Jugadores" },
    { id: "equipos", label: "Equipos" },
];

export default function Stats() {
    const { jugadores, equipos, partidos, loading, hayDatos } = useStats();
    const [vista, setVista] = useState("lideres");
    const [modo, setModo] = useState("total"); // "total" | "prom"
    const [equipo, setEquipo] = useState(null);

    const jugadoresFiltrados = useMemo(
        () => (equipo ? jugadores.filter((j) => j.equipo === equipo) : jugadores),
        [jugadores, equipo]
    );

    const maxPJ = useMemo(() => maxPartidos(jugadores), [jugadores]);

    if (loading) {
        return (
            <Layout>
                <Spinner />
            </Layout>
        );
    }

    if (!hayDatos) {
        return (
            <Layout>
                <div className="flex flex-col gap-6">
                    <SectionTitle eyebrow="Torneo Oficial Promocional 2026" title="Estadísticas" />
                    <EmptyState
                        icon="📊"
                        title="Todavía no hay estadísticas"
                        description="Se publican a medida que se cargan las planillas oficiales de cada partido."
                    />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <SectionTitle
                    eyebrow="Torneo Oficial Promocional 2026"
                    title="Estadísticas"
                    right={<Chip>{partidos} {partidos === 1 ? "partido" : "partidos"}</Chip>}
                />

                {/* Vista y modo de lectura */}
                <div className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        {VISTAS.map((v) => (
                            <button
                                key={v.id}
                                onClick={() => setVista(v.id)}
                                className={`nm-btn flex-1 py-2.5 text-xs ${vista === v.id ? "nm-btn-on" : ""}`}
                            >
                                {v.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="eyebrow">Ordenar por</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setModo("total")}
                                className={`nm-btn px-3.5 py-2 text-xs ${modo === "total" ? "nm-btn-on" : ""}`}
                            >
                                Total
                            </button>
                            <button
                                onClick={() => setModo("prom")}
                                className={`nm-btn px-3.5 py-2 text-xs ${modo === "prom" ? "nm-btn-on" : ""}`}
                            >
                                Promedio
                            </button>
                        </div>
                    </div>
                </div>

                {vista !== "equipos" && (
                    <TeamFilter teams={TEAMS} selectedTeam={equipo} onSelect={setEquipo} />
                )}

                {vista === "lideres" && (
                    <>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {METRICAS.map((metrica, i) => (
                                <LeaderCard
                                    key={metrica.key}
                                    jugadores={jugadoresFiltrados}
                                    metrica={metrica}
                                    modo={modo}
                                    maxPJ={maxPJ}
                                    delay={i * 40}
                                />
                            ))}
                        </div>
                        {modo === "prom" && (
                            <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                                <span style={{ color: "var(--warn)" }}>*</span> Jugadores con menos de la
                                mitad de los partidos disputados: el promedio es sobre pocos partidos.
                            </p>
                        )}
                    </>
                )}

                {vista === "jugadores" && (
                    <PlayersTable jugadores={jugadoresFiltrados} modo={modo} />
                )}

                {vista === "equipos" && <TeamsTable equipos={equipos} modo={modo} />}

                <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                    Datos tomados de las planillas oficiales de la CABB. Los porcentajes de tiro se
                    recalculan desde los tiros convertidos e intentados de cada planilla, así que
                    dependen de cómo se haya cargado el partido en la mesa de control.
                </p>
            </div>
        </Layout>
    );
}
