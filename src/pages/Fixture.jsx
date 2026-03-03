import { useState, useMemo } from "react";
import Layout from "../components/ui/Layout";
import RoundCard from "../components/fixture/RoundCard";
import MatchCard from "../components/fixture/MatchCard";
import TeamFilter from "../components/fixture/TeamFilter";
import { getRoundDate } from "../components/fixture/RoundCard";
import { useFixture } from "../hooks/useFixture";
import { useTheme } from "../context/ThemeContext";

export default function Fixture() {
    const { fixtureWithResults, loading } = useFixture();
    const { theme } = useTheme();
    const [selectedRound, setSelectedRound] = useState(1);
    const [selectedTeam, setSelectedTeam] = useState(null);

    const handleRoundClick = (round) => {
        setSelectedRound(selectedRound === round ? null : round);
    };

    // Extract sorted unique team names from fixture
    const allTeams = useMemo(() => {
        const teams = new Set();
        fixtureWithResults.forEach((r) =>
            r.matches.forEach((m) => {
                teams.add(m.home);
                teams.add(m.away);
            })
        );
        return Array.from(teams).sort();
    }, [fixtureWithResults]);

    // Stats always over the full fixture
    const totalMatches = fixtureWithResults.reduce((acc, r) => acc + r.matches.length, 0);
    const playedMatches = fixtureWithResults.reduce(
        (acc, r) => acc + r.matches.filter((m) => m.result !== null).length,
        0
    );
    const pendingMatches = totalMatches - playedMatches;

    // Rounds filtered by selected team (for the filtered view)
    const filteredRounds = useMemo(() => {
        if (!selectedTeam) return fixtureWithResults;
        return fixtureWithResults
            .map((r) => ({
                ...r,
                matches: r.matches.filter(
                    (m) => m.home === selectedTeam || m.away === selectedTeam
                ),
            }))
            .filter((r) => r.matches.length > 0);
    }, [fixtureWithResults, selectedTeam]);

    // Stats for filtered team
    const teamStats = useMemo(() => {
        if (!selectedTeam) return null;
        const played = filteredRounds.reduce(
            (acc, r) => acc + r.matches.filter((m) => m.result !== null).length,
            0
        );
        const wins = filteredRounds.reduce(
            (acc, r) =>
                acc +
                r.matches.filter((m) => {
                    if (!m.result) return false;
                    const isHome = m.home === selectedTeam;
                    return isHome
                        ? m.result.homeScore > m.result.awayScore
                        : m.result.awayScore > m.result.homeScore;
                }).length,
            0
        );
        return { played, wins, pending: filteredRounds.length - played };
    }, [filteredRounds, selectedTeam]);

    return (
        <Layout>
            <div className="flex flex-col gap-6">

                {/* Title */}
                <div>
                    <h1 className="text-3xl font-black uppercase tracking-wide" style={{ color: theme.textPrimary }}>
                        Fixture
                    </h1>
                    <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                        Fase Clasificatoria — Torneo Promocional 2026
                    </p>
                </div>

                {/* Global stats (only when no team selected) */}
                {!loading && !selectedTeam && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Jugados", value: playedMatches, color: theme.textGreen },
                            { label: "Pendientes", value: pendingMatches, color: theme.textSecondary },
                            { label: "Total", value: totalMatches, color: "#A90000" },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl p-4 flex flex-col items-center gap-1"
                                style={{
                                    backgroundColor: theme.bgCard,
                                    border: `1px solid ${theme.border}`,
                                    boxShadow: theme.shadowCard,
                                }}
                            >
                                <span className="text-2xl font-black" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                <span className="text-xs uppercase tracking-wider text-center" style={{ color: theme.textMuted }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Team stats (only when a team is selected) */}
                {!loading && selectedTeam && teamStats && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Jugados", value: teamStats.played, color: theme.textGreen },
                            { label: "Ganados", value: teamStats.wins, color: "#A90000" },
                            { label: "Pendientes", value: teamStats.pending, color: theme.textSecondary },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-2xl p-4 flex flex-col items-center gap-1"
                                style={{
                                    backgroundColor: theme.bgCard,
                                    border: `1px solid ${theme.border}`,
                                    boxShadow: theme.shadowCard,
                                }}
                            >
                                <span className="text-2xl font-black" style={{ color: stat.color }}>
                                    {stat.value}
                                </span>
                                <span className="text-xs uppercase tracking-wider text-center" style={{ color: theme.textMuted }}>
                                    {stat.label}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Team filter */}
                {!loading && (
                    <TeamFilter
                        teams={allTeams}
                        selectedTeam={selectedTeam}
                        onSelect={setSelectedTeam}
                    />
                )}

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-10 h-10 rounded-full border-4 animate-spin"
                            style={{ borderColor: "#A90000", borderTopColor: "transparent" }}
                        />
                    </div>
                ) : selectedTeam ? (
                    /* ── Filtered view: flat list grouped by round ── */
                    <div className="flex flex-col gap-6">
                        {filteredRounds.map((round) => {
                            const roundDate = getRoundDate(round.round);
                            return (
                                <div key={round.round} className="flex flex-col gap-3">
                                    {/* Round header */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-px flex-1"
                                            style={{ backgroundColor: theme.border }}
                                        />
                                        <div className="flex flex-col items-center">
                                            <span
                                                className="text-xs font-black uppercase tracking-widest"
                                                style={{ color: theme.textPrimary }}
                                            >
                                                {round.label}
                                            </span>
                                            <span
                                                className="text-xs"
                                                style={{ color: theme.textMuted }}
                                            >
                                                {roundDate}
                                            </span>
                                        </div>
                                        <div
                                            className="h-px flex-1"
                                            style={{ backgroundColor: theme.border }}
                                        />
                                    </div>

                                    {/* Match cards */}
                                    <div className="flex flex-col gap-3">
                                        {round.matches.map((match) => (
                                            <MatchCard key={match.id} match={match} highlightTeam={selectedTeam} />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    /* ── Default view: accordion by round ── */
                    <div className="flex flex-col gap-3">
                        {fixtureWithResults.map((round) => (
                            <RoundCard
                                key={round.round}
                                round={round}
                                isSelected={selectedRound === round.round}
                                onClick={() => handleRoundClick(round.round)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}