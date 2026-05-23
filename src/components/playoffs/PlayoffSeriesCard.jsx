// src/components/playoffs/PlayoffSeriesCard.jsx
import { useTheme } from "../../context/ThemeContext";
import { teamLogos, teamShortNames } from "../../data/teamLogos";

/**
 * Muestra una serie IDA/VUELTA/TERCERO (mejor de 3).
 *
 * Props:
 *   series  — objeto de serie del bracket
 *   dates   — { g1: "7 jun", g2: "14 jun", g3: "17 jun" }  (opcional)
 */

function ShieldPlaceholder({ theme }) {
    return (
        <svg viewBox="0 0 40 46" className="w-10 h-10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M20 2L4 8V22C4 31.4 11 40.1 20 43C29 40.1 36 31.4 36 22V8L20 2Z"
                stroke={theme.borderStrong}
                strokeWidth="2"
                strokeDasharray="4 2"
                fill={theme.bgCardAlt ?? theme.border}
                fillOpacity="0.4"
            />
            <text x="20" y="27" textAnchor="middle" fontSize="14" fontWeight="bold" fill={theme.textMuted}>?</text>
        </svg>
    );
}

function TeamHeader({ team, seed, wins, isWinner, label, isPending }) {
    const { theme } = useTheme();
    const logo = team ? teamLogos[team] : null;
    const shortName = team ? (teamShortNames[team] ?? team) : null;

    return (
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
            {logo ? (
                <img src={logo} alt={team} className="w-10 h-10 object-contain" />
            ) : (
                <ShieldPlaceholder theme={theme} />
            )}
            <div className="text-center px-1">
                {seed !== null && !isPending && (
                    <span
                        className="inline-block text-xs font-black px-1.5 py-0.5 rounded-full mb-0.5"
                        style={{
                            backgroundColor: isWinner ? "#A90000" : "#A9000022",
                            color: isWinner ? "#fff" : "#A90000",
                        }}
                    >
                        {seed}°
                    </span>
                )}
                <p
                    className="text-xs font-black uppercase tracking-wide leading-tight"
                    style={{ color: isPending ? theme.textMuted : isWinner ? theme.textPrimary : theme.textSecondary }}
                >
                    {shortName ?? label ?? "Por definir"}
                </p>
            </div>
            <span
                className="text-3xl font-black leading-none"
                style={{ color: isPending ? theme.textMuted : isWinner ? "#A90000" : theme.textPrimary }}
            >
                {isPending ? "–" : wins}
            </span>
        </div>
    );
}

function GameRow({ label, date, homeLabel, awayLabel, homeTeam, awayTeam, homeScore, awayScore, homeWon, played, isPending }) {
    const { theme } = useTheme();
    const homeShort = homeTeam ? (teamShortNames[homeTeam] ?? homeTeam) : homeLabel ?? "–";
    const awayShort = awayTeam ? (teamShortNames[awayTeam] ?? awayTeam) : awayLabel ?? "–";

    return (
        <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{
                backgroundColor: played ? theme.bgCardAlt ?? theme.bgCard : "transparent",
                border: `1px solid ${played ? theme.borderStrong : theme.border}`,
                opacity: isPending ? 0.4 : played ? 1 : 0.65,
            }}
        >
            {/* Label + fecha */}
            <div className="flex flex-col items-start shrink-0 w-16">
                <span className="text-xs font-black uppercase tracking-wider" style={{ color: "#A90000" }}>
                    {label}
                </span>
                {date && (
                    <span className="text-xs leading-tight" style={{ color: theme.textMuted, fontSize: "10px" }}>
                        {date}
                    </span>
                )}
            </div>

            {/* Home team */}
            <div className="flex items-center gap-1 flex-1 min-w-0 justify-end">
                <span className="text-xs font-bold uppercase truncate hidden sm:block"
                    style={{ color: homeWon && played ? theme.textPrimary : theme.textMuted }}>
                    {homeShort}
                </span>
                <span className="text-xs px-1 rounded shrink-0"
                    style={{ backgroundColor: "#00005522", color: theme.textMuted, fontSize: "9px" }}>
                    L
                </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-black w-7 text-right"
                    style={{ color: played ? (homeWon ? "#A90000" : theme.textSecondary) : theme.textMuted }}>
                    {played ? homeScore : "–"}
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>-</span>
                <span className="text-sm font-black w-7 text-left"
                    style={{ color: played ? (!homeWon ? "#A90000" : theme.textSecondary) : theme.textMuted }}>
                    {played ? awayScore : "–"}
                </span>
            </div>

            {/* Away team */}
            <div className="flex items-center gap-1 flex-1 min-w-0">
                <span className="text-xs px-1 rounded shrink-0"
                    style={{ backgroundColor: theme.borderStrong, color: theme.textMuted, fontSize: "9px" }}>
                    V
                </span>
                <span className="text-xs font-bold uppercase truncate hidden sm:block"
                    style={{ color: !homeWon && played ? theme.textPrimary : theme.textMuted }}>
                    {awayShort}
                </span>
            </div>
        </div>
    );
}

export default function PlayoffSeriesCard({ series, dates }) {
    const { theme } = useTheme();
    const {
        teamA, seedA, teamB, seedB,
        g1, g2, g3,
        winsA, winsB,
        seriesWinner,
        needsG3,
        seriesOver,
        labelA, labelB,
    } = series;

    // dates = { g1: "7 jun", g2: "14 jun", g3: "17 jun" }
    const d = dates ?? {};

    const isPending = !teamA || !teamB;
    const g1HomeWon = g1 ? Number(g1.homeScore) > Number(g1.awayScore) : false;
    const g2HomeWon = g2 ? Number(g2.homeScore) > Number(g2.awayScore) : false;
    const g3HomeWon = g3 ? Number(g3.homeScore) > Number(g3.awayScore) : false;
    const showG3 = needsG3 || g3 !== null || (winsA === 1 && winsB === 1);

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-4 transition-all duration-300"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${seriesOver ? "#A9000033" : isPending ? theme.border : theme.borderStrong}`,
                boxShadow: theme.shadowCard,
            }}
        >
            {seriesWinner && (
                <div className="text-xs font-bold uppercase tracking-widest text-center py-1 rounded-lg"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}>
                    🏆 Serie terminada
                </div>
            )}
            {isPending && (
                <div className="text-xs font-semibold uppercase tracking-widest text-center py-1 rounded-lg"
                    style={{ backgroundColor: theme.border, color: theme.textMuted }}>
                    Pendiente de cuartos
                </div>
            )}

            <div className="flex items-center gap-2">
                <TeamHeader team={teamA} seed={seedA} wins={winsA} isWinner={seriesWinner === teamA} label={labelA} isPending={isPending} />
                <div className="flex flex-col items-center gap-1 shrink-0">
                    <span className="text-xs font-black uppercase tracking-widest" style={{ color: theme.textMuted }}>Serie</span>
                    <span className="text-xs font-bold" style={{ color: theme.textMuted }}>Mejor de 3</span>
                </div>
                <TeamHeader team={teamB} seed={seedB} wins={winsB} isWinner={seriesWinner === teamB} label={labelB} isPending={isPending} />
            </div>

            <div className="flex flex-col gap-2">
                {/* IDA: teamA local */}
                <GameRow
                    label="IDA" date={d.g1}
                    homeTeam={teamA} homeLabel={labelA}
                    awayTeam={teamB} awayLabel={labelB}
                    homeScore={g1 ? Number(g1.homeScore) : null}
                    awayScore={g1 ? Number(g1.awayScore) : null}
                    homeWon={g1HomeWon} played={!!g1} isPending={isPending}
                />
                {/* VUELTA: teamB local */}
                <GameRow
                    label="VUELTA" date={d.g2}
                    homeTeam={teamB} homeLabel={labelB}
                    awayTeam={teamA} awayLabel={labelA}
                    homeScore={g2 ? Number(g2.homeScore) : null}
                    awayScore={g2 ? Number(g2.awayScore) : null}
                    homeWon={g2HomeWon} played={!!g2} isPending={isPending}
                />
                {/* TERCERO: solo si fue/será necesario */}
                {showG3 && (
                    <GameRow
                        label="TERCERO" date={d.g3}
                        homeTeam={teamA} homeLabel={labelA}
                        awayTeam={teamB} awayLabel={labelB}
                        homeScore={g3 ? Number(g3.homeScore) : null}
                        awayScore={g3 ? Number(g3.awayScore) : null}
                        homeWon={g3HomeWon} played={!!g3} isPending={isPending}
                    />
                )}
            </div>
        </div>
    );
}