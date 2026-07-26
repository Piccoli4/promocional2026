import TeamLogo from "../ui/TeamLogo";
import { teamShortNames } from "../../data/teamLogos";

export default function TeamFilter({ teams, selectedTeam, onSelect }) {
    return (
        <div className="flex flex-col gap-2.5">
            <span className="eyebrow">Filtrar por equipo</span>

            <div className="no-bar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
                <button
                    onClick={() => onSelect(null)}
                    className={`nm-btn shrink-0 px-4 py-2 text-xs ${selectedTeam === null ? "nm-btn-on" : ""}`}
                >
                    Todos
                </button>

                {teams.map((team) => {
                    const active = selectedTeam === team;
                    return (
                        <button
                            key={team}
                            onClick={() => onSelect(active ? null : team)}
                            title={team}
                            aria-pressed={active}
                            className={`nm-btn flex shrink-0 items-center gap-2 py-1.5 pl-1.5 pr-3.5 text-xs ${active ? "nm-btn-on" : ""}`}
                        >
                            <TeamLogo team={team} size={26} dim={!active && selectedTeam !== null} />
                            <span className="hidden sm:inline">{teamShortNames[team] ?? team}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
