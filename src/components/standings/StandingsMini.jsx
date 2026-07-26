import { Link } from "react-router-dom";
import TeamLogo from "../ui/TeamLogo";
import { SectionTitle, Chip, Spinner } from "../ui/Primitives";
import { zoneOf } from "../../data/playoffs";
import { teamShortNames } from "../../data/teamLogos";

export default function StandingsMini({ standings, loading, limit = 12 }) {
    return (
        <section className="flex flex-col gap-4">
            <SectionTitle
                eyebrow="Zona única"
                title="Posiciones"
                right={
                    <Link to="/tabla" className="nm-btn px-4 py-2 text-xs">
                        Ver todo
                    </Link>
                }
            />

            <div className="nm nm-edge p-2 sm:p-3">
                {loading ? (
                    <Spinner size={32} />
                ) : (
                    <div className="flex flex-col gap-0.5">
                        {standings.slice(0, limit).map((entry, i) => {
                            const position = i + 1;
                            const zone = zoneOf(position);

                            return (
                                <div
                                    key={entry.team}
                                    className="a-slide grid items-center gap-2 rounded-2xl px-2 py-2"
                                    style={{
                                        gridTemplateColumns: "2.2rem minmax(0,1fr) 2rem 2.6rem",
                                        "--d": `${i * 40}ms`,
                                    }}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <span
                                            className="h-6 w-1 shrink-0 rounded-full"
                                            style={{ background: zone.color }}
                                        />
                                        <span
                                            className="tabular text-sm"
                                            style={{
                                                color: position <= 4 ? "var(--gold)" : "var(--text-2)",
                                            }}
                                        >
                                            {position}
                                        </span>
                                    </span>

                                    <span className="flex min-w-0 items-center gap-2">
                                        <TeamLogo team={entry.team} size={24} />
                                        <span
                                            className="cond truncate text-[0.82rem] font-bold uppercase tracking-wide"
                                            style={{ color: "var(--text-1)" }}
                                        >
                                            {teamShortNames[entry.team] ?? entry.team}
                                        </span>
                                    </span>

                                    <span
                                        className="tabular text-center text-xs"
                                        style={{ color: "var(--text-3)" }}
                                    >
                                        {entry.played}
                                    </span>

                                    <span
                                        className="tabular text-center text-base"
                                        style={{ color: "var(--red)" }}
                                    >
                                        {entry.points}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
