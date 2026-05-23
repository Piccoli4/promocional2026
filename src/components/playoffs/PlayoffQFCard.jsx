import { useTheme } from "../../context/ThemeContext";
import { teamLogos, teamShortNames } from "../../data/teamLogos";

function SeedBadge({ seed, isWinner }) {
    return (
        <span
            className="text-xs font-black w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{
                backgroundColor: isWinner ? "#A90000" : "#A9000033",
                color: isWinner ? "#ffffff" : "#A90000",
            }}
        >
            {seed}
        </span>
    );
}

function TeamRow({ team, seed, score, isWinner, isLoser, isHome }) {
    const { theme } = useTheme();
    const logo = team ? teamLogos[team] : null;
    const shortName = team ? (teamShortNames[team] ?? team) : null;

    return (
        <div
            className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl transition-all"
            style={{
                backgroundColor: isWinner ? "#A9000015" : "transparent",
                border: isWinner ? "1px solid #A9000033" : "1px solid transparent",
            }}
        >
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <SeedBadge seed={seed} isWinner={isWinner} />
                {logo && <img src={logo} alt={team} className="w-6 h-6 object-contain shrink-0" />}
                <div className="flex flex-col min-w-0">
                    {team ? (
                        <>
                            <span
                                className="text-xs font-black uppercase tracking-wide leading-tight block sm:hidden truncate"
                                style={{ color: isWinner ? theme.textPrimary : theme.textSecondary }}
                            >
                                {shortName}
                            </span>
                            <span
                                className="text-xs font-black uppercase tracking-wide leading-tight hidden sm:block truncate"
                                style={{ color: isWinner ? theme.textPrimary : theme.textSecondary }}
                            >
                                {team}
                            </span>
                        </>
                    ) : (
                        <span className="text-xs uppercase tracking-wide" style={{ color: theme.textMuted }}>
                            {isHome ? "Local (por definir)" : "Visitante (por definir)"}
                        </span>
                    )}
                    {isHome && (
                        <span className="text-xs" style={{ color: theme.textMuted }}>Local</span>
                    )}
                </div>
            </div>

            {score !== null && score !== undefined ? (
                <span
                    className="text-xl font-black w-10 text-center shrink-0"
                    style={{ color: isWinner ? "#A90000" : isLoser ? theme.textMuted : theme.textPrimary }}
                >
                    {score}
                </span>
            ) : (
                <span className="text-sm font-black w-10 text-center shrink-0" style={{ color: theme.textMuted }}>
                    –
                </span>
            )}
        </div>
    );
}

export default function PlayoffQFCard({ qf, date }) {
    const { theme } = useTheme();
    const { home, homeSeed, away, awaySeed, result, winner } = qf;

    const homeScore = result ? Number(result.homeScore) : null;
    const awayScore = result ? Number(result.awayScore) : null;
    const homeWon = winner === home;
    const awayWon = winner === away;

    return (
        <div
            className="rounded-2xl p-3 flex flex-col gap-1 transition-all duration-300"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${winner ? "#A9000033" : theme.border}`,
                boxShadow: theme.shadowCard,
            }}
        >
            {/* Fecha */}
            {date && (
                <div className="flex items-center justify-end mb-0.5">
                    <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: theme.border, color: theme.textMuted }}
                    >
                        📅 {date}
                    </span>
                </div>
            )}

            {winner && (
                <div
                    className="text-xs font-bold uppercase tracking-widest text-center py-1 rounded-lg mb-1"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}
                >
                    ✓ Clasificado
                </div>
            )}

            <TeamRow team={home} seed={homeSeed} score={homeScore} isWinner={homeWon} isLoser={awayWon} isHome={true} />

            <div className="flex items-center gap-2 px-3">
                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                <span className="text-xs font-black" style={{ color: theme.textMuted }}>VS</span>
                <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
            </div>

            <TeamRow team={away} seed={awaySeed} score={awayScore} isWinner={awayWon} isLoser={homeWon} isHome={false} />

            {!result && (
                <p className="text-center text-xs mt-1 py-1" style={{ color: theme.textMuted }}>
                    Pendiente
                </p>
            )}
        </div>
    );
}