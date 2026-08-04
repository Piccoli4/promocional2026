import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import TeamLogo from "../ui/TeamLogo";
import { useIsMobile } from "../../hooks/useIsMobile";
import { segundosAReloj } from "../../utils/statsCalculator";

/**
 * Tabla completa de jugadores, ordenable por cualquier columna.
 * En móvil se recortan las columnas secundarias: la ficha del jugador tiene
 * el detalle, y una tabla de 14 columnas en un celular no se lee.
 */

const COLUMNAS = [
    { key: "pj", label: "PJ", titulo: "Partidos jugados", siempre: true },
    { key: "seg", label: "MIN", titulo: "Minutos", reloj: true },
    { key: "pts", label: "PTS", titulo: "Puntos", siempre: true, destacada: true },
    { key: "rt", label: "REB", titulo: "Rebotes", siempre: true },
    { key: "ast", label: "AST", titulo: "Asistencias", siempre: true },
    { key: "rec", label: "REC", titulo: "Recuperos" },
    { key: "per", label: "PER", titulo: "Pérdidas" },
    { key: "tap", label: "TAP", titulo: "Tapones" },
    { key: "fc", label: "FC", titulo: "Faltas cometidas" },
    { key: "val", label: "VAL", titulo: "Valoración", siempre: true },
];

const PORCENTAJES = [
    { key: "pctT2", label: "2P%", titulo: "Porcentaje de dobles" },
    { key: "pctT3", label: "3P%", titulo: "Porcentaje de triples" },
    { key: "pctTL", label: "TL%", titulo: "Porcentaje de libres" },
];

export default function PlayersTable({ jugadores, modo }) {
    const isMobile = useIsMobile();
    const [orden, setOrden] = useState({ key: "pts", desc: true });

    const columnas = useMemo(
        () => (isMobile ? COLUMNAS.filter((c) => c.siempre) : [...COLUMNAS, ...PORCENTAJES]),
        [isMobile]
    );

    const valor = (jugador, columna) => {
        const bruto = jugador[columna.key] ?? 0;
        if (columna.key === "pj" || columna.key.startsWith("pct")) return bruto;
        return modo === "prom" && jugador.pj ? bruto / jugador.pj : bruto;
    };

    const ordenados = useMemo(() => {
        const columna = [...COLUMNAS, ...PORCENTAJES].find((c) => c.key === orden.key);
        return [...jugadores].sort((a, b) => {
            const va = valor(a, columna) ?? -1;
            const vb = valor(b, columna) ?? -1;
            return orden.desc ? vb - va : va - vb;
        });
    }, [jugadores, orden, modo]);

    const mostrar = (jugador, columna) => {
        const v = valor(jugador, columna);
        if (v === null || v === undefined) return "—";
        if (columna.reloj) return segundosAReloj(v);
        if (columna.key.startsWith("pct")) return `${v}%`;
        if (columna.key === "pj") return v;
        return modo === "prom" ? (Math.round(v * 10) / 10).toFixed(1) : v;
    };

    if (jugadores.length === 0) return null;

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
                                Jugador
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
                        {ordenados.map((jugador, i) => (
                            <tr
                                key={jugador.id}
                                style={{
                                    borderBottom:
                                        i === ordenados.length - 1 ? "none" : "1px solid var(--line)",
                                }}
                            >
                                <td
                                    className="sticky left-0 z-10 px-3 py-2"
                                    style={{ background: "var(--surface)" }}
                                >
                                    <Link to={`/jugador/${jugador.id}`} className="flex items-center gap-2">
                                        <TeamLogo team={jugador.equipo} size={22} />
                                        <span
                                            className="cond max-w-[9rem] truncate text-sm font-bold sm:max-w-none"
                                            style={{ color: "var(--text-1)" }}
                                        >
                                            {jugador.nombre}
                                        </span>
                                    </Link>
                                </td>

                                {columnas.map((columna) => (
                                    <td
                                        key={columna.key}
                                        className="tabular px-2 py-2 text-center text-sm"
                                        style={{
                                            color: columna.destacada ? "var(--text-1)" : "var(--text-2)",
                                            fontWeight: columna.destacada ? 700 : 400,
                                        }}
                                    >
                                        {mostrar(jugador, columna)}
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
