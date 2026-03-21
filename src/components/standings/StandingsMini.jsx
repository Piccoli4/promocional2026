import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { teamLogos, teamShortNames } from "../../data/teamLogos";

export default function StandingsMini({ standings, loading }) {
    const { theme } = useTheme();
    if (loading) return null;

    const topTeams = standings.slice(0, 6);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                    Tabla de Posiciones
                </h2>
                <Link
                    to="/tabla"
                    className="text-xs font-bold uppercase tracking-wider transition-colors duration-200"
                    style={{ color: "#A90000" }}
                >
                    Ver completa →
                </Link>
            </div>

            <div
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}
            >
                {/* Header */}
                <div
                    className="grid text-xs font-black uppercase tracking-widest px-3 py-2"
                    style={{
                        backgroundColor: theme.bgTableHead,
                        color: "#ffffff55",
                        gridTemplateColumns: "1.8rem 1fr 2.2rem 2.2rem 2.2rem 2.8rem",
                    }}
                >
                    <span className="text-center">#</span>
                    <span>Equipo</span>
                    <span className="text-center">PJ</span>
                    <span className="text-center">PG</span>
                    <span className="text-center">PP</span>
                    <span className="text-center">PTS</span>
                </div>

                {/* Filas */}
                {topTeams.map((entry, index) => {
                    const position = index + 1;
                    const isTop = position <= 8;
                    const isEven = index % 2 === 0;
                    const logo = teamLogos[entry.team];
                    const shortName = teamShortNames[entry.team] ?? entry.team;

                    return (
                        <div
                            key={entry.team}
                            className="grid items-center px-3 py-2.5"
                            style={{
                                gridTemplateColumns: "1.8rem 1fr 2.2rem 2.2rem 2.2rem 2.8rem",
                                backgroundColor: isEven ? theme.bgRow1 : theme.bgRow2,
                                borderLeft: `3px solid ${isTop ? "#A90000" : "transparent"}`,
                            }}
                        >
                            <span
                                className="text-center text-xs font-black"
                                style={{ color: isTop ? "#A90000" : theme.textMuted }}
                            >
                                {position}
                            </span>
                            <span
                                className="text-xs font-bold uppercase tracking-wide truncate"
                                style={{ color: theme.textPrimary }}
                            >
                                <div className="flex items-center gap-1.5 min-w-0">
                                    {logo && (
                                        <img
                                            src={logo}
                                            alt={entry.team}
                                            className="w-5 h-5 object-contain flex-shrink-0"
                                        />
                                    )}
                                    <span
                                        className="block sm:hidden text-xs font-bold uppercase tracking-wide"
                                        style={{ color: theme.textPrimary }}
                                    >
                                        {shortName}
                                    </span>
                                    <span
                                        className="hidden sm:block text-xs font-bold uppercase tracking-wide truncate"
                                        style={{ color: theme.textPrimary }}
                                    >
                                        {entry.team}
                                    </span>
                                </div>
                            </span>
                            <span className="text-center text-xs" style={{ color: theme.textSecondary }}>
                                {entry.played}
                            </span>
                            <span className="text-center text-xs font-semibold" style={{ color: theme.textGreen }}>
                                {entry.won}
                            </span>
                            <span className="text-center text-xs" style={{ color: theme.textRed }}>
                                {entry.lost}
                            </span>
                            <div className="flex justify-center">
                                <span
                                    className="text-xs font-black px-1.5 py-0.5 rounded-lg text-center"
                                    style={{
                                        backgroundColor: entry.played > 0 ? "#A9000022" : "transparent",
                                        color: entry.played > 0 ? "#A90000" : theme.textMuted,
                                    }}
                                >
                                    {entry.points}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {/* Footer */}
                <div
                    className="px-3 py-2 text-center"
                    style={{
                        backgroundColor: theme.bgTableFoot,
                        borderTop: "1px solid #ffffff10",
                    }}
                >
                    <Link
                        to="/tabla"
                        className="text-xs uppercase tracking-widest font-semibold"
                        style={{ color: "#ffffff55" }}
                    >
                        Ver los 12 equipos →
                    </Link>
                </div>
            </div>
        </div>
    );
}