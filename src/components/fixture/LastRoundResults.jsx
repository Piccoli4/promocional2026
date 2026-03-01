import { useTheme } from "../../context/ThemeContext";
import MatchCard from "./MatchCard";

export default function LastRoundResults({ round }) {
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
                    style={{ backgroundColor: theme.textGreen + "22", color: theme.textGreen }}
                >
                    Última jugada
                </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {round.matches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                ))}
            </div>
        </div>
    );
}