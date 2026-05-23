// src/pages/Playoffs.jsx
import Layout from "../components/ui/Layout";
import { usePlayoffs } from "../hooks/usePlayoffs";
import { useTheme } from "../context/ThemeContext";
import PlayoffQFCard from "../components/playoffs/PlayoffQFCard";
import PlayoffSeriesCard from "../components/playoffs/PlayoffSeriesCard";
import { teamLogos } from "../data/teamLogos";

function SectionHeader({ title, subtitle, theme }) {
    return (
        <div className="flex items-end justify-between gap-2 mb-4">
            <div>
                <h2
                    className="text-xl font-black uppercase tracking-wider leading-tight"
                    style={{ color: theme.textPrimary }}
                >
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
            <span
                className="text-sm font-black w-5 text-center shrink-0"
                style={{ color: isTop4 ? "#A90000" : theme.textMuted }}
            >
                {position}
            </span>
            {logo && <img src={logo} alt={team} className="w-6 h-6 object-contain shrink-0" />}
            <span
                className="text-xs font-bold uppercase tracking-wide truncate"
                style={{ color: theme.textPrimary }}
            >
                {team ?? "Por definir"}
            </span>
            {isTop4 && (
                <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full shrink-0"
                    style={{ backgroundColor: "#A9000022", color: "#A90000" }}
                >
                    Localia
                </span>
            )}
        </div>
    );
}

export default function Playoffs() {
    const { bracket, top8, loading } = usePlayoffs();
    const { theme } = useTheme();

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center py-32">
                    <div
                        className="w-10 h-10 rounded-full border-4 animate-spin"
                        style={{ borderColor: "#A90000", borderTopColor: "transparent" }}
                    />
                </div>
            </Layout>
        );
    }

    const { quarterFinals, semiFinals, final } = bracket;

    return (
        <Layout>
            <div className="flex flex-col gap-8">

                {/* Hero */}
                <div
                    className="rounded-2xl p-5 sm:p-7 flex flex-col gap-2"
                    style={{
                        background: theme.bgHero,
                        boxShadow: theme.shadow,
                        border: `1px solid ${theme.border}`,
                    }}
                >
                    <p
                        className="text-xs uppercase tracking-widest font-semibold"
                        style={{ color: theme.textHeroSub }}
                    >
                        Torneo Promocional 2026
                    </p>
                    <h1
                        className="text-3xl sm:text-4xl font-black uppercase leading-tight"
                        style={{ color: theme.textHeroTitle }}
                    >
                        Playoffs
                    </h1>
                    <p className="text-sm" style={{ color: theme.textHeroDesc }}>
                        Clasifican los 8 mejores de la fase regular · Cuartos (1 partido) · Semis y Final (mejor de 3)
                    </p>
                </div>

                {/* Clasificados */}
                <div>
                    <SectionHeader
                        title="Clasificados"
                        subtitle="Mejores 8 de la fase regular"
                        theme={theme}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {top8.map((entry, i) => (
                            <SeededRow key={entry.team} position={i + 1} team={entry.team} theme={theme} />
                        ))}
                        {top8.length < 8 &&
                            Array.from({ length: 8 - top8.length }).map((_, i) => (
                                <SeededRow
                                    key={`empty-${i}`}
                                    position={top8.length + i + 1}
                                    team={null}
                                    theme={theme}
                                />
                            ))}
                    </div>
                </div>

                {/* Cuartos de Final */}
                <div>
                    <SectionHeader
                        title="Cuartos de Final"
                        subtitle="Un partido · Localia: mejor ubicado"
                        theme={theme}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quarterFinals.map((qf) => (
                            <PlayoffQFCard key={qf.id} qf={qf} />
                        ))}
                    </div>
                </div>

                {/* Semifinales — siempre visibles, con placeholder si aún no se definieron */}
                <div>
                    <SectionHeader
                        title="Semifinales"
                        subtitle="Mejor de 3 · Localia: mejor ubicado"
                        theme={theme}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {semiFinals.map((sf) => (
                            <PlayoffSeriesCard key={sf.id} series={sf} />
                        ))}
                    </div>
                </div>

                {/* Gran Final — siempre visible, con placeholder si aún no se definió */}
                <div>
                    <SectionHeader
                        title="Gran Final"
                        subtitle="Mejor de 3 · Localia: mejor ubicado"
                        theme={theme}
                    />
                    <PlayoffSeriesCard series={final} />
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
                            <img
                                src={teamLogos[final.seriesWinner]}
                                alt={final.seriesWinner}
                                className="w-20 h-20 object-contain"
                            />
                        )}
                        <h2 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-wide">
                            {final.seriesWinner}
                        </h2>
                    </div>
                )}

            </div>
        </Layout>
    );
}