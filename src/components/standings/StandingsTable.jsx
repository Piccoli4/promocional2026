import { useState } from "react";
import TeamLogo from "../ui/TeamLogo";
import { Spinner } from "../ui/Primitives";
import { teamShortNames } from "../../data/teamLogos";
import { zoneOf } from "../../data/playoffs";
import { useIsMobile } from "../../hooks/useIsMobile";

function DetailStat({ label, value, color }) {
    return (
        <div className="nm-in-sm flex flex-col items-center gap-0.5 px-2 py-2">
            <span className="tabular text-base" style={{ color: color ?? "var(--text-1)" }}>
                {value}
            </span>
            <span
                className="cond text-[0.58rem] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--text-3)" }}
            >
                {label}
            </span>
        </div>
    );
}

function Row({ entry, position, expanded, onToggle, isMobile, delay }) {
    const zone = zoneOf(position);
    const short = teamShortNames[entry.team] ?? entry.team;
    const diff = entry.pointsDiff;

    const cols = isMobile
        ? "2.4rem minmax(0,1fr) 2rem 2rem 2rem 2.9rem"
        : "2.6rem minmax(0,1fr) 2.4rem 2.4rem 2.4rem 3rem 3rem 3.2rem 3.4rem";

    return (
        <div
            className="a-rise overflow-hidden rounded-2xl transition-all duration-300"
            style={{
                background: expanded ? "var(--sunken)" : "transparent",
                boxShadow: expanded ? "var(--nm-in-sm)" : "none",
                "--d": `${delay}ms`,
            }}
        >
            <button
                onClick={onToggle}
                aria-expanded={expanded}
                className="grid w-full items-center gap-1 px-2 py-2.5 text-left"
                style={{ gridTemplateColumns: cols }}
            >
                {/* Posición */}
                <span className="flex items-center gap-1.5">
                    <span
                        className="h-7 w-1 shrink-0 rounded-full"
                        style={{ background: zone.color }}
                    />
                    <span
                        className="tabular text-base"
                        style={{ color: position <= 4 ? "var(--gold)" : "var(--text-2)" }}
                    >
                        {position}
                    </span>
                </span>

                {/* Equipo */}
                <span className="flex min-w-0 items-center gap-2">
                    <TeamLogo team={entry.team} size={28} />
                    <span className="flex min-w-0 flex-col leading-tight">
                        <span
                            className="cond truncate text-[0.86rem] font-bold uppercase tracking-wide"
                            style={{ color: "var(--text-1)" }}
                        >
                            {isMobile ? short : entry.team}
                        </span>
                        {entry.sanction > 0 && (
                            <span
                                className="cond text-[0.58rem] font-bold uppercase tracking-wider"
                                style={{ color: "var(--warn)" }}
                            >
                                −{entry.sanction} pt sanción
                            </span>
                        )}
                    </span>
                </span>

                <span className="tabular text-center text-sm" style={{ color: "var(--text-2)" }}>
                    {entry.played}
                </span>
                <span className="tabular text-center text-sm" style={{ color: "var(--ok)" }}>
                    {entry.won}
                </span>
                <span className="tabular text-center text-sm" style={{ color: "var(--danger)" }}>
                    {entry.lost}
                </span>

                {!isMobile && (
                    <>
                        <span className="tabular text-center text-sm" style={{ color: "var(--text-3)" }}>
                            {entry.pointsFor}
                        </span>
                        <span className="tabular text-center text-sm" style={{ color: "var(--text-3)" }}>
                            {entry.pointsAgainst}
                        </span>
                        <span
                            className="tabular text-center text-sm"
                            style={{
                                color: diff > 0 ? "var(--ok)" : diff < 0 ? "var(--danger)" : "var(--text-3)",
                            }}
                        >
                            {diff > 0 ? `+${diff}` : diff}
                        </span>
                    </>
                )}

                {/* Puntos */}
                <span className="flex justify-center">
                    <span
                        className="tabular flex h-8 min-w-[2.4rem] items-center justify-center rounded-xl px-1.5 text-lg"
                        style={
                            entry.played > 0
                                ? {
                                    color: "#fff",
                                    background: "linear-gradient(145deg, var(--red-bright), var(--red))",
                                    boxShadow: "0 4px 12px -5px var(--red)",
                                }
                                : {
                                    color: "var(--text-3)",
                                    background: "var(--sunken)",
                                    boxShadow: "var(--nm-in-sm)",
                                }
                        }
                    >
                        {entry.points}
                    </span>
                </span>
            </button>

            {expanded && (
                <div className="flex flex-col gap-2 px-3 pb-3">
                    <div className="grid grid-cols-4 gap-2">
                        <DetailStat label="Pts favor" value={entry.pointsFor} />
                        <DetailStat label="Pts contra" value={entry.pointsAgainst} />
                        <DetailStat
                            label="Diferencia"
                            value={diff > 0 ? `+${diff}` : diff}
                            color={diff > 0 ? "var(--ok)" : diff < 0 ? "var(--danger)" : undefined}
                        />
                        <DetailStat
                            label="Prom. anotado"
                            value={entry.played ? (entry.pointsFor / entry.played).toFixed(1) : "–"}
                        />
                    </div>
                    <p
                        className="cond text-center text-[0.66rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: zone.color }}
                    >
                        {zone.label}
                    </p>
                </div>
            )}
        </div>
    );
}

export default function StandingsTable({ standings, loading }) {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(null);

    if (loading) return <Spinner />;

    const cols = isMobile
        ? "2.4rem minmax(0,1fr) 2rem 2rem 2rem 2.9rem"
        : "2.6rem minmax(0,1fr) 2.4rem 2.4rem 2.4rem 3rem 3rem 3.2rem 3.4rem";

    return (
        <div className="nm nm-edge overflow-hidden p-2 sm:p-3">
            {/* Encabezado */}
            <div
                className="cond grid gap-1 px-2 pb-2 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                style={{ gridTemplateColumns: cols, color: "var(--text-3)" }}
            >
                <span className="pl-2.5">#</span>
                <span>Equipo</span>
                <span className="text-center">PJ</span>
                <span className="text-center">PG</span>
                <span className="text-center">PP</span>
                {!isMobile && <span className="text-center">PF</span>}
                {!isMobile && <span className="text-center">PC</span>}
                {!isMobile && <span className="text-center">Dif</span>}
                <span className="text-center" style={{ color: "var(--text-2)" }}>Pts</span>
            </div>

            <div className="flex flex-col gap-0.5">
                {standings.map((entry, i) => (
                    <Row
                        key={entry.team}
                        entry={entry}
                        position={i + 1}
                        isMobile={isMobile}
                        expanded={open === entry.team}
                        onToggle={() => setOpen(open === entry.team ? null : entry.team)}
                        delay={i * 35}
                    />
                ))}
            </div>

            {/* Leyenda */}
            <div
                className="cond mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-t px-2 pt-3 text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{ borderColor: "var(--line)", color: "var(--text-3)" }}
            >
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--gold)" }} />
                    1° a 4°: directo a Cuartos
                </span>
                <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--red)" }} />
                    5° a 12°: Play In
                </span>
                <span style={{ color: "var(--text-3)" }}>
                    Ganado 2 pts · Perdido 1 pt · Default 0
                </span>
                {isMobile && <span>Tocá una fila para ver el detalle</span>}
            </div>
        </div>
    );
}
