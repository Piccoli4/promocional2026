import { useTheme } from "../../context/ThemeContext";
import MatchCard from "./MatchCard";

// 1ª Fecha = 08/03/2026 — Fecha 5 en adelante se corre una semana (05/04 suspendida)
const ROUND_START_DATE = new Date(2026, 2, 8); // 8 de marzo 2026

export function getRoundDate(roundNumber) {
    const date = new Date(ROUND_START_DATE);
    const weeksOffset = roundNumber >= 5 ? roundNumber : roundNumber - 1;
    date.setDate(date.getDate() + weeksOffset * 7);
    return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
    });
}

export default function RoundCard({ round, isSelected, onClick }) {
    const { theme } = useTheme();
    const totalMatches = round.matches.length;
    const playedMatches = round.matches.filter((m) => m.result !== null).length;
    const allDone = playedMatches === totalMatches;
    const hasAny = playedMatches > 0;

    const roundDate = getRoundDate(round.round);

    return (
        <div
            className="rounded-2xl overflow-hidden transition-all duration-200"
            style={{
                border: `1px solid ${isSelected ? "#A90000" : theme.border}`,
                boxShadow: isSelected ? "0 4px 20px rgba(169,0,0,0.15)" : theme.shadowCard,
            }}
        >
            {/* Header */}
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between px-5 py-4 transition-colors duration-200"
                style={{ backgroundColor: isSelected ? "#A9000015" : theme.bgCard }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                            backgroundColor: allDone
                                ? theme.textGreen
                                : hasAny
                                    ? "#A90000"
                                    : theme.border,
                        }}
                    />
                    <div className="flex flex-col items-start">
                        <span
                            className="font-black uppercase tracking-wider text-sm"
                            style={{ color: theme.textPrimary }}
                        >
                            {round.label}
                        </span>
                        <span
                            className="text-xs font-medium"
                            style={{ color: theme.textMuted }}
                        >
                            {roundDate}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: theme.textMuted }}>
                        {playedMatches}/{totalMatches}
                    </span>
                    <svg
                        className="w-4 h-4 transition-transform duration-200"
                        style={{
                            color: theme.textMuted,
                            transform: isSelected ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {/* Partidos */}
            {isSelected && (
                <div
                    className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4"
                    style={{
                        backgroundColor: theme.bgApp,
                        borderTop: `1px solid ${theme.border}`,
                    }}
                >
                    {round.matches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            )}
        </div>
    );
}