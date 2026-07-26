import MatchCard from "./MatchCard";
import { formatDateLong } from "../../data/fixture";

export default function RoundCard({ round, isSelected, onClick, delay = 0 }) {
    const total = round.matches.length;
    const played = round.matches.filter((m) => m.result !== null).length;
    const allDone = played === total;
    const started = played > 0;

    const dot = allDone ? "var(--ok)" : started ? "var(--red)" : "var(--line-strong)";

    return (
        <section
            className="a-rise overflow-hidden rounded-3xl transition-all duration-300"
            style={{
                background: "var(--surface)",
                boxShadow: isSelected ? "var(--nm-in)" : "var(--nm)",
                "--d": `${delay}ms`,
            }}
        >
            <button
                onClick={onClick}
                aria-expanded={isSelected}
                className="flex w-full items-center gap-3 px-4 py-4 text-left sm:px-5"
            >
                {/* Número de fecha en relieve */}
                <span
                    className="display flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl transition-all duration-300"
                    style={
                        isSelected
                            ? {
                                color: "#fff",
                                background: "linear-gradient(145deg, var(--red-bright), var(--red))",
                                boxShadow: "0 5px 16px -6px var(--red)",
                            }
                            : {
                                color: "var(--text-2)",
                                background: "var(--surface)",
                                boxShadow: "var(--nm-sm)",
                            }
                    }
                >
                    {round.round}
                </span>

                <span className="flex min-w-0 flex-1 flex-col leading-tight">
                    <span
                        className="display truncate text-lg"
                        style={{ color: "var(--text-1)" }}
                    >
                        {round.label}
                    </span>
                    <span
                        className="cond text-[0.68rem] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: "var(--text-3)" }}
                    >
                        {formatDateLong(round.date)}
                    </span>
                </span>

                <span className="flex shrink-0 items-center gap-2.5">
                    <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: dot }}
                    />
                    <span
                        className="tabular text-sm"
                        style={{ color: "var(--text-3)" }}
                    >
                        {played}/{total}
                    </span>
                    <svg
                        className="h-4 w-4 transition-transform duration-300"
                        style={{
                            color: "var(--text-3)",
                            transform: isSelected ? "rotate(180deg)" : "none",
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
                </span>
            </button>

            {isSelected && (
                <div className="grid grid-cols-1 gap-3 px-3 pb-4 sm:grid-cols-2 sm:px-4">
                    {round.matches.map((match, i) => (
                        <MatchCard key={match.id} match={match} delay={i * 45} />
                    ))}
                </div>
            )}
        </section>
    );
}
