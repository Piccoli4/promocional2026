import { useTheme } from "../../context/ThemeContext";
import { teamLogos } from "../../data/teamLogos";

export default function MatchCard({ match, highlightTeam = null }) {
    const { theme } = useTheme();
    const hasResult = match.result !== null;
    const homeScore = hasResult ? match.result.homeScore : null;
    const awayScore = hasResult ? match.result.awayScore : null;
    const homeWon = hasResult && homeScore > awayScore;
    const awayWon = hasResult && awayScore > homeScore;

    const homeLogo = teamLogos[match.home];
    const awayLogo = teamLogos[match.away];

    const homeIsHighlighted = highlightTeam === match.home;
    const awayIsHighlighted = highlightTeam === match.away;

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-3 transition-all duration-200"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${hasResult ? theme.borderAccent + "44" : theme.border}`,
                boxShadow: theme.shadowCard,
            }}
        >
            {/* Local */}
            <div
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-1 transition-colors duration-200"
                style={{
                    backgroundColor: homeIsHighlighted ? "#A9000010" : "transparent",
                }}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                        className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: "#A90000", color: "white" }}
                    >
                        L
                    </span>
                    {homeLogo && (
                        <img src={homeLogo} alt={match.home} className="w-12 h-12 object-contain shrink-0" />
                    )}
                    <span
                        className="text-sm font-bold uppercase tracking-wide truncate"
                        style={{
                            color: homeIsHighlighted
                                ? "#A90000"
                                : homeWon
                                    ? theme.textPrimary
                                    : theme.textSecondary,
                            fontWeight: homeIsHighlighted ? 900 : undefined,
                        }}
                    >
                        {match.home}
                    </span>
                    {homeWon && (
                        <span className="text-xs shrink-0" style={{ color: theme.textGreen }}>✓</span>
                    )}
                </div>
                <span
                    className="text-2xl font-black shrink-0 w-12 text-center rounded-xl py-1"
                    style={{
                        color: hasResult ? theme.textPrimary : theme.textMuted,
                        backgroundColor: homeWon ? "#A9000022" : "transparent",
                    }}
                >
                    {hasResult ? homeScore : "—"}
                </span>
            </div>

            {/* Separador */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                <span className="text-xs font-black" style={{ color: theme.textMuted }}>VS</span>
                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
            </div>

            {/* Visitante */}
            <div
                className="flex items-center justify-between gap-3 rounded-xl px-2 py-1 transition-colors duration-200"
                style={{
                    backgroundColor: awayIsHighlighted ? "#A9000010" : "transparent",
                }}
            >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span
                        className="text-xs font-black px-1.5 py-0.5 rounded shrink-0"
                        style={{ backgroundColor: theme.borderStrong, color: theme.textSecondary }}
                    >
                        V
                    </span>
                    {awayLogo && (
                        <img src={awayLogo} alt={match.away} className="w-12 h-12 object-contain shrink-0" />
                    )}
                    <span
                        className="text-sm font-bold uppercase tracking-wide truncate"
                        style={{
                            color: awayIsHighlighted
                                ? "#A90000"
                                : awayWon
                                    ? theme.textPrimary
                                    : theme.textSecondary,
                            fontWeight: awayIsHighlighted ? 900 : undefined,
                        }}
                    >
                        {match.away}
                    </span>
                    {awayWon && (
                        <span className="text-xs shrink-0" style={{ color: theme.textGreen }}>✓</span>
                    )}
                </div>
                <span
                    className="text-2xl font-black shrink-0 w-12 text-center rounded-xl py-1"
                    style={{
                        color: hasResult ? theme.textPrimary : theme.textMuted,
                        backgroundColor: awayWon ? "#A9000022" : "transparent",
                    }}
                >
                    {hasResult ? awayScore : "—"}
                </span>
            </div>

            {/* Estado */}
            <div className="flex justify-center pt-1">
                {hasResult ? (
                    <span
                        className="text-xs px-3 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: theme.textGreen + "22", color: theme.textGreen }}
                    >
                        Final
                    </span>
                ) : (
                    <span
                        className="text-xs px-3 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: theme.border, color: theme.textMuted }}
                    >
                        Pendiente
                    </span>
                )}
            </div>
        </div>
    );
}