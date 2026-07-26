import { useState } from "react";
import Layout from "../components/ui/Layout";
import SeriesCard from "../components/playoffs/SeriesCard";
import GameCard from "../components/playoffs/GameCard";
import ChampionBanner from "../components/playoffs/ChampionBanner";
import { activeStage } from "../utils/playoffCalculator";
import TeamLogo from "../components/ui/TeamLogo";
import { SectionTitle, Chip, Spinner, EmptyState } from "../components/ui/Primitives";
import { usePlayoffs } from "../hooks/usePlayoffs";
import { teamTinyNames } from "../data/teamLogos";
import { formatDate } from "../data/fixture";

const TABS = [
    { key: "playIn", label: "Play In", hint: "5° a 12° · al mejor de 3" },
    { key: "quarters", label: "Cuartos", hint: "1v8 · 2v7 · 3v6 · 4v5" },
    { key: "semis", label: "Semis", hint: "1v4 · 2v3 · al mejor de 3" },
    { key: "final", label: "Final", hint: "Final y tercer puesto" },
    { key: "bracket58", label: "5° a 8°", hint: "Todos a un juego" },
    { key: "repo", label: "9° a 12°", hint: "Round robin de 3 jornadas" },
];

/* ── Panel de sembrado de la Fase Campeonato ──────────────────────── */

function SeedBoard({ champSeeds }) {
    if (!champSeeds.length) return null;

    return (
        <div className="nm nm-edge a-rise flex flex-col gap-3 p-4">
            <span className="eyebrow">Sembrado de la Fase Campeonato</span>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {champSeeds.map((s, i) => (
                    <div
                        key={s.team}
                        className="nm-in-sm a-pop flex items-center gap-2 px-2.5 py-2"
                        style={{ "--d": `${i * 50}ms` }}
                    >
                        <span
                            className="tabular w-5 shrink-0 text-center text-sm"
                            style={{ color: s.viaPlayIn ? "var(--red)" : "var(--gold)" }}
                        >
                            {s.champSeed}°
                        </span>
                        <TeamLogo team={s.team} size={24} />
                        <span
                            className="cond min-w-0 flex-1 truncate text-[0.76rem] font-bold uppercase tracking-wide"
                            style={{ color: "var(--text-1)" }}
                        >
                            {teamTinyNames[s.team] ?? s.team}
                        </span>
                    </div>
                ))}
            </div>
            <p
                className="cond text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-3)" }}
            >
                <span style={{ color: "var(--gold)" }}>Dorado</span>: clasificó directo ·{" "}
                <span style={{ color: "var(--red)" }}>Rojo</span>: entró por el Play In
            </p>
        </div>
    );
}

/* ── Tabla del reposicionamiento 9°–12° ───────────────────────────── */

function RepoTable({ table }) {
    if (!table.length) return null;

    return (
        <div className="nm nm-edge a-rise overflow-hidden p-2 sm:p-3">
            <div
                className="cond grid gap-1 px-2 pb-2 pt-1 text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                style={{
                    gridTemplateColumns: "2rem minmax(0,1fr) 2rem 2rem 2rem 3rem 3rem",
                    color: "var(--text-3)",
                }}
            >
                <span>#</span>
                <span>Equipo</span>
                <span className="text-center">PJ</span>
                <span className="text-center">PG</span>
                <span className="text-center">PP</span>
                <span className="text-center">Dif</span>
                <span className="text-center" style={{ color: "var(--text-2)" }}>Pts</span>
            </div>

            {table.map((e, i) => (
                <div
                    key={e.team}
                    className="a-slide grid items-center gap-1 rounded-2xl px-2 py-2"
                    style={{
                        gridTemplateColumns: "2rem minmax(0,1fr) 2rem 2rem 2rem 3rem 3rem",
                        "--d": `${i * 50}ms`,
                    }}
                >
                    <span className="tabular text-sm" style={{ color: "var(--text-2)" }}>
                        {9 + i}°
                    </span>
                    <span className="flex min-w-0 items-center gap-2">
                        <TeamLogo team={e.team} size={24} />
                        <span
                            className="cond truncate text-[0.8rem] font-bold uppercase tracking-wide"
                            style={{ color: "var(--text-1)" }}
                        >
                            {teamTinyNames[e.team] ?? e.team}
                        </span>
                    </span>
                    <span className="tabular text-center text-sm" style={{ color: "var(--text-2)" }}>
                        {e.played}
                    </span>
                    <span className="tabular text-center text-sm" style={{ color: "var(--ok)" }}>
                        {e.won}
                    </span>
                    <span className="tabular text-center text-sm" style={{ color: "var(--danger)" }}>
                        {e.lost}
                    </span>
                    <span
                        className="tabular text-center text-sm"
                        style={{
                            color:
                                e.pointsDiff > 0
                                    ? "var(--ok)"
                                    : e.pointsDiff < 0
                                        ? "var(--danger)"
                                        : "var(--text-3)",
                        }}
                    >
                        {e.pointsDiff > 0 ? `+${e.pointsDiff}` : e.pointsDiff}
                    </span>
                    <span className="tabular text-center text-base" style={{ color: "var(--red)" }}>
                        {e.points}
                    </span>
                </div>
            ))}
        </div>
    );
}

/* ── Posiciones finales del torneo ────────────────────────────────── */

function FinalStandings({ positions }) {
    const known = positions.filter(Boolean).length;
    if (known === 0) return null;

    const medal = ["🥇", "🥈", "🥉"];

    return (
        <div className="nm nm-edge a-rise flex flex-col gap-3 p-4">
            <span className="eyebrow">Posiciones finales</span>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {positions.map((team, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-2xl px-2 py-1.5"
                        style={{ background: i < 3 ? "var(--sunken)" : "transparent" }}
                    >
                        <span
                            className="tabular w-7 shrink-0 text-center text-sm"
                            style={{ color: i < 3 ? "var(--gold)" : "var(--text-3)" }}
                        >
                            {medal[i] ?? `${i + 1}°`}
                        </span>
                        {team ? (
                            <>
                                <TeamLogo team={team} size={24} />
                                <span
                                    className="cond truncate text-[0.82rem] font-bold uppercase tracking-wide"
                                    style={{ color: "var(--text-1)" }}
                                >
                                    {team}
                                </span>
                            </>
                        ) : (
                            <span
                                className="cond text-[0.78rem] italic"
                                style={{ color: "var(--text-3)" }}
                            >
                                A definir
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Página ───────────────────────────────────────────────────────── */

export default function Playoffs() {
    const { bracket, loading } = usePlayoffs();
    // Sin elección explícita, se abre la etapa que está en juego.
    const [picked, setPicked] = useState(null);
    const tab = picked ?? activeStage(bracket) ?? "playIn";
    const setTab = setPicked;

    if (loading) {
        return (
            <Layout>
                <Spinner />
            </Layout>
        );
    }

    const current = TABS.find((t) => t.key === tab);

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <SectionTitle
                    eyebrow="Del 18 de octubre al 12 de diciembre"
                    title="Fase Final"
                />

                {bracket.champion && <ChampionBanner team={bracket.champion} />}

                {/* Navegación de etapas */}
                <div className="no-bar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
                    {TABS.map((t) => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`nm-btn shrink-0 px-4 py-2.5 text-xs ${tab === t.key ? "nm-btn-on" : ""}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <p
                    className="cond -mt-3 px-1 text-[0.7rem] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-3)" }}
                >
                    {current.hint}
                </p>

                {/* ── Play In ── */}
                {tab === "playIn" && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {bracket.playIn.map((s, i) => (
                                <SeriesCard key={s.id} series={s} delay={i * 60} />
                            ))}
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-2)" }}>
                            Los 4 ganadores entran a la Fase Campeonato como 5° a 8°. Los 4
                            perdedores juegan el Reposicionamiento por los puestos 9° a 12°.
                        </p>
                    </div>
                )}

                {/* ── Cuartos ── */}
                {tab === "quarters" && (
                    <div className="flex flex-col gap-4">
                        <SeedBoard champSeeds={bracket.champSeeds} />
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            {bracket.quarterFinals.map((s, i) => (
                                <SeriesCard key={s.id} series={s} delay={i * 60} />
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Semifinales ── */}
                {tab === "semis" && (
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {bracket.semiFinals.map((s, i) => (
                            <SeriesCard key={s.id} series={s} delay={i * 60} />
                        ))}
                    </div>
                )}

                {/* ── Final ── */}
                {tab === "final" && (
                    <div className="flex flex-col gap-4">
                        <SeriesCard series={bracket.final} />
                        <GameCard game={bracket.p34} delay={80} />
                        <FinalStandings positions={bracket.finalPositions} />
                    </div>
                )}

                {/* ── 5° a 8° ── */}
                {tab === "bracket58" && (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <GameCard game={bracket.bracket58.a} />
                            <GameCard game={bracket.bracket58.b} delay={60} />
                        </div>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <GameCard game={bracket.bracket58.p56} delay={120} />
                            <GameCard game={bracket.bracket58.p78} delay={180} />
                        </div>
                        <p className="text-sm" style={{ color: "var(--text-2)" }}>
                            Lo juegan los 4 perdedores de Cuartos, reordenados por su sembrado.
                        </p>
                    </div>
                )}

                {/* ── 9° a 12° ── */}
                {tab === "repo" && (
                    <div className="flex flex-col gap-5">
                        {!bracket.playInComplete && (
                            <EmptyState
                                icon="⏳"
                                title="Todavía no están los equipos"
                                description="Se define cuando terminen las cuatro series del Play In."
                            />
                        )}

                        {[1, 2, 3].map((round) => {
                            const matches = bracket.repo.matches.filter((m) => m.round === round);
                            return (
                                <div key={round} className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className="h-px flex-1"
                                            style={{ background: "var(--line)" }}
                                        />
                                        <Chip>
                                            Jornada {round} · {formatDate(matches[0].date)}
                                        </Chip>
                                        <span
                                            className="h-px flex-1"
                                            style={{ background: "var(--line)" }}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {matches.map((m, i) => (
                                            <GameCard key={m.id} game={m} delay={i * 60} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        <RepoTable table={bracket.repo.table} />
                    </div>
                )}
            </div>
        </Layout>
    );
}
