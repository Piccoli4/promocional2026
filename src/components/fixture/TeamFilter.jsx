import TeamLogo from "../ui/TeamLogo";
import { teamShortNames } from "../../data/teamLogos";

export default function TeamFilter({ teams, selectedTeam, onSelect }) {
    return (
        <div className="flex flex-col gap-2.5">
            <span className="eyebrow">Filtrar por equipo</span>

            {/* Grilla de 7 columnas con "Todos" ocupando dos: los 12 equipos entran
                siempre en dos filas, sin scroll. Los nombres aparecen recién en pantallas anchas. */}
            <div className="grid grid-cols-7 gap-2">
                <button
                    onClick={() => onSelect(null)}
                    className={`nm-btn col-span-2 px-2 py-2 text-xs ${selectedTeam === null ? "nm-btn-on" : ""}`}
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
                            className={`nm-btn flex min-w-0 items-center justify-center gap-2 py-1.5 lg:justify-start lg:pl-1.5 lg:pr-3 text-xs ${active ? "nm-btn-on" : ""}`}
                        >
                            <TeamLogo team={team} size={26} dim={!active && selectedTeam !== null} />
                            <span className="hidden truncate lg:inline">{teamShortNames[team] ?? team}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
