// src/pages/Playoffs.jsx
import Layout from "../components/ui/Layout";
import { usePlayoffs } from "../hooks/usePlayoffs";
import { useTheme } from "../context/ThemeContext";
import PlayoffQFCard from "../components/playoffs/PlayoffQFCard";
import PlayoffSeriesCard from "../components/playoffs/PlayoffSeriesCard";
import { teamLogos, teamShortNames } from "../data/teamLogos";

// ─── Fechas del torneo ────────────────────────────────────────────────────────
const DATES = {
    qf:          "31 de mayo",
    sfIda:       "7 de junio",
    sfVuelta:    "14 de junio",
    sfTercero:   "17 de junio",
    finalIda:    "21 de junio",
    finalVuelta: "28 de junio",
    finalTercero:"1 de julio",
    sf58:        "7 de junio",
    pos:         "21 de junio",
    repoR1:      "31 de mayo",
    repoR2:      "7 de junio",
    repoR3:      "14 de junio",
};

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle, theme }) {
    return (
        <div className="flex items-end justify-between gap-2 mb-4">
            <div>
                <h2 className="text-xl font-black uppercase tracking-wider leading-tight"
                    style={{ color: theme.textPrimary }}>
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-xs uppercase tracking-widest mt-0.5" style={{ color: theme.textMuted }}>
                        {subtitle}
                    </p>
                )}
            </div>
            <div className="h-px flex-1 mb-1.5" style={{ backgroundColor: theme.border }} />
        </div>
    );
}

function SeededRow({ position, team, theme }) {
    const logo = team ? teamLogos[team] : null;
    const isTop4 = position <= 4;
    return (
        <div
            className="flex items-center gap-3 px-3 py-2 rounded-xl"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${isTop4 ? "#A9000033" : theme.border}`,
            }}
        >
            <span className="text-sm font-black w-5 text-center shrink-0"
                style={{ color: isTop4 ? "#A90000" : theme.textMuted }}>
                {position}
            </span>
            {logo && <img src={logo} alt={team} className="w-6 h-6 object-contain shrink-0" />}
            <span className="text-xs font-bold uppercase tracking-wide truncate"
                style={{ color: theme.textPrimary }}>
                {team ?? "Por definir"}
            </span>
            {isTop4 && (
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}>
                    Localía
                </span>
            )}
        </div>
    );
}

/** Tarjeta para un partido único (sin serie) con fecha y labels opcionales */
function SingleMatchCard({ home, homeSeed, away, awaySeed, result, date, homeLabel, awayLabel, theme }) {
    const homeShort = home ? (teamShortNames[home] ?? home) : null;
    const awayShort = away ? (teamShortNames[away] ?? away) : null;
    const homeLogo  = home ? teamLogos[home] : null;
    const awayLogo  = away ? teamLogos[away] : null;
    const played    = !!result;
    const homeScore = played ? Number(result.homeScore) : null;
    const awayScore = played ? Number(result.awayScore) : null;
    const homeWon   = played && homeScore > awayScore;
    const awayWon   = played && awayScore > homeScore;
    const isPending = !home || !away;

    return (
        <div
            className="rounded-2xl p-4 flex flex-col gap-3"
            style={{
                backgroundColor: theme.bgCard,
                border: `1px solid ${played ? "#A9000033" : isPending ? theme.border : theme.borderStrong}`,
                boxShadow: theme.shadowCard,
            }}
        >
            {/* Fecha */}
            {date && (
                <div className="flex justify-end">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: theme.border, color: theme.textMuted }}>
                        📅 {date}
                    </span>
                </div>
            )}

            {isPending && (
                <div className="text-xs font-semibold uppercase tracking-widest text-center py-1 rounded-lg"
                    style={{ backgroundColor: theme.border, color: theme.textMuted }}>
                    Pendiente
                </div>
            )}
            {played && (
                <div className="text-xs font-bold uppercase tracking-widest text-center py-1 rounded-lg"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}>
                    ✓ Jugado
                </div>
            )}

            <div className="flex items-center gap-3">
                {/* Local */}
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    {homeLogo ? (
                        <img src={homeLogo} alt={home} className="w-10 h-10 object-contain" />
                    ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.border }}>
                            <span style={{ color: theme.textMuted, fontSize: 18 }}>?</span>
                        </div>
                    )}
                    {homeSeed && (
                        <span className="text-xs font-black px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: homeWon ? "#A90000" : "#A9000022", color: homeWon ? "#fff" : "#A90000" }}>
                            {homeSeed}°
                        </span>
                    )}
                    <span className="text-xs font-black uppercase tracking-wide text-center leading-tight truncate w-full px-1"
                        style={{ color: homeWon ? theme.textPrimary : isPending ? theme.textMuted : theme.textSecondary }}>
                        {homeShort ?? homeLabel ?? "Por definir"}
                    </span>
                </div>

                {/* Marcador */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                    {played ? (
                        <div className="flex items-center gap-2">
                            <span className="text-3xl font-black" style={{ color: homeWon ? "#A90000" : theme.textPrimary }}>
                                {homeScore}
                            </span>
                            <span className="text-sm" style={{ color: theme.textMuted }}>–</span>
                            <span className="text-3xl font-black" style={{ color: awayWon ? "#A90000" : theme.textPrimary }}>
                                {awayScore}
                            </span>
                        </div>
                    ) : (
                        <span className="text-sm font-black uppercase tracking-widest"
                            style={{ color: theme.textMuted }}>
                            VS
                        </span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: "#00005522", color: theme.textMuted, fontSize: "9px" }}>
                        L · V
                    </span>
                </div>

                {/* Visitante */}
                <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
                    {awayLogo ? (
                        <img src={awayLogo} alt={away} className="w-10 h-10 object-contain" />
                    ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: theme.border }}>
                            <span style={{ color: theme.textMuted, fontSize: 18 }}>?</span>
                        </div>
                    )}
                    {awaySeed && (
                        <span className="text-xs font-black px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: awayWon ? "#A90000" : "#A9000022", color: awayWon ? "#fff" : "#A90000" }}>
                            {awaySeed}°
                        </span>
                    )}
                    <span className="text-xs font-black uppercase tracking-wide text-center leading-tight truncate w-full px-1"
                        style={{ color: awayWon ? theme.textPrimary : isPending ? theme.textMuted : theme.textSecondary }}>
                        {awayShort ?? awayLabel ?? "Por definir"}
                    </span>
                </div>
            </div>
        </div>
    );
}

/** Tabla de posiciones del reposicionamiento */
function RepoStandingsTable({ standings, theme }) {
    if (!standings || standings.length === 0 || standings.every((s) => s.pj === 0)) return null;
    return (
        <div className="rounded-2xl overflow-hidden"
            style={{ border: `1px solid ${theme.border}`, boxShadow: theme.shadowCard }}>
            <div className="px-4 py-2 text-xs font-black uppercase tracking-widest"
                style={{ backgroundColor: theme.bgTableHead, color: "#ffffff88" }}>
                Posiciones 9° – 12°
            </div>
            <table className="w-full" style={{ backgroundColor: theme.bgCard }}>
                <thead>
                    <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
                        {["#", "Equipo", "PJ", "G", "P", "Dif"].map((h) => (
                            <th key={h} className="text-xs font-black uppercase tracking-wider py-2 px-3 text-center"
                                style={{ color: theme.textMuted }}>
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {standings.map((row, i) => {
                        const logo = row.team ? teamLogos[row.team] : null;
                        const shortName = row.team ? (teamShortNames[row.team] ?? row.team) : "–";
                        const dif = row.gf - row.gc;
                        return (
                            <tr key={row.team}
                                style={{ borderBottom: i < standings.length - 1 ? `1px solid ${theme.border}` : "none" }}>
                                <td className="py-2 px-3 text-center">
                                    <span className="text-sm font-black" style={{ color: theme.textMuted }}>{i + 9}</span>
                                </td>
                                <td className="py-2 px-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                        {logo && <img src={logo} alt={row.team} className="w-5 h-5 object-contain shrink-0" />}
                                        <span className="text-xs font-bold uppercase truncate"
                                            style={{ color: theme.textPrimary }}>{shortName}</span>
                                    </div>
                                </td>
                                <td className="py-2 px-3 text-center text-xs font-bold" style={{ color: theme.textSecondary }}>{row.pj}</td>
                                <td className="py-2 px-3 text-center text-xs font-bold" style={{ color: theme.textSecondary }}>{row.w}</td>
                                <td className="py-2 px-3 text-center text-xs font-bold" style={{ color: theme.textSecondary }}>{row.l}</td>
                                <td className="py-2 px-3 text-center text-xs font-bold"
                                    style={{ color: dif > 0 ? "#22c55e" : dif < 0 ? "#ef4444" : theme.textSecondary }}>
                                    {dif > 0 ? `+${dif}` : dif}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Playoffs() {
    const { bracket, top8, loading } = usePlayoffs();
    const { theme } = useTheme();

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-32">
                    <div className="w-10 h-10 rounded-full border-4 animate-spin"
                        style={{ borderColor: "#A90000", borderTopColor: "transparent" }} />
                </div>
            </Layout>
        );
    }

    const { quarterFinals, semiFinals, final, sf58a, sf58b, p34, p56, p78, repoMatches, repoStandings } = bracket;
    const repoByRound = [1, 2, 3].map((r) => repoMatches.filter((m) => m.round === r));
    const repoDates   = { 1: DATES.repoR1, 2: DATES.repoR2, 3: DATES.repoR3 };

    return (
        <Layout>
            <div className="flex flex-col gap-8">

                {/* ── Hero ── */}
                <div
                    className="rounded-2xl p-5 sm:p-7 flex flex-col gap-2"
                    style={{ background: theme.bgHero, boxShadow: theme.shadow, border: `1px solid ${theme.border}` }}
                >
                    <p className="text-xs uppercase tracking-widest font-semibold" style={{ color: theme.textHeroSub }}>
                        Torneo Promocional 2026
                    </p>
                    <h1 className="text-3xl sm:text-4xl font-black uppercase leading-tight"
                        style={{ color: theme.textHeroTitle }}>
                        Playoffs
                    </h1>
                    <p className="text-sm" style={{ color: theme.textHeroDesc }}>
                        Cuartos (1 partido) · Semis y Final (IDA / VUELTA / TERCERO) · Posiciones 3° al 12°
                    </p>
                </div>

                {/* ── 1. Clasificados ── */}
                <div>
                    <SectionHeader title="Clasificados" subtitle="Mejores 8 de la fase regular" theme={theme} />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {top8.map((entry, i) => (
                            <SeededRow key={entry.team} position={i + 1} team={entry.team} theme={theme} />
                        ))}
                        {top8.length < 8 &&
                            Array.from({ length: 8 - top8.length }).map((_, i) => (
                                <SeededRow key={`empty-${i}`} position={top8.length + i + 1} team={null} theme={theme} />
                            ))}
                    </div>
                </div>

                {/* ── 2. Cuartos de Final ── */}
                <div>
                    <SectionHeader
                        title="Cuartos de Final"
                        subtitle={`Un partido · ${DATES.qf} · Localía: mejor ubicado`}
                        theme={theme}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quarterFinals.map((qf) => (
                            <PlayoffQFCard key={qf.id} qf={qf} date={DATES.qf} />
                        ))}
                    </div>
                </div>

                {/* ── 3. Semifinales 1°–4° ── */}
                <div>
                    <SectionHeader
                        title="Semifinales 1° – 4°"
                        subtitle={`IDA: ${DATES.sfIda} · VUELTA: ${DATES.sfVuelta} · TERCERO: ${DATES.sfTercero}`}
                        theme={theme}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {semiFinals.map((sf) => (
                            <PlayoffSeriesCard
                                key={sf.id}
                                series={sf}
                                dates={{ g1: DATES.sfIda, g2: DATES.sfVuelta, g3: DATES.sfTercero }}
                            />
                        ))}
                    </div>
                </div>

                {/* ── 4. Gran Final ── */}
                <div>
                    <SectionHeader
                        title="Gran Final"
                        subtitle={`IDA: ${DATES.finalIda} · VUELTA: ${DATES.finalVuelta} · TERCERO: ${DATES.finalTercero}`}
                        theme={theme}
                    />
                    <PlayoffSeriesCard
                        series={final}
                        dates={{ g1: DATES.finalIda, g2: DATES.finalVuelta, g3: DATES.finalTercero }}
                    />
                </div>

                {/* Campeón */}
                {final.seriesWinner && (
                    <div
                        className="rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-3 text-center"
                        style={{
                            background: "linear-gradient(135deg, #A90000 0%, #6b0000 100%)",
                            boxShadow: "0 8px 32px rgba(169,0,0,0.4)",
                        }}
                    >
                        <span className="text-5xl">🏆</span>
                        <p className="text-white text-xs uppercase tracking-widest font-semibold opacity-75">
                            Campeón Torneo Promocional 2026
                        </p>
                        {teamLogos[final.seriesWinner] && (
                            <img src={teamLogos[final.seriesWinner]} alt={final.seriesWinner} className="w-20 h-20 object-contain" />
                        )}
                        <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-wide">
                            {final.seriesWinner}
                        </h2>
                    </div>
                )}

                {/* ── 5. Semifinales 5°–8° ── */}
                <div>
                    <SectionHeader
                        title="Semifinales 5° – 8°"
                        subtitle={`Un partido · ${DATES.sf58} · Perdedores de cuartos`}
                        theme={theme}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SingleMatchCard
                            home={sf58a.home} homeSeed={sf58a.homeSeed}
                            away={sf58a.away} awaySeed={sf58a.awaySeed}
                            result={sf58a.result} date={DATES.sf58} theme={theme}
                            homeLabel="Per. 4° vs 5°" awayLabel="Per. 1° vs 8°"
                        />
                        <SingleMatchCard
                            home={sf58b.home} homeSeed={sf58b.homeSeed}
                            away={sf58b.away} awaySeed={sf58b.awaySeed}
                            result={sf58b.result} date={DATES.sf58} theme={theme}
                            homeLabel="Per. 3° vs 6°" awayLabel="Per. 2° vs 7°"
                        />
                    </div>
                </div>

                {/* ── 6. Posiciones 3°–8° ── */}
                <div>
                    <SectionHeader
                        title="Posiciones 3° – 8°"
                        subtitle={`Partidos únicos · ${DATES.pos}`}
                        theme={theme}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* 3° y 4° */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-black uppercase tracking-widest text-center"
                                style={{ color: theme.textMuted }}>
                                3° y 4°
                            </p>
                            <SingleMatchCard
                                home={p34.home} away={p34.away}
                                result={p34.result} date={DATES.pos} theme={theme}
                                homeLabel="Per. Semifinal 1" awayLabel="Per. Semifinal 2"
                            />
                        </div>
                        {/* 5° y 6° */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-black uppercase tracking-widest text-center"
                                style={{ color: theme.textMuted }}>
                                5° y 6°
                            </p>
                            <SingleMatchCard
                                home={p56.home} away={p56.away}
                                result={p56.result} date={DATES.pos} theme={theme}
                                homeLabel="Gan. Semi 5°-8° A" awayLabel="Gan. Semi 5°-8° B"
                            />
                        </div>
                        {/* 7° y 8° */}
                        <div className="flex flex-col gap-2">
                            <p className="text-xs font-black uppercase tracking-widest text-center"
                                style={{ color: theme.textMuted }}>
                                7° y 8°
                            </p>
                            <SingleMatchCard
                                home={p78.home} away={p78.away}
                                result={p78.result} date={DATES.pos} theme={theme}
                                homeLabel="Per. Semi 5°-8° A" awayLabel="Per. Semi 5°-8° B"
                            />
                        </div>
                    </div>
                </div>

                {/* ── 7. Reposicionamiento 9°–12° ── */}
                <div>
                    <SectionHeader title="Reposicionamiento 9° – 12°" subtitle="Round-robin · 3 jornadas" theme={theme} />
                    <div className="flex flex-col gap-6">
                        {repoByRound.map((matches, idx) => {
                            const round = idx + 1;
                            return (
                                <div key={round} className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black uppercase tracking-widest"
                                            style={{ color: theme.textMuted }}>
                                            Jornada {round}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full"
                                            style={{ backgroundColor: "#A9000022", color: "#A90000" }}>
                                            📅 {repoDates[round]}
                                        </span>
                                        <div className="flex-1 h-px" style={{ backgroundColor: theme.border }} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {matches.map((m) => (
                                            <SingleMatchCard
                                                key={m.id}
                                                home={m.home} homeSeed={m.homeSeed}
                                                away={m.away} awaySeed={m.awaySeed}
                                                result={m.result} theme={theme}
                                            />
                                        ))}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Tabla de standings del reposicionamiento */}
                        <RepoStandingsTable standings={repoStandings} theme={theme} />
                    </div>
                </div>

            </div>
        </Layout>
    );
}