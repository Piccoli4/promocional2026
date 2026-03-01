import { useTheme } from "../../context/ThemeContext";
import { teamLogos } from "../../data/teamLogos";

export default function NextRound({ round }) {
    const { theme } = useTheme();
    if (!round) return null;

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                    {round.label}
                </h2>
                <span
                    className="text-xs px-3 py-1 rounded-full font-semibold"
                    style={{ backgroundColor: theme.border, color: theme.textMuted }}
                >
                    Próxima fecha
                </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {round.matches.map((match) => {
                    const homeLogo = teamLogos[match.home];
                    const awayLogo = teamLogos[match.away];

                    return (
                        <div
                            key={match.id}
                            className="rounded-2xl p-4 flex flex-col gap-3"
                            style={{
                                backgroundColor: theme.bgCard,
                                border: `1px solid ${theme.border}`,
                                boxShadow: theme.shadowCard,
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                                    style={{ backgroundColor: "#A90000", color: "white" }}
                                >
                                    L
                                </span>
                                {homeLogo && (
                                    <img src={homeLogo} alt={match.home} className="w-7 h-7 object-contain shrink-0" />
                                )}
                                <span
                                    className="text-sm font-bold uppercase tracking-wide truncate"
                                    style={{ color: theme.textPrimary }}
                                >
                                    {match.home}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                                <span className="text-xs font-black" style={{ color: theme.textMuted }}>VS</span>
                                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                            </div>

                            <div className="flex items-center gap-2">
                                <span
                                    className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                                    style={{ backgroundColor: theme.borderStrong, color: theme.textSecondary }}
                                >
                                    V
                                </span>
                                {awayLogo && (
                                    <img src={awayLogo} alt={match.away} className="w-7 h-7 object-contain shrink-0" />
                                )}
                                <span
                                    className="text-sm font-bold uppercase tracking-wide truncate"
                                    style={{ color: theme.textPrimary }}
                                >
                                    {match.away}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}