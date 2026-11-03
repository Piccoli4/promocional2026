import { Link } from "react-router-dom";
import TeamLogo from "../ui/TeamLogo";
import { teamTinyNames } from "../../data/teamLogos";
import { formatDate } from "../../data/fixture";
import { useMatchesWithStats } from "../../hooks/useStats";

/** Marcadores de la serie: dos círculos que se encienden con cada victoria. */
function WinDots({ wins }) {
    return (
        <span className="flex shrink-0 gap-1">
            {[0, 1].map((i) => (
                <span
                    key={i}
                    className="h-2 w-2 rounded-full transition-all duration-500"
                    style={
                        i < wins
                            ? { background: "var(--red)", boxShadow: "0 0 8px -1px var(--red)" }
                            : { background: "var(--line-strong)" }
                    }
                />
            ))}
        </span>
    );
}

/** Rival que sale del Play In en juego: escudos de los que todavía pueden tocarle. */
function CandidatesRow({ candidates, placeholder }) {
    const projected = candidates.find((c) => c.projected);

    return (
        <div className="flex items-center gap-2.5 rounded-2xl px-2 py-2">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-1.5">
                    {candidates.map((c) => (
                        <span key={c.team} title={teamTinyNames[c.team] ?? c.team} className="inline-flex">
                            <TeamLogo
                                team={c.team}
                                size={c.projected ? 28 : 22}
                                dim={!!projected && !c.projected}
                            />
                        </span>
                    ))}
                </span>
                <span
                    className="cond truncate text-[0.7rem] font-bold uppercase tracking-wide"
                    style={{ color: "var(--text-3)" }}
                >
                    <span className="italic">{placeholder}</span>
                    {projected && (
                        <>
                            {" · "}hoy:{" "}
                            <span style={{ color: "var(--red)" }}>
                                {teamTinyNames[projected.team] ?? projected.team}
                            </span>
                        </>
                    )}
                </span>
            </div>

            <WinDots wins={0} />

            <span className="tabular w-5 shrink-0 text-center text-lg" style={{ color: "var(--text-2)" }}>
                0
            </span>
        </div>
    );
}

function SideRow({ team, placeholder, seed, wins, isWinner, decided }) {
    const name = team ? teamTinyNames[team] ?? team : placeholder;

    return (
        <div
            className="flex items-center gap-2.5 rounded-2xl px-2 py-2 transition-colors duration-300"
            style={{ background: isWinner ? "var(--red-ghost)" : "transparent" }}
        >
            {team ? (
                <TeamLogo team={team} size={30} dim={decided && !isWinner} />
            ) : (
                <span
                    className="nm-in-sm flex h-[30px] w-[30px] items-center justify-center rounded-full text-[0.6rem]"
                    style={{ color: "var(--text-3)" }}
                >
                    ?
                </span>
            )}

            {seed != null && (
                <span
                    className="tabular w-5 shrink-0 text-center text-[0.7rem]"
                    style={{ color: "var(--text-3)" }}
                >
                    {seed}°
                </span>
            )}

            <span
                className="cond min-w-0 flex-1 truncate text-[0.86rem] font-bold uppercase tracking-wide"
                style={{
                    color: !team
                        ? "var(--text-3)"
                        : isWinner
                            ? "var(--red)"
                            : decided
                                ? "var(--text-3)"
                                : "var(--text-1)",
                    fontStyle: team ? "normal" : "italic",
                }}
            >
                {name}
            </span>

            <WinDots wins={wins} />

            <span
                className="tabular w-5 shrink-0 text-center text-lg"
                style={{ color: isWinner ? "var(--red)" : "var(--text-2)" }}
            >
                {wins}
            </span>
        </div>
    );
}

/**
 * `columnaPlanilla`: si algún juego de la serie tiene planilla, todas las filas
 * reservan la columna del enlace para que los marcadores queden alineados.
 */
function GameLine({ game, conPlanilla, columnaPlanilla }) {
    // El juego 2 se disputa en cancha del segundo sembrado: hay que invertir
    // el marcador para mostrarlo siempre en el orden A – B.
    const flipped = game.num === 2;
    const scoreA = game.played
        ? Number(flipped ? game.result.awayScore : game.result.homeScore)
        : null;
    const scoreB = game.played
        ? Number(flipped ? game.result.homeScore : game.result.awayScore)
        : null;

    const muted = game.skipped;

    return (
        <div
            className="grid items-center gap-2 rounded-xl px-2 py-1"
            style={{
                gridTemplateColumns: columnaPlanilla ? "1.6rem 1fr auto 4.2rem" : "1.6rem 1fr auto",
                opacity: muted ? 0.35 : 1,
            }}
        >
            <span
                className="cond text-[0.65rem] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-3)" }}
            >
                J{game.num}
            </span>
            <span
                className="cond text-[0.65rem] font-semibold uppercase tracking-wider"
                style={{ color: "var(--text-3)" }}
            >
                {muted ? "no se juega" : formatDate(game.date)}
                {!muted && game.home && (
                    <span style={{ color: "var(--text-3)" }}>
                        {" · "}en {teamTinyNames[game.home] ?? game.home}
                    </span>
                )}
            </span>
            <span
                className="tabular text-sm"
                style={{ color: game.played ? "var(--text-1)" : "var(--text-3)" }}
            >
                {game.played ? `${scoreA} – ${scoreB}` : "– –"}
            </span>
            {columnaPlanilla &&
                (conPlanilla ? (
                    <Link
                        to={`/partido/${game.id}`}
                        className="cond justify-self-end text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: "var(--red)" }}
                    >
                        Planilla →
                    </Link>
                ) : (
                    <span />
                ))}
        </div>
    );
}

export default function SeriesCard({ series, delay = 0, compact = false }) {
    const { teamA, teamB, seedA, seedB, winsA, winsB, winner, over, ready } = series;
    const conPlanilla = useMatchesWithStats();
    const columnaPlanilla = series.games.some((g) => conPlanilla.has(g.id));

    const status = over
        ? { text: "Serie definida", color: "var(--ok)" }
        : ready
            ? winsA + winsB > 0
                ? { text: `Serie ${winsA}–${winsB}`, color: "var(--red)" }
                : { text: "Por jugarse", color: "var(--text-3)" }
            : { text: "A definir", color: "var(--text-3)" };

    return (
        <article
            className="nm nm-edge nm-hover a-rise flex flex-col gap-1 p-3.5"
            style={{ "--d": `${delay}ms` }}
        >
            <header className="flex items-center justify-between gap-2 px-1 pb-1">
                <span
                    className="display text-base"
                    style={{ color: "var(--text-2)" }}
                >
                    {series.label}
                </span>
                <span
                    className="cond text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                    style={{ color: status.color }}
                >
                    {status.text}
                </span>
            </header>

            <SideRow
                team={teamA}
                placeholder={series.labelA}
                seed={seedA}
                wins={winsA}
                isWinner={over && winner === teamA}
                decided={over}
            />
            {!teamB && series.candidatesB?.length ? (
                <CandidatesRow candidates={series.candidatesB} placeholder={series.labelB} />
            ) : (
                <SideRow
                    team={teamB}
                    placeholder={series.labelB}
                    seed={seedB}
                    wins={winsB}
                    isWinner={over && winner === teamB}
                    decided={over}
                />
            )}

            {!compact && (
                <div
                    className="mt-1.5 flex flex-col gap-0.5 border-t pt-2"
                    style={{ borderColor: "var(--line)" }}
                >
                    {series.games.map((game) => (
                        <GameLine
                            key={game.id}
                            game={game}
                            conPlanilla={conPlanilla.has(game.id)}
                            columnaPlanilla={columnaPlanilla}
                        />
                    ))}
                </div>
            )}
        </article>
    );
}
