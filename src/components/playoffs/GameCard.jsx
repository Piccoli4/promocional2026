import TeamLogo from "../ui/TeamLogo";
import { teamTinyNames } from "../../data/teamLogos";
import { formatDateLong } from "../../data/fixture";

function SideRow({ team, placeholder, seed, score, isWinner, played }) {
    const name = team ? teamTinyNames[team] ?? team : placeholder;

    return (
        <div
            className="flex items-center gap-2.5 rounded-2xl px-2 py-2 transition-colors duration-300"
            style={{ background: isWinner ? "var(--red-ghost)" : "transparent" }}
        >
            {team ? (
                <TeamLogo team={team} size={30} dim={played && !isWinner} />
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
                    className="tabular w-6 shrink-0 text-center text-[0.7rem]"
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
                            : played
                                ? "var(--text-3)"
                                : "var(--text-1)",
                    fontStyle: team ? "normal" : "italic",
                }}
            >
                {name}
            </span>

            <span
                className="tabular flex h-9 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                style={
                    isWinner
                        ? {
                            color: "#fff",
                            background: "linear-gradient(145deg, var(--red-bright), var(--red))",
                            boxShadow: "0 4px 12px -5px var(--red)",
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

export default function GameCard({ game, delay = 0, showLabel = true }) {
    const { played, result, winner } = game;
    const homeScore = played ? Number(result.homeScore) : null;
    const awayScore = played ? Number(result.awayScore) : null;

    return (
        <article
            className="nm nm-edge nm-hover a-rise flex flex-col gap-1 p-3.5"
            style={{ "--d": `${delay}ms` }}
        >
            {showLabel && (
                <header className="flex items-center justify-between gap-2 px-1 pb-1">
                    <span className="display text-base" style={{ color: "var(--text-2)" }}>
                        {game.label}
                    </span>
                    <span
                        className="cond text-[0.62rem] font-bold uppercase tracking-[0.14em]"
                        style={{ color: played ? "var(--ok)" : "var(--text-3)" }}
                    >
                        {played ? "Final" : formatDateLong(game.date)}
                    </span>
                </header>
            )}

            <SideRow
                team={game.home}
                placeholder={game.labelA}
                seed={game.homeSeed}
                score={homeScore}
                isWinner={played && winner === game.home}
                played={played}
            />
            <SideRow
                team={game.away}
                placeholder={game.labelB}
                seed={game.awaySeed}
                score={awayScore}
                isWinner={played && winner === game.away}
                played={played}
            />
        </article>
    );
}
