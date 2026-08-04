import { useMemo, useState } from "react";
import TeamLogo from "../ui/TeamLogo";
import { teamShortNames } from "../../data/teamLogos";
import { useIsMobile } from "../../hooks/useIsMobile";
import { porPartido } from "../../utils/statsCalculator";

/**
 * Rendimiento colectivo. A diferencia de la tabla de jugadores acá el promedio
 * casi siempre es lo interesante, porque los equipos pueden llevar distinta
 * cantidad de partidos jugados según cómo venga el calendario.
 */

const COLUMNAS = [
    { key: "pts", label: "PF", titulo: "Puntos a favor", siempre: true },
    { key: "ptsContra", label: "PC", titulo: "Puntos en contra", siempre: true },
    { key: "dif", label: "DIF", titulo: "Diferencia", siempre: true, calculada: true },
    { key: "rt", label: "REB", titulo: "Rebotes", siempre: true },
    { key: "ast", label: "AST", titulo: "Asistencias" },
    { key: "rec", label: "REC", titulo: "Recuperos" },
    { key: "per", label: "PER", titulo: "Pérdidas" },
    { key: "fc", label: "FC", titulo: "Faltas cometidas" },
];

const PORCENTAJES = [
    { key: "pctT2", label: "2P%", titulo: "Porcentaje de dobles", pct: true },
    { key: "pctT3", label: "3P%", titulo: "Porcentaje de triples", pct: true },
    { key: "pctTL", label: "TL%", titulo: "Porcentaje de libres", pct: true },
];

export default function TeamsTable({ equipos, modo }) {
    const isMobile = useIsMobile();
    const [orden, setOrden] = useState({ key: "pts", desc: true });

    const columnas = useMemo(
        () => (isMobile ? COLUMNAS.filter((c) => c.siempre) : [...COLUMNAS, ...PORCENTAJES]),
        [isMobile]
    );

    const valor = (equipo, columna) => {
        if (columna.pct) return equipo[columna.key];
        const bruto = columna.calculada ? equipo.pts - equipo.ptsContra : equipo[columna.key] ?? 0;
        return modo === "prom" ? porPartido(bruto, equipo.pj) : bruto;
    };

    const ordenados = useMemo(() => {
        const columna = [...COLUMNAS, ...PORCENTAJES].find((c) => c.key === orden.key);
        return [...equipos].sort((a, b) => {
            const va = valor(a, columna) ?? -1;
            const vb = valor(b, columna) ?? -1;
            return orden.desc ? vb - va : va - vb;
        });
    }, [equipos, orden, modo]);

    if (equipos.length === 0) return null;

    const mostrar = (equipo, columna) => {
        const v = valor(equipo, columna);
        if (v === null || v === undefined) return "—";
        if (columna.pct) return `${v}%`;
        if (columna.calculada && v > 0) return `+${v}`;
        return v;
    };

    return (
        <div className="nm nm-edge overflow-hidden">
            <div className="no-bar overflow-x-auto">
                <table className="w-full min-w-max text-sm">
                    <thead>
                        <tr style={{ borderBottom: "1px solid var(--line)" }}>
                            <th
                                className="cond sticky left-0 z-10 px-3 py-2.5 text-left text-[0.65rem] font-bold uppercase tracking-wider"
                                style={{ color: "var(--text-3)", background: "var(--surface)" }}
                            >
                                Equipo
                            </th>
                            <th className="cond px-2 py-2.5 text-[0.65rem] font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                                PJ
                            </th>
                            {columnas.map((columna) => {
                                const activa = orden.key === columna.key;
                                return (
                                    <th key={columna.key} className="px-2 py-2.5">
                                        <button
                                            onClick={() =>
                                                setOrden((o) =>
                                                    o.key === columna.key
                                                        ? { key: o.key, desc: !o.desc }
                                                        : { key: columna.key, desc: true }
                                                )
                                            }
                                            title={`${columna.titulo} — tocá para ordenar`}
                                            className="cond text-[0.65rem] font-bold uppercase tracking-wider"
                                            style={{ color: activa ? "var(--red)" : "var(--text-3)" }}
                                        >
                                            {columna.label}
                                            {activa && (orden.desc ? " ↓" : " ↑")}
                                        </button>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>

                    <tbody>
                        {ordenados.map((equipo, i) => (
                            <tr
                                key={equipo.equipo}
                                style={{
                                    borderBottom: i === ordenados.length - 1 ? "none" : "1px solid var(--line)",
                                }}
                            >
                                <td className="sticky left-0 z-10 px-3 py-2" style={{ background: "var(--surface)" }}>
                                    <span className="flex items-center gap-2">
                                        <TeamLogo team={equipo.equipo} size={24} />
                                        <span className="cond truncate text-sm font-bold" style={{ color: "var(--text-1)" }}>
                                            {teamShortNames[equipo.equipo] ?? equipo.equipo}
                                        </span>
                                    </span>
                                </td>
                                <td className="tabular px-2 py-2 text-center" style={{ color: "var(--text-3)" }}>
                                    {equipo.pj}
                                </td>
                                {columnas.map((columna) => (
                                    <td
                                        key={columna.key}
                                        className="tabular px-2 py-2 text-center"
                                        style={{
                                            color: columna.calculada
                                                ? valor(equipo, columna) >= 0
                                                    ? "var(--ok)"
                                                    : "var(--danger)"
                                                : "var(--text-2)",
                                        }}
                                    >
                                        {mostrar(equipo, columna)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
