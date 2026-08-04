import { Link } from "react-router-dom";
import TeamLogo from "../ui/TeamLogo";
import { teamShortNames } from "../../data/teamLogos";
import { formatDateLong } from "../../data/fixture";
import { useMatchesWithStats } from "../../hooks/useStats";

/**
 * Tarjeta de partido con estética de marcador: cada equipo tiene su
 * "casillero" hundido y el ganador queda realzado en rojo.
 */
function TeamRow({ team, score, isHome, won, played, highlighted }) {
    const short = teamShortNames[team] ?? team;

    return (
        <div
            className="flex items-center gap-2.5 rounded-2xl px-2 py-1.5 transition-colors duration-300"
            style={{ background: highlighted ? "var(--red-ghost)" : "transparent" }}
        >
            <TeamLogo team={team} size={34} dim={played && !won} />

            <span className="flex min-w-0 flex-1 flex-col leading-tight">
                <span
                    className="cond truncate text-[0.92rem] font-bold uppercase tracking-wide"
                    style={{
                        color: highlighted
                            ? "var(--red)"
                            : played && !won
                                ? "var(--text-3)"
                                : "var(--text-1)",
                    }}
                >
                    {short}
                </span>
                <span
                    className="cond text-[0.6rem] font-semibold uppercase tracking-[0.14em]"
                    style={{ color: "var(--text-3)" }}
                >
                    {isHome ? "Local" : "Visitante"}
                </span>
            </span>

            <span
                className="tabular flex h-11 w-14 shrink-0 items-center justify-center rounded-xl text-2xl transition-all duration-300"
                style={
                    won
                        ? {
                            color: "#fff",
                            background: "linear-gradient(145deg, var(--red-bright), var(--red))",
                            boxShadow: "var(--nm-xs), 0 4px 14px -5px var(--red)",
                        }
                        : {
                            color: played ? "var(--text-2)" : "var(--text-3)",
                            background: "var(--sunken)",
                            boxShadow: "var(--nm-in-sm)",
                        }
                }
            >
                {played ? score : "–"}
            </span>
        </div>
    );
}

export default function MatchCard({ match, highlightTeam = null, date, delay = 0 }) {
    const result = match.result;
    const played =
        !!result && result.homeScore !== null && result.homeScore !== undefined;

    const homeScore = played ? Number(result.homeScore) : null;
    const awayScore = played ? Number(result.awayScore) : null;
    const homeWon = played && homeScore > awayScore;
    const awayWon = played && awayScore > homeScore;
    const walkover = played && result.walkover;
    const conPlanilla = useMatchesWithStats().has(match.id);

    return (
        <article
            className="nm nm-edge nm-hover a-rise flex flex-col gap-1 p-3.5"
            style={{ "--d": `${delay}ms` }}
        >
            <TeamRow
                team={match.home}
                score={homeScore}
                isHome
                won={homeWon}
                played={played}
                highlighted={highlightTeam === match.home}
            />

            <div className="flex items-center gap-3 px-2">
                <span className="h-px flex-1" style={{ background: "var(--line)" }} />
                <span
                    className="cond text-[0.62rem] font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--text-3)" }}
                >
                    {played ? "Final" : "vs"}
                </span>
                <span className="h-px flex-1" style={{ background: "var(--line)" }} />
            </div>

            <TeamRow
                team={match.away}
                score={awayScore}
                isHome={false}
                won={awayWon}
                played={played}
                highlighted={highlightTeam === match.away}
            />

            {(date || walkover || conPlanilla) && (
                <div className="flex items-center justify-between gap-2 px-2 pt-1.5">
                    <span
                        className="cond text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--text-3)" }}
                    >
                        {date ? formatDateLong(date) : ""}
                    </span>

                    <span className="flex items-center gap-3">
                        {walkover && (
                            <span
                                className="cond text-[0.6rem] font-bold uppercase tracking-[0.14em]"
                                style={{ color: "var(--warn)" }}
                            >
                                Ganó por default
                            </span>
                        )}
                        {conPlanilla && (
                            <Link
                                to={`/partido/${match.id}`}
                                className="cond text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                                style={{ color: "var(--red)" }}
                            >
                                Planilla →
                            </Link>
                        )}
                    </span>
                </div>
            )}
        </article>
    );
}
