import { useState, useMemo } from "react";
import Layout from "../components/ui/Layout";
import RoundCard from "../components/fixture/RoundCard";
import MatchCard from "../components/fixture/MatchCard";
import TeamFilter from "../components/fixture/TeamFilter";
import TeamLogo from "../components/ui/TeamLogo";
import { SectionTitle, StatTile, Spinner, Chip } from "../components/ui/Primitives";
import { useFixture } from "../hooks/useFixture";
import { TEAMS, formatDateLong } from "../data/fixture";

export default function Fixture() {
    const { fixtureWithResults, loading } = useFixture();
    const [openRound, setOpenRound] = useState(null);
    const [team, setTeam] = useState(null);

    const teams = useMemo(() => [...TEAMS].sort((a, b) => a.localeCompare(b, "es")), []);

    const totals = useMemo(() => {
        const total = fixtureWithResults.reduce((a, r) => a + r.matches.length, 0);
        const played = fixtureWithResults.reduce(
            (a, r) => a + r.matches.filter((m) => m.result !== null).length,
            0
        );
        return { total, played, pending: total - played };
    }, [fixtureWithResults]);

    const teamRounds = useMemo(() => {
        if (!team) return [];
        return fixtureWithResults
            .map((r) => ({
                ...r,
                matches: r.matches.filter((m) => m.home === team || m.away === team),
            }))
            .filter((r) => r.matches.length > 0);
    }, [fixtureWithResults, team]);

    const teamStats = useMemo(() => {
        if (!team) return null;
        let played = 0;
        let won = 0;
        teamRounds.forEach((r) =>
            r.matches.forEach((m) => {
                if (!m.result) return;
                played++;
                const isHome = m.home === team;
                const homeWon = Number(m.result.homeScore) > Number(m.result.awayScore);
                if (isHome === homeWon) won++;
            })
        );
        return { played, won, lost: played - won, pending: teamRounds.length - played };
    }, [teamRounds, team]);

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <SectionTitle
                    eyebrow="Del 2 de agosto al 11 de octubre"
                    title="Fixture"
                    right={
                        team ? (
                            <span className="flex items-center gap-2">
                                <TeamLogo team={team} size={30} />
                                <button onClick={() => setTeam(null)} className="nm-btn px-3 py-1.5 text-xs">
                                    Quitar filtro
                                </button>
                            </span>
                        ) : null
                    }
                />

                {!loading && !team && (
                    <div className="grid grid-cols-3 gap-3">
                        <StatTile label="Jugados" value={totals.played} tone="ok" delay={0} />
                        <StatTile label="Pendientes" value={totals.pending} tone="muted" delay={60} />
                        <StatTile label="Total" value={totals.total} tone="accent" delay={120} />
                    </div>
                )}

                {!loading && team && teamStats && (
                    <div className="grid grid-cols-4 gap-3">
                        <StatTile label="Jugados" value={teamStats.played} delay={0} />
                        <StatTile label="Ganados" value={teamStats.won} tone="ok" delay={60} />
                        <StatTile label="Perdidos" value={teamStats.lost} tone="accent" delay={120} />
                        <StatTile label="Pendientes" value={teamStats.pending} tone="muted" delay={180} />
                    </div>
                )}

                {!loading && <TeamFilter teams={teams} selectedTeam={team} onSelect={setTeam} />}

                {loading ? (
                    <Spinner />
                ) : team ? (
                    <div className="flex flex-col gap-6">
                        {teamRounds.map((round, i) => (
                            <div key={round.round} className="flex flex-col gap-3">
                                <div className="flex items-center gap-3">
                                    <span className="h-px flex-1" style={{ background: "var(--line)" }} />
                                    <Chip>
                                        {round.label} · {formatDateLong(round.date)}
                                    </Chip>
                                    <span className="h-px flex-1" style={{ background: "var(--line)" }} />
                                </div>
                                {round.matches.map((match) => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        highlightTeam={team}
                                        delay={i * 40}
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {fixtureWithResults.map((round, i) => (
                            <RoundCard
                                key={round.round}
                                round={round}
                                isSelected={openRound === round.round}
                                onClick={() =>
                                    setOpenRound(openRound === round.round ? null : round.round)
                                }
                                delay={i * 35}
                            />
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
