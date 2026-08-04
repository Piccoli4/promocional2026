import { Link } from "react-router-dom";
import TeamLogo from "../ui/TeamLogo";
import { useStats } from "../../hooks/useStats";
import { rankear } from "../../utils/statsCalculator";
import { teamShortNames } from "../../data/teamLogos";

/**
 * Vitrina de líderes para la portada: los tres máximos en puntos, rebotes y
 * asistencias. Se muestra por promedio, que es como se habla de un jugador,
 * y desaparece por completo si todavía no hay planillas cargadas.
 */

const DESTACADOS = [
    { key: "pts", label: "Puntos", icono: "🎯" },
    { key: "rt", label: "Rebotes", icono: "💪" },
    { key: "ast", label: "Asistencias", icono: "🅰️" },
];

export default function StatsMini() {
    const { jugadores, hayDatos, loading } = useStats();

    if (loading || !hayDatos) return null;

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-end justify-between gap-3">
                <div>
                    <p className="eyebrow">Promedios del torneo</p>
                    <h2 className="display text-2xl sm:text-3xl" style={{ color: "var(--text-1)" }}>
                        Líderes
                    </h2>
                </div>
                <Link to="/estadisticas" className="nm-btn shrink-0 px-4 py-2 text-xs">
                    Ver todo
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {DESTACADOS.map((destacado, i) => {
                    const lider = rankear(jugadores, destacado.key, "prom", 1)[0];
                    if (!lider) return null;

                    const promedio = lider.pj ? (lider[destacado.key] / lider.pj).toFixed(1) : "0.0";

                    return (
                        <Link
                            key={destacado.key}
                            to={`/jugador/${lider.id}`}
                            className="nm nm-edge a-rise flex items-center gap-3 p-4"
                            style={{ "--d": `${i * 60}ms` }}
                        >
                            <TeamLogo team={lider.equipo} size={40} />

                            <div className="min-w-0 flex-1">
                                <p className="eyebrow">
                                    {destacado.icono} {destacado.label}
                                </p>
                                <p
                                    className="cond truncate text-sm font-bold leading-tight"
                                    style={{ color: "var(--text-1)" }}
                                >
                                    {lider.nombre}
                                </p>
                                <p
                                    className="cond truncate text-[0.65rem] uppercase tracking-wider"
                                    style={{ color: "var(--text-3)" }}
                                >
                                    {teamShortNames[lider.equipo] ?? lider.equipo}
                                </p>
                            </div>

                            <span
                                className="display tabular shrink-0 text-3xl"
                                style={{ color: "var(--red)" }}
                            >
                                {promedio}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
