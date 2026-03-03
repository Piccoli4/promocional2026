import { useTheme } from "../../context/ThemeContext";
import { teamLogos } from "../../data/teamLogos";

export default function TeamFilter({ teams, selectedTeam, onSelect }) {
    const { theme } = useTheme();

    return (
        <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest font-bold" style={{ color: theme.textMuted }}>
                Filtrar por equipo
            </span>

            {/* Scrollable pill row */}
            <div
                className="flex gap-2 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
                {/* "Todos" pill */}
                <button
                    onClick={() => onSelect(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 transition-all duration-200"
                    style={{
                        backgroundColor: selectedTeam === null ? "#A90000" : theme.bgCard,
                        color: selectedTeam === null ? "#fff" : theme.textSecondary,
                        border: `1px solid ${selectedTeam === null ? "#A90000" : theme.border}`,
                        boxShadow: selectedTeam === null ? "0 2px 8px rgba(169,0,0,0.3)" : "none",
                    }}
                >
                    Todos
                </button>

                {teams.map((team) => {
                    const logo = teamLogos[team];
                    const isSelected = selectedTeam === team;

                    return (
                        <button
                            key={team}
                            onClick={() => onSelect(isSelected ? null : team)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shrink-0 transition-all duration-200"
                            style={{
                                backgroundColor: isSelected ? "#A9000015" : theme.bgCard,
                                color: isSelected ? "#A90000" : theme.textSecondary,
                                border: `1px solid ${isSelected ? "#A90000" : theme.border}`,
                                boxShadow: isSelected ? "0 2px 8px rgba(169,0,0,0.15)" : "none",
                            }}
                        >
                            {logo && (
                                <img
                                    src={logo}
                                    alt={team}
                                    className="w-5 h-5 object-contain shrink-0"
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}