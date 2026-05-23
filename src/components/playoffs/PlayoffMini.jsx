import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { teamLogos, teamShortNames } from "../../data/teamLogos";

/**
 * Componente compacto para mostrar el estado de los playoffs en Home.
 * Muestra los QFs en curso o el estado actual de la fase más avanzada.
 */

function MiniMatchRow({ seedHome, teamHome, scoreHome, scoreAway, teamAway, seedAway, winner, theme }) {
    const logoHome = teamHome ? teamLogos[teamHome] : null;
    const logoAway = teamAway ? teamLogos[teamAway] : null;
    const shortHome = teamHome ? (teamShortNames[teamHome] ?? teamHome) : null;
    const shortAway = teamAway ? (teamShortNames[teamAway] ?? teamAway) : null;
    const homeWon = winner === teamHome;
    const awayWon = winner === teamAway;

    return (
        <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
                backgroundColor: winner ? "#A9000010" : "transparent",
                border: `1px solid ${winner ? "#A9000030" : "transparent"}`,
            }}
        >
            {/* Seed + Logo + Nombre local */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span
                    className="text-xs font-black w-4 text-center shrink-0"
                    style={{ color: homeWon ? "#A90000" : theme.textMuted }}
                >
                    {seedHome}
                </span>
                {logoHome && <img src={logoHome} alt={teamHome} className="w-5 h-5 object-contain shrink-0" />}
                <span
                    className="text-xs font-bold uppercase tracking-wide truncate"
                    style={{ color: homeWon ? theme.textPrimary : theme.textSecondary }}
                >
                    {shortHome ?? "–"}
                </span>
            </div>

            {/* Score */}
            <div className="flex items-center gap-1 shrink-0">
                <span
                    className="text-sm font-black w-6 text-center"
                    style={{ color: homeWon ? "#A90000" : (scoreHome !== null ? theme.textSecondary : theme.textMuted) }}
                >
                    {scoreHome !== null ? scoreHome : "–"}
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>-</span>
                <span
                    className="text-sm font-black w-6 text-center"
                    style={{ color: awayWon ? "#A90000" : (scoreAway !== null ? theme.textSecondary : theme.textMuted) }}
                >
                    {scoreAway !== null ? scoreAway : "–"}
                </span>
            </div>

            {/* Nombre + Logo + Seed visitante */}
            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span
                    className="text-xs font-bold uppercase tracking-wide truncate"
                    style={{ color: awayWon ? theme.textPrimary : theme.textSecondary }}
                >
                    {shortAway ?? "–"}
                </span>
                {logoAway && <img src={logoAway} alt={teamAway} className="w-5 h-5 object-contain shrink-0" />}
                <span
                    className="text-xs font-black w-4 text-center shrink-0"
                    style={{ color: awayWon ? "#A90000" : theme.textMuted }}
                >
                    {seedAway}
                </span>
            </div>
        </div>
    );
}

function MiniSeriesRow({ series, theme }) {
    const { teamA, seedA, teamB, seedB, winsA, winsB, seriesWinner, labelA, labelB } = series;
    const shortA = teamA ? (teamShortNames[teamA] ?? teamA) : labelA;
    const shortB = teamB ? (teamShortNames[teamB] ?? teamB) : labelB;
    const logoA = teamA ? teamLogos[teamA] : null;
    const logoB = teamB ? teamLogos[teamB] : null;

    return (
        <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
                backgroundColor: seriesWinner ? "#A9000010" : "transparent",
                border: `1px solid ${seriesWinner ? "#A9000030" : "transparent"}`,
            }}
        >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                {seedA && (
                    <span className="text-xs font-black w-4 text-center shrink-0" style={{ color: seriesWinner === teamA ? "#A90000" : theme.textMuted }}>
                        {seedA}
                    </span>
                )}
                {logoA && <img src={logoA} alt={teamA} className="w-5 h-5 object-contain shrink-0" />}
                <span
                    className="text-xs font-bold uppercase tracking-wide truncate"
                    style={{ color: seriesWinner === teamA ? theme.textPrimary : theme.textSecondary }}
                >
                    {shortA}
                </span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
                <span className="text-base font-black w-5 text-center" style={{ color: seriesWinner === teamA ? "#A90000" : theme.textPrimary }}>
                    {winsA}
                </span>
                <span className="text-xs" style={{ color: theme.textMuted }}>-</span>
                <span className="text-base font-black w-5 text-center" style={{ color: seriesWinner === teamB ? "#A90000" : theme.textPrimary }}>
                    {winsB}
                </span>
            </div>

            <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                <span
                    className="text-xs font-bold uppercase tracking-wide truncate"
                    style={{ color: seriesWinner === teamB ? theme.textPrimary : theme.textSecondary }}
                >
                    {shortB}
                </span>
                {logoB && <img src={logoB} alt={teamB} className="w-5 h-5 object-contain shrink-0" />}
                {seedB && (
                    <span className="text-xs font-black w-4 text-center shrink-0" style={{ color: seriesWinner === teamB ? "#A90000" : theme.textMuted }}>
                        {seedB}
                    </span>
                )}
            </div>
        </div>
    );
}

export default function PlayoffMini({ bracket, loading }) {
    const { theme } = useTheme();
    if (loading || !bracket) return null;

    const { quarterFinals, semiFinals, final } = bracket;

    // Determinar qué fase mostrar (la más avanzada con actividad)
    const finalActive = final.g1 || final.g2 || final.g3;
    const sfActive = semiFinals.some((sf) => sf.g1 || sf.g2 || sf.g3);
    const qfActive = quarterFinals.some((qf) => qf.result);
    const anyActivity = qfActive || sfActive || finalActive;

    if (!anyActivity) {
        // Los playoffs no comenzaron aún
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                        Playoffs
                    </h2>
                    <Link to="/playoffs" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#A90000" }}>
                        Ver bracket →
                    </Link>
                </div>
                <div
                    className="rounded-2xl p-5 text-center"
                    style={{ backgroundColor: theme.bgCard, border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}
                >
                    <span className="text-3xl">🏆</span>
                    <p className="text-sm font-bold uppercase tracking-wide mt-2" style={{ color: theme.textPrimary }}>
                        Playoffs en camino
                    </p>
                    <p className="text-xs mt-1" style={{ color: theme.textMuted }}>
                        Clasifican los 8 mejores de la fase regular
                    </p>
                </div>
            </div>
        );
    }

    // Campeón ya definido
    if (final.seriesWinner) {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                        Playoffs
                    </h2>
                    <Link to="/playoffs" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#A90000" }}>
                        Ver bracket →
                    </Link>
                </div>
                <div
                    className="rounded-2xl p-5 flex flex-col items-center gap-2 text-center"
                    style={{
                        background: "linear-gradient(135deg, #A90000 0%, #6b0000 100%)",
                        boxShadow: "0 4px 20px rgba(169,0,0,0.35)",
                    }}
                >
                    <span className="text-4xl">🏆</span>
                    <p className="text-white text-xs uppercase tracking-widest opacity-75">Campeón</p>
                    {teamLogos[final.seriesWinner] && (
                        <img src={teamLogos[final.seriesWinner]} alt={final.seriesWinner} className="w-14 h-14 object-contain" />
                    )}
                    <p className="text-white text-2xl font-black uppercase tracking-wide">{final.seriesWinner}</p>
                </div>
            </div>
        );
    }

    // Fase activa
    const currentPhase = finalActive ? "Final" : sfActive ? "Semifinales" : "Cuartos de Final";

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-wider" style={{ color: theme.textPrimary }}>
                        Playoffs
                    </h2>
                    <p className="text-xs uppercase tracking-widest" style={{ color: theme.textMuted }}>
                        {currentPhase}
                    </p>
                </div>
                <Link to="/playoffs" className="text-xs font-bold uppercase tracking-wider" style={{ color: "#A90000" }}>
                    Ver bracket →
                </Link>
            </div>

            <div
                className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}
            >
                {/* Header */}
                <div
                    className="px-3 py-2 text-xs font-black uppercase tracking-widest"
                    style={{ backgroundColor: theme.bgTableHead, color: "#ffffff55" }}
                >
                    {currentPhase}
                </div>

                <div
                    className="flex flex-col divide-y px-2 py-2 gap-1"
                    style={{ backgroundColor: theme.bgCard }}
                >
                    {finalActive && (
                        <MiniSeriesRow series={final} theme={theme} />
                    )}

                    {sfActive && !finalActive && semiFinals.map((sf) => (
                        <MiniSeriesRow key={sf.id} series={sf} theme={theme} />
                    ))}

                    {qfActive && !sfActive && quarterFinals.map((qf) => (
                        <MiniMatchRow
                            key={qf.id}
                            seedHome={qf.homeSeed}
                            teamHome={qf.home}
                            scoreHome={qf.result ? Number(qf.result.homeScore) : null}
                            scoreAway={qf.result ? Number(qf.result.awayScore) : null}
                            teamAway={qf.away}
                            seedAway={qf.awaySeed}
                            winner={qf.winner}
                            theme={theme}
                        />
                    ))}
                </div>

                {/* Footer */}
                <div
                    className="px-3 py-2 text-center"
                    style={{ backgroundColor: theme.bgTableFoot, borderTop: "1px solid #ffffff10" }}
                >
                    <Link to="/playoffs" className="text-xs uppercase tracking-widest font-semibold" style={{ color: "#ffffff55" }}>
                        Ver bracket completo →
                    </Link>
                </div>
            </div>
        </div>
    );
}
