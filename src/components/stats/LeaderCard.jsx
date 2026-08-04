import { Link } from "react-router-dom";
import TeamLogo from "../ui/TeamLogo";
import { teamShortNames } from "../../data/teamLogos";
import { rankear, segundosAReloj } from "../../utils/statsCalculator";

/**
 * Podio de una métrica. Muestra el valor según el modo elegido (total o
 * promedio) y el otro entre paréntesis, para que ninguno de los dos quede
 * escondido detrás de un botón.
 */
export default function LeaderCard({ jugadores, metrica, modo, maxPJ, delay = 0 }) {
    const top = rankear(jugadores, metrica.key, modo, 5);
    if (top.length === 0) return null;

    const esMinutos = metrica.key === "seg";

    const formato = (jugador, comoPromedio) => {
        const bruto = jugador[metrica.key] ?? 0;
        const valor = comoPromedio ? (jugador.pj ? bruto / jugador.pj : 0) : bruto;
        if (esMinutos) return segundosAReloj(valor);
        return comoPromedio ? (Math.round(valor * 10) / 10).toFixed(1) : String(valor);
    };

    return (
        <div className="nm nm-edge a-rise flex flex-col gap-3 p-4" style={{ "--d": `${delay}ms` }}>
            <div className="flex items-baseline justify-between gap-2">
                <h3 className="display text-xl" style={{ color: "var(--text-1)" }}>
                    {metrica.label}
                </h3>
                <span className="eyebrow">{modo === "prom" ? "por partido" : "total"}</span>
            </div>

            <ol className="flex flex-col gap-1.5">
                {top.map((jugador, i) => {
                    // Con pocos partidos jugados un promedio dice poco: lo marcamos
                    // en vez de esconder al jugador del ranking.
                    const pocos = modo === "prom" && maxPJ > 2 && jugador.pj < maxPJ / 2;

                    return (
                        <li key={jugador.id}>
                            <Link
                                to={`/jugador/${jugador.id}`}
                                className="nm-press flex items-center gap-2.5 rounded-2xl px-2 py-1.5"
                            >
                                <span
                                    className="display tabular w-5 shrink-0 text-center text-lg"
                                    style={{ color: i === 0 ? "var(--gold)" : "var(--text-3)" }}
                                >
                                    {i + 1}
                                </span>

                                <TeamLogo team={jugador.equipo} size={24} />

                                <span className="min-w-0 flex-1">
                                    <span
                                        className="cond block truncate text-sm font-bold leading-tight"
                                        style={{ color: "var(--text-1)" }}
                                    >
                                        {jugador.nombre}
                                        {pocos && (
                                            <span style={{ color: "var(--warn)" }} title={`Solo ${jugador.pj} partidos jugados`}>
                                                {" "}*
                                            </span>
                                        )}
                                    </span>
                                    <span
                                        className="cond block truncate text-[0.65rem] uppercase tracking-wider"
                                        style={{ color: "var(--text-3)" }}
                                    >
                                        {teamShortNames[jugador.equipo] ?? jugador.equipo}
                                    </span>
                                </span>

                                <span className="shrink-0 text-right">
                                    <span
                                        className="display tabular block text-xl leading-none"
                                        style={{ color: i === 0 ? "var(--red)" : "var(--text-1)" }}
                                    >
                                        {formato(jugador, modo === "prom")}
                                    </span>
                                    <span
                                        className="cond tabular block text-[0.62rem] uppercase tracking-wider"
                                        style={{ color: "var(--text-3)" }}
                                    >
                                        {modo === "prom"
                                            ? `${formato(jugador, false)} tot.`
                                            : `${formato(jugador, true)} p/p`}
                                    </span>
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
