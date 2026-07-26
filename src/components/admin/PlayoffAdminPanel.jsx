import { useState } from "react";
import ScoreEditor from "./ScoreEditor";
import TeamLogo from "../ui/TeamLogo";
import { Spinner, Chip } from "../ui/Primitives";
import { usePlayoffs } from "../../hooks/usePlayoffs";
import { bracketSections } from "../../utils/playoffCalculator";
import { savePlayoffResult, deletePlayoffResult } from "../../services/playoffService";
import { teamTinyNames } from "../../data/teamLogos";
import { formatDateLong } from "../../data/fixture";

const short = (t) => (t ? teamTinyNames[t] ?? t : null);

/* ── Serie al mejor de 3 ──────────────────────────────────────────── */

function SeriesEditor({ series }) {
    const { teamA, teamB, winsA, winsB, ready, over } = series;

    return (
        <div className="nm-in flex flex-col gap-3 p-3">
            <header className="flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="flex items-center gap-2">
                    {teamA && <TeamLogo team={teamA} size={24} />}
                    <span
                        className="cond text-[0.82rem] font-bold uppercase tracking-wide"
                        style={{ color: "var(--text-1)" }}
                    >
                        {short(teamA) ?? series.labelA}
                    </span>
                    <span className="tabular text-sm" style={{ color: "var(--red)" }}>
                        {winsA}–{winsB}
                    </span>
                    <span
                        className="cond text-[0.82rem] font-bold uppercase tracking-wide"
                        style={{ color: "var(--text-1)" }}
                    >
                        {short(teamB) ?? series.labelB}
                    </span>
                    {teamB && <TeamLogo team={teamB} size={24} />}
                </span>

                <Chip tone={over ? "ok" : ready ? "accent" : "muted"}>
                    {series.label} · {over ? "definida" : ready ? "en juego" : "a definir"}
                </Chip>
            </header>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {series.games.map((game, i) => (
                    <ScoreEditor
                        key={game.id}
                        home={game.home}
                        away={game.away}
                        title={`Juego ${game.num}`}
                        subtitle={formatDateLong(game.date)}
                        result={game.result}
                        disabled={!ready || game.skipped}
                        disabledHint={
                            game.skipped
                                ? "La serie ya se definió 2-0"
                                : "Faltan definir los equipos"
                        }
                        onSave={(h, a, w) => savePlayoffResult(game.id, h, a, w)}
                        onDelete={() => deletePlayoffResult(game.id)}
                        delay={i * 50}
                    />
                ))}
            </div>
        </div>
    );
}

/* ── Partido único ────────────────────────────────────────────────── */

function GameEditor({ game, delay }) {
    return (
        <ScoreEditor
            home={game.home}
            away={game.away}
            title={game.label}
            subtitle={
                game.ready
                    ? formatDateLong(game.date)
                    : `${game.labelA} vs ${game.labelB}`
            }
            result={game.result}
            disabled={!game.ready}
            disabledHint="Faltan definir los equipos"
            onSave={(h, a, w) => savePlayoffResult(game.id, h, a, w)}
            onDelete={() => deletePlayoffResult(game.id)}
            delay={delay}
        />
    );
}

/* ── Panel ────────────────────────────────────────────────────────── */

export default function PlayoffAdminPanel() {
    const { bracket, loading } = usePlayoffs();
    const [open, setOpen] = useState("playIn");

    if (loading) return <Spinner />;

    const sections = bracketSections(bracket);

    return (
        <div className="flex flex-col gap-3">
            {sections.map((section) => {
                const isOpen = open === section.key;

                return (
                    <section
                        key={section.key}
                        className="overflow-hidden rounded-3xl transition-all duration-300"
                        style={{
                            background: "var(--surface)",
                            boxShadow: isOpen ? "var(--nm-in)" : "var(--nm)",
                        }}
                    >
                        <button
                            onClick={() => setOpen(isOpen ? null : section.key)}
                            aria-expanded={isOpen}
                            className="flex w-full items-center gap-3 px-4 py-4 text-left"
                        >
                            <span className="flex min-w-0 flex-1 flex-col leading-tight">
                                <span className="display text-lg" style={{ color: "var(--text-1)" }}>
                                    {section.title}
                                </span>
                                <span
                                    className="cond truncate text-[0.66rem] font-semibold uppercase tracking-[0.13em]"
                                    style={{ color: "var(--text-3)" }}
                                >
                                    {section.subtitle}
                                </span>
                            </span>
                            <svg
                                className="h-4 w-4 shrink-0 transition-transform duration-300"
                                style={{
                                    color: "var(--text-3)",
                                    transform: isOpen ? "rotate(180deg)" : "none",
                                }}
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>

                        {isOpen && (
                            <div className="flex flex-col gap-4 px-3 pb-4">
                                {section.series.map((s) => (
                                    <SeriesEditor key={s.id} series={s} />
                                ))}

                                {section.games.length > 0 && (
                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                        {section.games.map((g, i) => (
                                            <GameEditor key={g.id} game={g} delay={i * 50} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </section>
                );
            })}
        </div>
    );
}
