import { useEffect, useMemo, useRef, useState } from "react";
import { parseCabbXlsx, tiroSospechoso } from "../../utils/parseCabbXlsx";
import { suggestTeams } from "../../data/cabbTeamNames";
import { listarPartidos, emparejar, compararMarcador } from "../../utils/statsMatching";
import {
    guardarVariasPlanillas,
    borrarEstadisticasPartido,
    suscribirPartidosCargados,
    recalcularAgregado,
} from "../../services/statsService";
import { useFixture } from "../../hooks/useFixture";
import { usePlayoffs } from "../../hooks/usePlayoffs";
import { TEAMS } from "../../data/fixture";
import { teamTinyNames } from "../../data/teamLogos";
import TeamLogo from "../ui/TeamLogo";
import { Chip, EmptyState, Spinner } from "../ui/Primitives";

const corto = (t) => teamTinyNames[t] ?? t ?? "—";

/* ── Tarjeta de un archivo en la cola ────────────────────────────────── */

function CandidateCard({ item, partidos, yaCargados, onChange, onRemove }) {
    if (item.error) {
        return (
            <div className="nm nm-edge a-rise flex flex-col gap-2 p-4">
                <div className="flex items-start justify-between gap-3">
                    <span className="cond text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                        {item.archivo}
                    </span>
                    <button onClick={onRemove} className="nm-btn px-2.5 py-1 text-[0.65rem]">
                        Quitar
                    </button>
                </div>
                <p className="text-sm" style={{ color: "var(--danger)" }}>
                    {item.error}
                </p>
            </div>
        );
    }

    const { parsed, localKey, visitanteKey, matchId } = item;
    const partido = partidos.find((p) => p.id === matchId) ?? null;
    const invertido = partido ? partido.home !== localKey : false;

    const ptsLocal = parsed.equipos[0].totales?.pts ?? 0;
    const ptsVisitante = parsed.equipos[1].totales?.pts ?? 0;
    const jugadores = parsed.equipos.reduce((a, e) => a + e.jugadores.length, 0);

    const choque = partido ? compararMarcador(partido, ptsLocal, ptsVisitante, invertido) : null;
    const pisa = matchId && yaCargados[matchId];
    const sospechosos = parsed.equipos.filter(tiroSospechoso).map((e) => e.key ?? e.crudo);

    const avisos = [
        ...parsed.avisos,
        !matchId && "Elegí a qué partido corresponde esta planilla.",
        invertido && "La localía viene invertida respecto del fixture.",
        pisa && "Ese partido ya tiene estadísticas: se van a reemplazar.",
        choque && `El marcador cargado a mano es ${choque.cargado} y la planilla dice ${choque.planilla}.`,
        sospechosos.length > 0 &&
            `Sin tiros errados en ${sospechosos.join(" y ")}: los porcentajes de este partido no son confiables.`,
    ].filter(Boolean);

    const listo = Boolean(localKey && visitanteKey && matchId);

    return (
        <div className="nm nm-edge a-rise flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
                <span className="cond truncate text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-3)" }}>
                    {item.archivo}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                    <Chip tone={listo ? "ok" : "warn"}>{listo ? "Listo" : "Revisar"}</Chip>
                    <button onClick={onRemove} className="nm-btn px-2.5 py-1 text-[0.65rem]">
                        Quitar
                    </button>
                </div>
            </div>

            {/* Marcador leído de la fila TOTALES */}
            <div className="nm-in-sm flex items-center justify-between gap-2 rounded-2xl px-3 py-3">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <TeamLogo team={localKey} size={28} />
                    <span className="cond truncate text-sm font-bold" style={{ color: "var(--text-1)" }}>
                        {corto(localKey) || parsed.equipos[0].crudo}
                    </span>
                </div>
                <span className="display tabular shrink-0 text-2xl" style={{ color: "var(--text-1)" }}>
                    {ptsLocal} - {ptsVisitante}
                </span>
                <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <span className="cond truncate text-sm font-bold" style={{ color: "var(--text-1)" }}>
                        {corto(visitanteKey) || parsed.equipos[1].crudo}
                    </span>
                    <TeamLogo team={visitanteKey} size={28} />
                </div>
            </div>

            {/* Corrección de equipos cuando el nombre de la CABB no se reconoció */}
            {parsed.equipos.map((equipo, i) => {
                const key = i === 0 ? localKey : visitanteKey;
                if (equipo.key) return null;
                return (
                    <label key={i} className="flex flex-col gap-1">
                        <span className="eyebrow">
                            ¿Qué equipo es "{equipo.crudo}"?
                        </span>
                        <select
                            value={key ?? ""}
                            onChange={(e) =>
                                onChange(i === 0 ? { localKey: e.target.value } : { visitanteKey: e.target.value })
                            }
                            className="nm-input px-3 py-2 text-sm"
                        >
                            <option value="">Elegir equipo…</option>
                            {suggestTeams(equipo.crudo).map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </label>
                );
            })}

            {/* Partido del fixture */}
            <label className="flex flex-col gap-1">
                <span className="eyebrow">Partido</span>
                <select
                    value={matchId ?? ""}
                    onChange={(e) => onChange({ matchId: e.target.value || null })}
                    className="nm-input px-3 py-2 text-sm"
                >
                    <option value="">Sin asignar</option>
                    {partidos.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.grupo} · {corto(p.home)} vs {corto(p.away)}
                            {yaCargados[p.id] ? " · ya cargado" : ""}
                        </option>
                    ))}
                </select>
            </label>

            <div className="flex flex-wrap items-center gap-2">
                <Chip>{jugadores} jugadores</Chip>
                {partido && <Chip tone="muted">{partido.grupo}</Chip>}
            </div>

            {avisos.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                    {avisos.map((aviso, i) => (
                        <li key={i} className="flex gap-2 text-xs leading-relaxed" style={{ color: "var(--warn)" }}>
                            <span aria-hidden="true">⚠</span>
                            <span>{aviso}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

/* ── Panel ───────────────────────────────────────────────────────────── */

export default function StatsUploadPanel() {
    const { fixtureWithResults, loading: cargandoFixture } = useFixture();
    const { bracket } = usePlayoffs();

    const [cola, setCola] = useState([]);
    const [yaCargados, setYaCargados] = useState({});
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);
    const [arrastrando, setArrastrando] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => suscribirPartidosCargados(setYaCargados), []);

    const partidos = useMemo(
        () => listarPartidos(fixtureWithResults, bracket),
        [fixtureWithResults, bracket]
    );

    /** Lee los archivos, los interpreta y propone el partido de cada uno. */
    const agregarArchivos = async (files) => {
        setMensaje(null);
        const nuevos = [];

        for (const file of files) {
            if (!file.name.toLowerCase().endsWith(".xlsx")) {
                nuevos.push({
                    key: `${file.name}-${Date.now()}-${Math.random()}`,
                    archivo: file.name,
                    error: "Solo se aceptan archivos .xlsx exportados desde la app de la CABB.",
                });
                continue;
            }

            try {
                const parsed = parseCabbXlsx(await file.arrayBuffer());
                const localKey = parsed.equipos[0].key;
                const visitanteKey = parsed.equipos[1].key;
                const propuesta = emparejar(partidos, localKey, visitanteKey, yaCargados);

                nuevos.push({
                    key: `${file.name}-${Date.now()}-${Math.random()}`,
                    archivo: file.name,
                    parsed,
                    localKey,
                    visitanteKey,
                    matchId: propuesta?.partido.id ?? null,
                });
            } catch (err) {
                nuevos.push({
                    key: `${file.name}-${Date.now()}-${Math.random()}`,
                    archivo: file.name,
                    error: err.message,
                });
            }
        }

        setCola((prev) => [...prev, ...nuevos]);
    };

    /** Al corregir un equipo a mano, volvemos a proponer el partido. */
    const actualizar = (key, cambios) => {
        setCola((prev) =>
            prev.map((item) => {
                if (item.key !== key) return item;
                const siguiente = { ...item, ...cambios };

                if (("localKey" in cambios || "visitanteKey" in cambios) && !("matchId" in cambios)) {
                    const propuesta = emparejar(
                        partidos,
                        siguiente.localKey,
                        siguiente.visitanteKey,
                        yaCargados
                    );
                    siguiente.matchId = propuesta?.partido.id ?? null;
                }
                return siguiente;
            })
        );
    };

    const listos = cola.filter((i) => !i.error && i.localKey && i.visitanteKey && i.matchId);

    const guardar = async () => {
        setGuardando(true);
        setMensaje(null);

        try {
            const planillas = listos.map((item) => {
                const partido = partidos.find((p) => p.id === item.matchId);
                const equipos = item.parsed.equipos.map((equipo, i) => ({
                    key: i === 0 ? item.localKey : item.visitanteKey,
                    crudo: equipo.crudo,
                    jugadores: equipo.jugadores,
                    totales: equipo.totales,
                }));

                return {
                    matchId: item.matchId,
                    datos: {
                        fase: partido.fase,
                        fecha: partido.fecha,
                        local: equipos[0].key,
                        visitante: equipos[1].key,
                        ptsLocal: equipos[0].totales?.pts ?? 0,
                        ptsVisitante: equipos[1].totales?.pts ?? 0,
                        equipos,
                        origen: item.archivo,
                    },
                };
            });

            await guardarVariasPlanillas(planillas);

            setCola((prev) => prev.filter((i) => !listos.includes(i)));
            setMensaje({
                tono: "ok",
                texto: `${planillas.length} planilla${planillas.length === 1 ? "" : "s"} guardada${planillas.length === 1 ? "" : "s"}.`,
            });
        } catch (err) {
            console.error(err);
            setMensaje({ tono: "error", texto: `No se pudo guardar: ${err.message}` });
        } finally {
            setGuardando(false);
        }
    };

    const borrar = async (matchId) => {
        if (!window.confirm("¿Borrar las estadísticas de este partido?")) return;
        try {
            await borrarEstadisticasPartido(matchId);
        } catch (err) {
            setMensaje({ tono: "error", texto: `No se pudo borrar: ${err.message}` });
        }
    };

    const cargados = Object.values(yaCargados).sort((a, b) =>
        String(b.actualizado).localeCompare(String(a.actualizado))
    );

    if (cargandoFixture) return <Spinner />;

    return (
        <div className="flex flex-col gap-5">
            {/* Zona de carga */}
            <div
                onDragOver={(e) => {
                    e.preventDefault();
                    setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setArrastrando(false);
                    agregarArchivos([...e.dataTransfer.files]);
                }}
                onClick={() => inputRef.current?.click()}
                className="nm-in a-rise flex cursor-pointer flex-col items-center gap-2 rounded-3xl px-6 py-10 text-center transition-all duration-300"
                style={{ outline: arrastrando ? "2px dashed var(--red)" : "none", outlineOffset: "-8px" }}
            >
                <span className="text-3xl" aria-hidden="true">📊</span>
                <span className="display text-xl" style={{ color: "var(--text-1)" }}>
                    Soltá acá los Excel de la CABB
                </span>
                <span className="max-w-sm text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                    Podés cargar varios a la vez. Se detecta solo a qué partido corresponde cada uno
                    y podés corregirlo antes de guardar. El marcador del fixture no se toca.
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".xlsx"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                        agregarArchivos([...e.target.files]);
                        e.target.value = "";
                    }}
                />
            </div>

            {mensaje && (
                <p
                    className="cond text-sm font-bold"
                    style={{ color: mensaje.tono === "ok" ? "var(--ok)" : "var(--danger)" }}
                >
                    {mensaje.texto}
                </p>
            )}

            {/* Cola de archivos */}
            {cola.length > 0 && (
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                        <span className="eyebrow">Por guardar ({cola.length})</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCola([])} className="nm-btn px-3 py-2 text-xs">
                                Vaciar
                            </button>
                            <button
                                onClick={guardar}
                                disabled={guardando || listos.length === 0}
                                className="nm-btn nm-btn-accent px-4 py-2 text-xs"
                            >
                                {guardando ? "Guardando…" : `Guardar ${listos.length}`}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                        {cola.map((item) => (
                            <CandidateCard
                                key={item.key}
                                item={item}
                                partidos={partidos}
                                yaCargados={yaCargados}
                                onChange={(cambios) => actualizar(item.key, cambios)}
                                onRemove={() => setCola((prev) => prev.filter((i) => i.key !== item.key))}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Partidos ya cargados */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                    <span className="eyebrow">Con estadísticas ({cargados.length})</span>
                    {cargados.length > 0 && (
                        <button onClick={() => recalcularAgregado()} className="nm-btn px-3 py-2 text-xs">
                            Recalcular totales
                        </button>
                    )}
                </div>

                {cargados.length === 0 ? (
                    <EmptyState
                        icon="📋"
                        title="Todavía no hay planillas"
                        description="Subí el Excel de un partido y las estadísticas van a aparecer en la app."
                    />
                ) : (
                    <div className="flex flex-col gap-2">
                        {cargados.map((p) => (
                            <div
                                key={p.matchId}
                                className="nm nm-edge flex items-center gap-3 px-4 py-3"
                            >
                                <TeamLogo team={p.local} size={26} />
                                <span className="cond min-w-0 flex-1 truncate text-sm font-bold" style={{ color: "var(--text-1)" }}>
                                    {corto(p.local)} vs {corto(p.visitante)}
                                </span>
                                <TeamLogo team={p.visitante} size={26} />
                                <span className="cond hidden shrink-0 text-[0.65rem] uppercase tracking-wider sm:block" style={{ color: "var(--text-3)" }}>
                                    {p.fase === "regular" ? `${p.fecha}ª fecha` : "Fase final"} · {p.jugadores} j.
                                </span>
                                <button
                                    onClick={() => borrar(p.matchId)}
                                    className="nm-btn shrink-0 px-2.5 py-1.5 text-[0.65rem]"
                                >
                                    Borrar
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {TEAMS.length !== 12 && (
                <p className="text-xs" style={{ color: "var(--warn)" }}>
                    El fixture no tiene 12 equipos; revisá `fixture.js` antes de cargar planillas.
                </p>
            )}
        </div>
    );
}
