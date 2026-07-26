import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/ui/Layout";
import Basketball3D from "../components/ui/Basketball3D";
import TeamLogo from "../components/ui/TeamLogo";
import { StatTile, Spinner, Chip } from "../components/ui/Primitives";
import LastRoundResults from "../components/fixture/LastRoundResults";
import NextRound from "../components/fixture/NextRound";
import StandingsMini from "../components/standings/StandingsMini";
import PlayoffMini from "../components/playoffs/PlayoffMini";
import { useFixture } from "../hooks/useFixture";
import { useStandings } from "../hooks/useStandings";
import { usePlayoffs } from "../hooks/usePlayoffs";
import { requestNotificationPermission } from "../services/messaging";
import { formatDateLong } from "../data/fixture";
import { teamShortNames } from "../data/teamLogos";

/** Días que faltan para una fecha ISO (negativo si ya pasó). */
function daysUntil(iso) {
    if (!iso) return null;
    const [y, m, d] = iso.split("-").map(Number);
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target - today) / 86_400_000);
}

function CountdownPill({ date }) {
    const days = daysUntil(date);
    if (days === null) return null;

    const text =
        days > 1 ? `Faltan ${days} días` : days === 1 ? "Es mañana" : days === 0 ? "Se juega hoy" : formatDateLong(date);

    return (
        <span
            className="nm-in-sm cond inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.7rem] font-bold uppercase tracking-[0.14em]"
            style={{ color: days <= 1 && days >= 0 ? "var(--red)" : "var(--text-2)" }}
        >
            <span
                className={`h-2 w-2 rounded-full ${days <= 1 && days >= 0 ? "a-pulse" : ""}`}
                style={{ background: days <= 1 && days >= 0 ? "var(--red)" : "var(--text-3)" }}
            />
            {text}
        </span>
    );
}

/* ── Botón de alertas push ────────────────────────────────────────── */

/** idle | loading | granted | denied — se lee del navegador al montar. */
function initialNotificationStatus() {
    if (!("Notification" in window)) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    return "idle";
}

function NotificationButton() {
    const [status, setStatus] = useState(initialNotificationStatus);

    if (status === "unsupported") return null;

    if (status === "granted") {
        return <Chip tone="ok">🔔 Alertas activas</Chip>;
    }

    const handleClick = async () => {
        setStatus("loading");
        const token = await requestNotificationPermission();
        setStatus(token ? "granted" : "denied");
    };

    return (
        <button
            onClick={handleClick}
            disabled={status === "loading" || status === "denied"}
            className="nm-btn px-5 py-2.5 text-xs"
        >
            {status === "loading"
                ? "..."
                : status === "denied"
                    ? "🔕 Bloqueadas"
                    : "🔔 Activar alertas"}
        </button>
    );
}

/* ── Página ───────────────────────────────────────────────────────── */

export default function Home() {
    const { fixtureWithResults, loading: fixtureLoading } = useFixture();
    const { standings, loading: standingsLoading } = useStandings();
    const { bracket, loading: playoffsLoading } = usePlayoffs();

    const { lastPlayed, nextRound, played, total, started, regularOver } = useMemo(() => {
        const total = fixtureWithResults.reduce((a, r) => a + r.matches.length, 0);
        const played = fixtureWithResults.reduce(
            (a, r) => a + r.matches.filter((m) => m.result !== null).length,
            0
        );
        return {
            total,
            played,
            started: played > 0,
            regularOver: total > 0 && played === total,
            lastPlayed: [...fixtureWithResults]
                .reverse()
                .find((r) => r.matches.some((m) => m.result !== null)),
            nextRound: fixtureWithResults.find((r) =>
                r.matches.some((m) => m.result === null)
            ),
        };
    }, [fixtureWithResults]);

    const leader = standings[0];

    return (
        <Layout>
            <div className="flex flex-col gap-9">

                {/* ── Hero ── */}
                <section className="nm-lg nm-edge scene a-rise relative overflow-hidden px-5 py-7 sm:px-9 sm:py-10">
                    <div
                        className="pointer-events-none absolute inset-0"
                        style={{
                            background:
                                "radial-gradient(30rem 18rem at 85% 10%, var(--red-ghost), transparent 68%)",
                        }}
                    />

                    <div className="tilt relative flex flex-col items-center gap-7 sm:flex-row sm:gap-9">
                        <Basketball3D size={150} className="layer-2" />

                        <div className="flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
                            <p
                                className="cond text-[0.7rem] font-bold uppercase tracking-[0.24em]"
                                style={{ color: "var(--red)" }}
                            >
                                Asociación Santafesina de Básquetbol
                            </p>

                            <h1
                                className="display text-5xl leading-[0.92] sm:text-6xl"
                                style={{ color: "var(--text-1)" }}
                            >
                                Torneo Oficial
                                <br />
                                Promocional 2026
                            </h1>

                            <p className="max-w-md text-sm" style={{ color: "var(--text-2)" }}>
                                {regularOver
                                    ? "Fase regular terminada. Arranca la definición: Play In, Cuartos, Semis y Final."
                                    : "Zona única de 12 equipos · 11 fechas · del 2 de agosto al 11 de octubre."}
                            </p>

                            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
                                {!regularOver && nextRound && <CountdownPill date={nextRound.date} />}
                                <Link to="/tabla" className="nm-btn nm-btn-accent px-5 py-2.5 text-xs">
                                    Ver tabla
                                </Link>
                                <Link to="/fixture" className="nm-btn px-5 py-2.5 text-xs">
                                    Fixture
                                </Link>
                                <Link to="/playoffs" className="nm-btn px-5 py-2.5 text-xs">
                                    🏆 Fase final
                                </Link>
                                <NotificationButton />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Franja de estadísticas ── */}
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <StatTile label="Equipos" value="12" delay={0} />
                    <StatTile label="Fechas" value="11" delay={70} />
                    <StatTile
                        label="Partidos jugados"
                        value={fixtureLoading ? "–" : `${played}/${total}`}
                        tone="accent"
                        delay={140}
                    />
                    <div
                        className="nm nm-edge a-rise flex flex-col items-center justify-center gap-1 px-2 py-4"
                        style={{ "--d": "210ms" }}
                    >
                        {leader && leader.played > 0 ? (
                            <>
                                <TeamLogo team={leader.team} size={34} />
                                <span
                                    className="cond truncate text-[0.72rem] font-bold uppercase tracking-wide"
                                    style={{ color: "var(--text-1)" }}
                                >
                                    {teamShortNames[leader.team] ?? leader.team}
                                </span>
                            </>
                        ) : (
                            <span className="display text-3xl" style={{ color: "var(--text-3)" }}>
                                –
                            </span>
                        )}
                        <span
                            className="cond text-[0.66rem] font-bold uppercase tracking-[0.14em]"
                            style={{ color: "var(--text-3)" }}
                        >
                            Puntero
                        </span>
                    </div>
                </section>

                {fixtureLoading && <Spinner />}

                {/* ── Torneo sin arrancar ── */}
                {!fixtureLoading && !started && (
                    <>
                        {nextRound && <NextRound round={nextRound} />}
                        <StandingsMini standings={standings} loading={standingsLoading} />
                    </>
                )}

                {/* ── Torneo en curso ── */}
                {!fixtureLoading && started && (
                    <div className="grid grid-cols-1 gap-9 lg:grid-cols-2">
                        <div className="flex flex-col gap-9">
                            {lastPlayed && !regularOver && <LastRoundResults round={lastPlayed} />}
                            {nextRound && <NextRound round={nextRound} />}
                            <PlayoffMini bracket={bracket} loading={playoffsLoading} />
                        </div>
                        <StandingsMini standings={standings} loading={standingsLoading} />
                    </div>
                )}
            </div>
        </Layout>
    );
}
