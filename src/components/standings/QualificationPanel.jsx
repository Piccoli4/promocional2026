import { useState } from "react";
import TeamLogo from "../ui/TeamLogo";
import { Spinner } from "../ui/Primitives";
import { teamShortNames } from "../../data/teamLogos";
import { useIsMobile } from "../../hooks/useIsMobile";
import { useQualification } from "../../hooks/useQualification";
import { MAX_PENDING } from "../../utils/qualificationCalculator";

const DIRECT_SPOTS = 4;
const TOTAL_SPOTS = 12;

const STATUS = {
    cuartos: { label: "Cuartos asegurado", color: "var(--gold)" },
    playin: { label: "Juega Play In", color: "var(--red)" },
    open: { label: "En disputa", color: "var(--text-3)" },
};

const victorias = (n) => `${n} ${n === 1 ? "victoria" : "victorias"}`;
const rango = (min, max) => (min === max ? `${min}°` : `${min}° a ${max}°`);

/** Frase de resumen: qué le alcanza y qué no. */
function resumen(info) {
    const r = info.remaining;
    if (info.status === "cuartos") return "Ya tiene asegurado el pase directo a Cuartos de Final.";
    if (info.status === "playin") return "Ya no puede terminar entre los 4 primeros: va al Play In.";

    // byWins va de más victorias a menos.
    const asegura = [...info.byWins].reverse().find((b, i, arr) =>
        arr.slice(i).every((x) => x.maxPos <= DIRECT_SPOTS)
    );
    const queda = info.byWins.find((b, i, arr) => arr.slice(i).every((x) => x.minPos > DIRECT_SPOTS));

    const frases = [];
    if (!asegura) {
        frases.push("Aunque gane todo, depende de otros resultados para meterse entre los 4.");
    } else if (asegura.wins === r) {
        frases.push(r === 1 ? "Si gana el partido que le queda, se asegura Cuartos." : `Si gana los ${r} partidos que le quedan, se asegura Cuartos.`);
    } else {
        frases.push(`Con ${victorias(asegura.wins)} de ${r} se asegura Cuartos.`);
    }
    if (queda) {
        if (queda.wins === 0) frases.push(r === 1 ? "Si pierde, va al Play In." : `Si pierde los ${r}, va al Play In.`);
        else frases.push(`Con ${victorias(queda.wins)} o menos, va al Play In.`);
    }
    return frases.join(" ");
}

/**
 * Columnas en compu: posición · equipo · barra · rango. Todas las filas usan
 * las mismas, así las barras quedan alineadas con los números de arriba; el
 * espacio que sobra lo toma el equipo y la barra queda contra la derecha.
 */
const DESKTOP_COLS = "1.4rem minmax(9rem,1fr) minmax(10rem,22rem) 4.5rem";

/** Un puesto de la barra. */
function Cell({ pos, on, current, fluid }) {
    const color = pos <= DIRECT_SPOTS ? "var(--gold)" : "var(--red)";
    return (
        <span
            className="rounded-[3px]"
            style={{
                ...(fluid ? { flex: "1 1 0" } : { width: 7 }),
                height: current ? 16 : 10,
                background: on ? color : "var(--sunken)",
                boxShadow: on ? "none" : "var(--nm-in-sm)",
                // Corte entre Cuartos y Play In.
                marginLeft: pos === DIRECT_SPOTS + 1 ? 4 : 0,
            }}
        />
    );
}

/** Barra de los 12 puestos con el rango posible resaltado. */
function RangeBar({ min, max, current, fluid }) {
    return (
        <span className={`flex items-center ${fluid ? "w-full gap-[3px]" : "gap-[2px]"}`} aria-hidden="true">
            {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
                <Cell key={i} pos={i + 1} on={i + 1 >= min && i + 1 <= max} current={i + 1 === current} fluid={fluid} />
            ))}
        </span>
    );
}

/** Números de puesto arriba de las barras (solo en compu). */
function Scale() {
    return (
        <div
            className="cond grid items-end gap-2 px-2 text-[0.62rem] font-bold uppercase tracking-[0.14em]"
            style={{ gridTemplateColumns: DESKTOP_COLS, color: "var(--text-3)" }}
            aria-hidden="true"
        >
            <span className="text-center">#</span>
            <span>Equipo</span>
            <span className="flex w-full gap-[3px]">
                {Array.from({ length: TOTAL_SPOTS }, (_, i) => (
                    <span
                        key={i}
                        className="tabular text-center"
                        style={{
                            flex: "1 1 0",
                            marginLeft: i + 1 === DIRECT_SPOTS + 1 ? 4 : 0,
                            color: i < DIRECT_SPOTS ? "var(--gold)" : "var(--text-3)",
                        }}
                    >
                        {i + 1}
                    </span>
                ))}
            </span>
            <span className="text-right">Puede terminar</span>
        </div>
    );
}

/** Cuadradito de muestra para la leyenda. */
function Sample({ on, color, tall }) {
    return (
        <span
            className="inline-block rounded-[3px]"
            style={{
                width: 8,
                height: tall ? 16 : 10,
                background: on ? color : "var(--sunken)",
                boxShadow: on ? "none" : "var(--nm-in-sm)",
            }}
        />
    );
}

/** Qué significa cada cuadradito. */
function Legend() {
    return (
        <div
            className="cond flex flex-wrap items-center gap-x-4 gap-y-2 px-1 text-[0.65rem] font-semibold uppercase tracking-wider"
            style={{ color: "var(--text-3)" }}
        >
            <span>Cada cuadradito es un puesto, del 1° al 12°:</span>
            <span className="flex items-center gap-1.5">
                <Sample on color="var(--gold)" /> Puede terminar ahí · Cuartos
            </span>
            <span className="flex items-center gap-1.5">
                <Sample on color="var(--red)" /> Puede terminar ahí · Play In
            </span>
            <span className="flex items-center gap-1.5">
                <Sample /> Ya no puede
            </span>
            <span className="flex items-center gap-1.5">
                <Sample on color="var(--text-2)" tall /> Posición actual
            </span>
        </div>
    );
}

function Row({ entry, info, expanded, onToggle, isMobile, delay }) {
    const status = STATUS[info.status];
    const short = teamShortNames[entry.team] ?? entry.team;
    const range = (
        <span className="tabular text-[0.7rem]" style={{ color: "var(--text-2)" }}>
            {rango(info.minPos, info.maxPos)}
        </span>
    );

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
                aria-label={`${entry.team}: puede terminar ${rango(info.minPos, info.maxPos)}. ${status.label}.`}
                className="grid w-full items-center gap-2 px-2 py-2 text-left"
                style={{ gridTemplateColumns: isMobile ? "1.4rem minmax(0,1fr) auto" : DESKTOP_COLS }}
            >
                <span className="tabular text-center text-sm" style={{ color: "var(--text-3)" }}>
                    {entry.position}
                </span>

                <span className="flex min-w-0 items-center gap-2">
                    <TeamLogo team={entry.team} size={26} />
                    <span className="flex min-w-0 flex-col leading-tight">
                        <span
                            className="cond truncate text-[0.84rem] font-bold uppercase tracking-wide"
                            style={{ color: "var(--text-1)" }}
                        >
                            {isMobile ? short : entry.team}
                        </span>
                        <span
                            className="cond truncate text-[0.6rem] font-bold uppercase tracking-wider"
                            style={{ color: status.color }}
                        >
                            {status.label}
                        </span>
                    </span>
                </span>

                {isMobile ? (
                    <span className="flex flex-col items-end gap-1">
                        <RangeBar min={info.minPos} max={info.maxPos} current={entry.position} />
                        {range}
                    </span>
                ) : (
                    <>
                        <RangeBar min={info.minPos} max={info.maxPos} current={entry.position} fluid />
                        <span className="text-right">{range}</span>
                    </>
                )}
            </button>

            {expanded && (
                <div className="flex flex-col gap-2 px-3 pb-3">
                    <p className="text-sm" style={{ color: "var(--text-1)" }}>
                        {resumen(info)}
                    </p>

                    {info.remaining > 0 && (
                        <ul className="flex flex-col gap-1.5">
                            {info.byWins.map((b) => {
                                const verdict =
                                    b.maxPos <= DIRECT_SPOTS
                                        ? STATUS.cuartos
                                        : b.minPos > DIRECT_SPOTS
                                            ? STATUS.playin
                                            : { label: "Depende de otros", color: "var(--text-3)" };
                                return (
                                    <li
                                        key={b.wins}
                                        className="nm-in-sm grid items-center gap-2 px-3 py-2"
                                        style={{ gridTemplateColumns: "minmax(0,1fr) auto" }}
                                    >
                                        <span className="flex flex-col leading-tight">
                                            <span className="cond text-[0.8rem] font-bold uppercase tracking-wide" style={{ color: "var(--text-1)" }}>
                                                Gana {b.wins} de {info.remaining}
                                            </span>
                                            <span className="text-xs" style={{ color: "var(--text-2)" }}>
                                                Termina {rango(b.minPos, b.maxPos)}
                                            </span>
                                        </span>
                                        <span
                                            className="cond text-right text-[0.62rem] font-bold uppercase tracking-wider"
                                            style={{ color: verdict.color }}
                                        >
                                            {verdict.label}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default function QualificationPanel({ standings }) {
    const isMobile = useIsMobile();
    const { analysis, loading } = useQualification();
    const [open, setOpen] = useState(null);

    // Con la fase regular terminada la tabla ya lo dice todo.
    if (analysis?.mode === "final") return null;

    return (
        <div className="nm nm-edge a-rise flex flex-col gap-3 p-3 sm:p-4" style={{ "--d": "160ms" }}>
            <div className="flex flex-col gap-1 px-1">
                <span className="eyebrow">Calculadora de clasificación</span>
                <h3 className="display text-2xl" style={{ color: "var(--text-1)" }}>
                    ¿Qué necesita cada equipo?
                </h3>
                {analysis?.mode === "exact" && (
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>
                        Faltan {analysis.pending} partidos. Así puede terminar cada uno según cómo salgan.
                        {" "}Tocá un equipo para ver qué necesita.
                    </p>
                )}
            </div>

            {loading || !analysis ? (
                <Spinner size={32} />
            ) : analysis.mode === "unavailable" ? (
                <p className="px-1 pb-1 text-sm" style={{ color: "var(--text-2)" }}>
                    Se activa cuando queden {MAX_PENDING} partidos o menos por jugar
                    (hoy faltan {analysis.pending}).
                </p>
            ) : (
                <>
                    <Legend />

                    <div className="flex flex-col gap-0.5">
                        {!isMobile && <Scale />}
                        {standings.map((entry, i) => (
                            <Row
                                key={entry.team}
                                entry={entry}
                                info={analysis.teams[entry.team]}
                                isMobile={isMobile}
                                expanded={open === entry.team}
                                onToggle={() => setOpen(open === entry.team ? null : entry.team)}
                                delay={i * 30}
                            />
                        ))}
                    </div>

                    <p
                        className="border-t px-1 pt-3 text-xs"
                        style={{ borderColor: "var(--line)", color: "var(--text-3)" }}
                    >
                        Contempla todas las combinaciones de ganadores de los partidos que faltan,
                        con los mismos desempates de la tabla. Supone que no hay partidos perdidos
                        por default, y cuando un desempate depende de la diferencia de puntos de
                        un partido sin jugar, cuenta todas las posiciones posibles.
                    </p>
                </>
            )}
        </div>
    );
}
