import { Link, useParams } from "react-router-dom";
import Layout from "../components/ui/Layout";
import TeamLogo from "../components/ui/TeamLogo";
import { SectionTitle, StatTile, Spinner, EmptyState, Chip } from "../components/ui/Primitives";
import { usePlayer } from "../hooks/useStats";
import { segundosAReloj } from "../utils/statsCalculator";
import { teamShortNames } from "../data/teamLogos";

/** "PÉREZ, JUAN CARLOS" → "Juan Carlos Pérez" */
function nombrePropio(nombre) {
    const partes = String(nombre ?? "").split(",");
    const apellido = partes[0]?.trim() ?? "";
    const pila = partes[1]?.trim() ?? "";
    const capitalizar = (texto) =>
        texto
            .toLowerCase()
            .replace(/\s+/g, " ")
            .replace(/(^|\s|')([a-záéíóúñü])/g, (_, sep, letra) => sep + letra.toUpperCase());
    return [capitalizar(pila), capitalizar(apellido)].filter(Boolean).join(" ");
}

function Porcentaje({ label, convertidos, intentados, valor }) {
    return (
        <div className="nm-in-sm flex flex-col items-center gap-0.5 rounded-2xl px-2 py-3">
            <span className="display text-2xl" style={{ color: "var(--text-1)" }}>
                {valor === null ? "—" : `${valor}%`}
            </span>
            <span className="cond tabular text-[0.65rem]" style={{ color: "var(--text-3)" }}>
                {convertidos}/{intentados}
            </span>
            <span className="cond text-[0.62rem] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>
                {label}
            </span>
        </div>
    );
}

export default function PlayerDetail() {
    const { playerId } = useParams();
    const { jugador, loading } = usePlayer(playerId);

    if (loading) {
        return (
            <Layout>
                <Spinner />
            </Layout>
        );
    }

    if (!jugador) {
        return (
            <Layout>
                <EmptyState
                    icon="🔍"
                    title="No encontramos a ese jugador"
                    description="Puede que todavía no tenga partidos con estadísticas cargadas."
                    action={
                        <Link to="/estadisticas" className="nm-btn px-4 py-2 text-xs">
                            Ver estadísticas
                        </Link>
                    }
                />
            </Layout>
        );
    }

    // Del más reciente al más viejo: es el orden en que se suelen mirar.
    const log = [...(jugador.log ?? [])].reverse();

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <TeamLogo team={jugador.equipo} size={56} />
                    <div className="min-w-0 flex-1">
                        <SectionTitle
                            eyebrow={`${teamShortNames[jugador.equipo] ?? jugador.equipo}${jugador.num ? ` · #${jugador.num}` : ""}`}
                            title={nombrePropio(jugador.nombre)}
                        />
                    </div>
                </div>

                {/* Promedios: es lo que define a un jugador, más que el acumulado */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatTile label="Puntos p/p" value={jugador.prom.pts.toFixed(1)} tone="accent" />
                    <StatTile label="Rebotes p/p" value={jugador.prom.rt.toFixed(1)} delay={40} />
                    <StatTile label="Asist. p/p" value={jugador.prom.ast.toFixed(1)} delay={80} />
                    <StatTile label="Valoración p/p" value={jugador.prom.val.toFixed(1)} tone="gold" delay={120} />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Chip>{jugador.pj} {jugador.pj === 1 ? "partido" : "partidos"}</Chip>
                    <Chip tone="muted">{segundosAReloj(jugador.seg)} en cancha</Chip>
                    <Chip tone="muted">{jugador.pts} puntos totales</Chip>
                </div>

                {/* Tiro */}
                <div className="flex flex-col gap-3">
                    <span className="eyebrow">Tiro</span>
                    <div className="grid grid-cols-3 gap-3">
                        <Porcentaje label="Dobles" convertidos={jugador.t2c} intentados={jugador.t2i} valor={jugador.pctT2} />
                        <Porcentaje label="Triples" convertidos={jugador.t3c} intentados={jugador.t3i} valor={jugador.pctT3} />
                        <Porcentaje label="Libres" convertidos={jugador.tlc} intentados={jugador.tli} valor={jugador.pctTL} />
                    </div>
                </div>

                {/* Acumulado completo */}
                <div className="flex flex-col gap-3">
                    <span className="eyebrow">Totales del torneo</span>
                    <div className="nm nm-edge grid grid-cols-3 gap-y-4 p-4 sm:grid-cols-6">
                        {[
                            ["Reb. of.", jugador.ro],
                            ["Reb. def.", jugador.rd],
                            ["Asistencias", jugador.ast],
                            ["Recuperos", jugador.rec],
                            ["Pérdidas", jugador.per],
                            ["Tapones", jugador.tap],
                            ["Faltas com.", jugador.fc],
                            ["Faltas rec.", jugador.fr],
                            ["Valoración", jugador.val],
                        ].map(([label, valor]) => (
                            <div key={label} className="flex flex-col items-center gap-0.5">
                                <span className="display tabular text-2xl" style={{ color: "var(--text-1)" }}>
                                    {valor}
                                </span>
                                <span className="cond text-center text-[0.62rem] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text-3)" }}>
                                    {label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Partido a partido */}
                <div className="flex flex-col gap-3">
                    <span className="eyebrow">Partido a partido</span>
                    <div className="nm nm-edge overflow-hidden">
                        <div className="no-bar overflow-x-auto">
                            <table className="w-full min-w-max text-sm">
                                <thead>
                                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                                        {["Rival", "MIN", "PTS", "REB", "AST", "VAL"].map((h, i) => (
                                            <th
                                                key={h}
                                                className={`cond px-3 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider ${i === 0 ? "text-left" : "text-center"}`}
                                                style={{ color: "var(--text-3)" }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {log.map((g, i) => (
                                        <tr
                                            key={g.m}
                                            style={{ borderBottom: i === log.length - 1 ? "none" : "1px solid var(--line)" }}
                                        >
                                            <td className="px-3 py-2">
                                                <Link to={`/partido/${g.m}`} className="flex items-center gap-2">
                                                    <TeamLogo team={g.r} size={20} />
                                                    <span className="cond truncate text-sm font-bold" style={{ color: "var(--text-1)" }}>
                                                        {teamShortNames[g.r] ?? g.r ?? "—"}
                                                    </span>
                                                    {g.f && (
                                                        <span className="cond text-[0.6rem] uppercase" style={{ color: "var(--text-3)" }}>
                                                            {g.f}ª
                                                        </span>
                                                    )}
                                                </Link>
                                            </td>
                                            <td className="tabular px-3 py-2 text-center" style={{ color: "var(--text-3)" }}>
                                                {segundosAReloj(g.s)}
                                            </td>
                                            <td className="tabular px-3 py-2 text-center font-bold" style={{ color: "var(--text-1)" }}>
                                                {g.p}
                                            </td>
                                            <td className="tabular px-3 py-2 text-center" style={{ color: "var(--text-2)" }}>
                                                {g.b}
                                            </td>
                                            <td className="tabular px-3 py-2 text-center" style={{ color: "var(--text-2)" }}>
                                                {g.a}
                                            </td>
                                            <td className="tabular px-3 py-2 text-center" style={{ color: "var(--gold)" }}>
                                                {g.v}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <Link to="/estadisticas" className="nm-btn self-start px-4 py-2 text-xs">
                    ← Volver a estadísticas
                </Link>
            </div>
        </Layout>
    );
}
