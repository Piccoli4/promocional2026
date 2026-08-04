import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Layout from "../components/ui/Layout";
import TeamLogo from "../components/ui/TeamLogo";
import { Spinner, EmptyState, Chip } from "../components/ui/Primitives";
import { obtenerEstadisticasPartido } from "../services/statsService";
import { conDerivados, segundosAReloj, totalesVacios, CAMPOS_SUMABLES } from "../utils/statsCalculator";
import { teamShortNames } from "../data/teamLogos";

/**
 * Planilla completa de un partido.
 *
 * Es la única vista que lee un documento de `matchStats` en vez del agregado:
 * como se entra desde un partido concreto, una sola lectura alcanza.
 */

const COLUMNAS = [
    { key: "seg", label: "MIN", reloj: true },
    { key: "pts", label: "PTS", destacada: true },
    { key: "t2", label: "2P" },
    { key: "t3", label: "3P" },
    { key: "tl", label: "TL" },
    { key: "rt", label: "REB" },
    { key: "ast", label: "AST" },
    { key: "rec", label: "REC" },
    { key: "per", label: "PER" },
    { key: "fc", label: "FC" },
    { key: "val", label: "VAL" },
];

function celda(jugador, columna) {
    if (columna.reloj) return segundosAReloj(jugador.seg);
    if (columna.key === "t2") return `${jugador.t2c}/${jugador.t2i}`;
    if (columna.key === "t3") return `${jugador.t3c}/${jugador.t3i}`;
    if (columna.key === "tl") return `${jugador.tlc}/${jugador.tli}`;
    return jugador[columna.key];
}

function TablaEquipo({ equipo }) {
    const totales = totalesVacios();
    for (const jugador of equipo.jugadores) {
        for (const campo of CAMPOS_SUMABLES) totales[campo] += jugador[campo] ?? 0;
    }
    const derivados = conDerivados({ ...totales, pj: 1 });

    // Los titulares no vienen marcados en la planilla; ordenamos por minutos,
    // que es la lectura más útil de quién tuvo peso en el partido.
    const jugadores = [...equipo.jugadores].sort((a, b) => b.seg - a.seg);

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <TeamLogo team={equipo.key} size={36} />
                <h3 className="display flex-1 text-2xl" style={{ color: "var(--text-1)" }}>
                    {teamShortNames[equipo.key] ?? equipo.key}
                </h3>
                <span className="display tabular text-3xl" style={{ color: "var(--red)" }}>
                    {totales.pts}
                </span>
            </div>

            <div className="flex flex-wrap gap-2">
                <Chip tone="muted">2P {derivados.pctT2 ?? "—"}%</Chip>
                <Chip tone="muted">3P {derivados.pctT3 ?? "—"}%</Chip>
                <Chip tone="muted">TL {derivados.pctTL ?? "—"}%</Chip>
                <Chip tone="muted">{totales.rt} reb</Chip>
                <Chip tone="muted">{totales.ast} ast</Chip>
            </div>

            <div className="nm nm-edge overflow-hidden">
                <div className="no-bar overflow-x-auto">
                    <table className="w-full min-w-max text-sm">
                        <thead>
                            <tr style={{ borderBottom: "1px solid var(--line)" }}>
                                <th
                                    className="cond sticky left-0 z-10 px-3 py-2.5 text-left text-[0.65rem] font-bold uppercase tracking-wider"
                                    style={{ color: "var(--text-3)", background: "var(--surface)" }}
                                >
                                    Jugador
                                </th>
                                {COLUMNAS.map((c) => (
                                    <th
                                        key={c.key}
                                        className="cond px-2 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-wider"
                                        style={{ color: "var(--text-3)" }}
                                    >
                                        {c.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {jugadores.map((jugador) => (
                                <tr key={jugador.playerId} style={{ borderBottom: "1px solid var(--line)" }}>
                                    <td className="sticky left-0 z-10 px-3 py-2" style={{ background: "var(--surface)" }}>
                                        <Link to={`/jugador/${jugador.playerId}`} className="flex items-center gap-2">
                                            <span
                                                className="cond tabular w-6 shrink-0 text-center text-xs"
                                                style={{ color: "var(--text-3)" }}
                                            >
                                                {jugador.num}
                                            </span>
                                            <span
                                                className="cond max-w-[9rem] truncate text-sm font-bold sm:max-w-none"
                                                style={{ color: "var(--text-1)" }}
                                            >
                                                {jugador.nombre}
                                            </span>
                                        </Link>
                                    </td>
                                    {COLUMNAS.map((c) => (
                                        <td
                                            key={c.key}
                                            className="tabular px-2 py-2 text-center"
                                            style={{
                                                color: c.destacada ? "var(--text-1)" : "var(--text-2)",
                                                fontWeight: c.destacada ? 700 : 400,
                                            }}
                                        >
                                            {celda(jugador, c)}
                                        </td>
                                    ))}
                                </tr>
                            ))}

                            <tr>
                                <td
                                    className="cond sticky left-0 z-10 px-3 py-2.5 text-xs font-bold uppercase tracking-wider"
                                    style={{ background: "var(--surface)", color: "var(--text-3)" }}
                                >
                                    Totales
                                </td>
                                {COLUMNAS.map((c) => (
                                    <td
                                        key={c.key}
                                        className="tabular px-2 py-2.5 text-center font-bold"
                                        style={{ color: "var(--text-1)" }}
                                    >
                                        {celda(totales, c)}
                                    </td>
                                ))}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function BoxScore() {
    const { matchId } = useParams();
    const [partido, setPartido] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let vigente = true;
        setLoading(true);
        obtenerEstadisticasPartido(matchId)
            .then((data) => vigente && setPartido(data))
            .finally(() => vigente && setLoading(false));
        return () => {
            vigente = false;
        };
    }, [matchId]);

    if (loading) {
        return (
            <Layout>
                <Spinner />
            </Layout>
        );
    }

    if (!partido) {
        return (
            <Layout>
                <EmptyState
                    icon="📋"
                    title="Este partido no tiene planilla"
                    description="Las estadísticas se publican cuando se carga el Excel oficial del partido."
                    action={
                        <Link to="/fixture" className="nm-btn px-4 py-2 text-xs">
                            Ver fixture
                        </Link>
                    }
                />
            </Layout>
        );
    }

    const [local, visitante] = partido.equipos;

    return (
        <Layout>
            <div className="flex flex-col gap-7">
                {/* Marcador */}
                <div className="nm nm-edge a-rise flex items-center justify-between gap-3 p-5">
                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <TeamLogo team={local.key} size={48} />
                        <span className="cond truncate text-sm font-bold" style={{ color: "var(--text-1)" }}>
                            {teamShortNames[local.key] ?? local.key}
                        </span>
                    </div>

                    <div className="flex shrink-0 flex-col items-center gap-1">
                        <span className="display tabular text-4xl" style={{ color: "var(--text-1)" }}>
                            {partido.ptsLocal} - {partido.ptsVisitante}
                        </span>
                        <span className="eyebrow">
                            {partido.fase === "regular" ? `${partido.fecha}ª Fecha` : "Fase Final"}
                        </span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col items-center gap-2">
                        <TeamLogo team={visitante.key} size={48} />
                        <span className="cond truncate text-sm font-bold" style={{ color: "var(--text-1)" }}>
                            {teamShortNames[visitante.key] ?? visitante.key}
                        </span>
                    </div>
                </div>

                <TablaEquipo equipo={local} />
                <TablaEquipo equipo={visitante} />

                <Link to="/estadisticas" className="nm-btn self-start px-4 py-2 text-xs">
                    ← Volver a estadísticas
                </Link>
            </div>
        </Layout>
    );
}
