import { useTheme } from "../../context/ThemeContext";
import { teamLogos, teamShortNames } from "../../data/teamLogos";
import { useIsMobile } from "../../hooks/useIsMobile";

export default function StandingsTable({ standings, loading }) {
    const { theme } = useTheme();
    const isMobile = useIsMobile();

    // En mobile: sin columnas DF y PF → más espacio para el nombre
    const gridCols = isMobile
        ? "1.8rem 1fr 2.2rem 2.2rem 2.2rem 2.8rem"
        : "2rem 1fr 2.5rem 2.5rem 2.5rem 2.5rem 3rem 3rem";

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div
                    className="w-10 h-10 rounded-full border-4 animate-spin"
                    style={{ borderColor: "#A90000", borderTopColor: "transparent" }}
                />
            </div>
        );
    }

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${theme.border}`, boxShadow: theme.shadow }}
        >
            {/* Header */}
            <div
                className="grid text-xs font-black uppercase tracking-widest px-3 py-3"
                style={{
                    backgroundColor: theme.bgTableHead,
                    color: "#ffffff66",
                    gridTemplateColumns: gridCols,
                }}
            >
                <span className="text-center">#</span>
                <span className="pl-1">Equipo</span>
                <span className="text-center">PJ</span>
                <span className="text-center">PG</span>
                <span className="text-center">PP</span>
                {!isMobile && <span className="text-center">DF</span>}
                {!isMobile && <span className="text-center">PF</span>}
                <span className="text-center" style={{ color: "#ffffffaa" }}>PTS</span>
            </div>

            {/* Filas */}
            {standings.map((entry, index) => {
                const position = index + 1;
                const isTop = position <= 8;
                const isEven = index % 2 === 0;
                const logo = teamLogos[entry.team];
                const shortName = teamShortNames[entry.team] ?? entry.team;

                return (
                    <div
                        key={entry.team}
                        className="grid items-center px-3 py-2.5 transition-colors duration-150"
                        style={{
                            gridTemplateColumns: gridCols,
                            backgroundColor: isEven ? theme.bgRow1 : theme.bgRow2,
                            borderLeft: `3px solid ${isTop ? "#A90000" : "transparent"}`,
                        }}
                    >
                        {/* Posición */}
                        <span
                            className="text-center text-sm font-black"
                            style={{ color: isTop ? "#A90000" : theme.textMuted }}
                        >
                            {position}
                        </span>

                        {/* Equipo */}
                        <div className="flex items-center gap-2 min-w-0 pl-1">
                            {logo && (
                                <img
                                    src={logo}
                                    alt={entry.team}
                                    className="w-7 h-7 object-contain flex-shrink-0"
                                />
                            )}
                            <div className="flex flex-col min-w-0">
                                <span
                                    className="text-xs font-bold uppercase tracking-wide truncate"
                                    style={{ color: theme.textPrimary }}
                                >
                                    {isMobile ? shortName : entry.team}
                                </span>
                                {isTop && (
                                    <span
                                        className="font-semibold"
                                        style={{ color: "#A90000aa", fontSize: "0.6rem" }}
                                    >
                                        Clasifica
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Stats */}
                        <span className="text-center text-sm" style={{ color: theme.textSecondary }}>
                            {entry.played}
                        </span>
                        <span className="text-center text-sm font-semibold" style={{ color: theme.textGreen }}>
                            {entry.won}
                        </span>
                        <span className="text-center text-sm" style={{ color: theme.textRed }}>
                            {entry.lost}
                        </span>

                        {/* Solo en desktop */}
                        {!isMobile && (
                            <span
                                className="text-center text-xs"
                                style={{
                                    color: entry.pointsDiff > 0
                                        ? theme.textGreen
                                        : entry.pointsDiff < 0
                                            ? theme.textRed
                                            : theme.textMuted,
                                }}
                            >
                                {entry.pointsDiff > 0 ? `+${entry.pointsDiff}` : entry.pointsDiff}
                            </span>
                        )}
                        {!isMobile && (
                            <span className="text-center text-xs" style={{ color: theme.textMuted }}>
                                {entry.pointsFor}
                            </span>
                        )}

                        {/* Puntos */}
                        <div className="flex justify-center">
                            <span
                                className="text-sm font-black px-2 py-0.5 rounded-lg min-w-[2rem] text-center"
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

            {/* Leyenda */}
            <div
                className="px-4 py-3 flex flex-wrap gap-4 text-xs"
                style={{
                    backgroundColor: theme.bgTableFoot,
                    borderTop: "1px solid #ffffff10",
                    color: "#ffffff55",
                }}
            >
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#A90000" }} />
                    <span>Clasifica a playoffs (Top 8)</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span>PJ: Jugados</span>
                    <span>PG: Ganados</span>
                    <span>PP: Perdidos</span>
                    {!isMobile && <span>DF: Diferencia</span>}
                    {!isMobile && <span>PF: Pts. favor</span>}
                    <span>PTS: Tabla</span>
                </div>
            </div>
        </div>
    );
}