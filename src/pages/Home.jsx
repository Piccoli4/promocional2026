import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/ui/Layout";
import LastRoundResults from "../components/fixture/LastRoundResults";
import NextRound from "../components/fixture/NextRound";
import StandingsMini from "../components/standings/StandingsMini";
import { useFixture } from "../hooks/useFixture";
import { useStandings } from "../hooks/useStandings";
import { useTheme } from "../context/ThemeContext";
import { requestNotificationPermission } from "../services/messaging";
import logo from "../assets/UyP.png";

export default function Home() {
    const { fixtureWithResults, loading: fixtureLoading } = useFixture();
    const { standings, loading: standingsLoading } = useStandings();
    const { theme } = useTheme();
    const [notifStatus, setNotifStatus] = useState("idle"); // idle | loading | granted | denied

    // Verificar si ya tiene permiso al cargar
    useEffect(() => {
        if (!('Notification' in window)) return;
        if (Notification.permission === "granted") setNotifStatus("granted");
        if (Notification.permission === "denied") setNotifStatus("denied");
    }, []);

    const handleSubscribe = async () => {
        setNotifStatus("loading");
        const token = await requestNotificationPermission();
        if (token) {
            setNotifStatus("granted");
        } else {
            setNotifStatus("denied");
        }
    };

    const lastPlayedRound = [...fixtureWithResults]
        .reverse()
        .find((r) => r.matches.some((m) => m.result !== null));

    const nextRound = fixtureWithResults.find((r) =>
        r.matches.every((m) => m.result === null)
    );

    const tournamentStarted = fixtureWithResults.some((r) =>
        r.matches.some((m) => m.result !== null)
    );

    return (
        <Layout>
            <div className="flex flex-col gap-8">

                {/* Hero */}
                <div
                    className="rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300"
                    style={{
                        background: theme.bgHero,
                        boxShadow: theme.shadow,
                        border: `1px solid ${theme.border}`,
                    }}
                >
                    <img
                        src={logo}
                        alt="UyP Logo"
                        className="h-24 w-24 sm:h-32 sm:w-32 object-contain shrink-0"
                    />
                    <div className="flex flex-col gap-2 text-center sm:text-left">
                        <p
                            className="text-xs uppercase tracking-widest font-semibold"
                            style={{ color: theme.textHeroSub }}
                        >
                            Unión y Progreso — Básquet
                        </p>
                        <h1
                            className="text-3xl sm:text-4xl font-black uppercase leading-tight"
                            style={{ color: theme.textHeroTitle }}
                        >
                            Torneo Promocional 2026
                        </h1>
                        <p className="text-sm" style={{ color: theme.textHeroDesc }}>
                            Fase Clasificatoria · 12 equipos · 11 fechas
                        </p>
                        <div className="flex gap-3 mt-2 justify-center sm:justify-start flex-wrap">
                            <Link
                                to="/tabla"
                                className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200"
                                style={{ backgroundColor: "#A90000", color: "#ffffff" }}
                            >
                                Ver Tabla
                            </Link>
                            <Link
                                to="/fixture"
                                className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200"
                                style={{
                                    backgroundColor: "transparent",
                                    border: `1px solid ${theme.borderHeroBtn}`,
                                    color: theme.textHeroBtn,
                                }}
                            >
                                Ver Fixture
                            </Link>

                            {/* Botón notificaciones — solo si el browser lo soporta */}
                            {'Notification' in window && notifStatus !== "granted" && (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={notifStatus === "loading" || notifStatus === "denied"}
                                    className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide transition-all duration-200 disabled:opacity-50"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: `1px solid ${theme.borderHeroBtn}`,
                                        color: theme.textHeroBtn,
                                    }}
                                >
                                    {notifStatus === "loading" ? "..." :
                                     notifStatus === "denied" ? "🔕 Bloqueadas" :
                                     "🔔 Activar alertas"}
                                </button>
                            )}

                            {notifStatus === "granted" && (
                                <span
                                    className="px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide"
                                    style={{ color: theme.textGreen }}
                                >
                                    🔔 Alertas activas
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Torneo no iniciado */}
                {!fixtureLoading && !tournamentStarted && (
                    <div
                        className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
                        style={{
                            backgroundColor: theme.bgCard,
                            border: `1px solid ${theme.border}`,
                            boxShadow: theme.shadowCard,
                        }}
                    >
                        <span className="text-4xl">🏀</span>
                        <p className="font-bold text-lg uppercase tracking-wide" style={{ color: theme.textPrimary }}>
                            El torneo aún no comenzó
                        </p>
                        <p className="text-sm" style={{ color: theme.textMuted }}>
                            Los resultados aparecerán aquí una vez que se juegue la primera fecha
                        </p>
                    </div>
                )}

                {/* Contenido principal */}
                {tournamentStarted && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-8">
                            {!fixtureLoading && lastPlayedRound && (
                                <LastRoundResults round={lastPlayedRound} />
                            )}
                            {!fixtureLoading && nextRound && (
                                <NextRound round={nextRound} />
                            )}
                        </div>
                        <div>
                            <StandingsMini standings={standings} loading={standingsLoading} />
                        </div>
                    </div>
                )}

                {fixtureLoading && (
                    <div className="flex items-center justify-center py-20">
                        <div
                            className="w-10 h-10 rounded-full border-4 animate-spin"
                            style={{ borderColor: "#A90000", borderTopColor: "transparent" }}
                        />
                    </div>
                )}
            </div>
        </Layout>
    );
}