import { useState } from "react";
import Layout from "../components/ui/Layout";
import MatchResultForm from "../components/admin/MatchResultForm";
import PlayoffAdminPanel from "../components/admin/PlayoffAdminPanel";
import { SectionTitle, ProgressBar, Spinner } from "../components/ui/Primitives";
import { useFixture } from "../hooks/useFixture";
import { useAuth } from "../context/AuthContext";
import { formatDateLong } from "../data/fixture";

const TABS = [
    { id: "regular", label: "🏀 Fase Regular" },
    { id: "playoffs", label: "🏆 Fase Final" },
];

export default function Admin() {
    const { fixtureWithResults, loading } = useFixture();
    const { logout } = useAuth();
    const [round, setRound] = useState(1);
    const [tab, setTab] = useState("regular");

    const current = fixtureWithResults.find((r) => r.round === round);
    const total = fixtureWithResults.reduce((a, r) => a + r.matches.length, 0);
    const played = fixtureWithResults.reduce(
        (a, r) => a + r.matches.filter((m) => m.result !== null).length,
        0
    );

    return (
        <Layout>
            <div className="flex flex-col gap-6">
                <SectionTitle
                    eyebrow="Torneo Oficial Promocional 2026"
                    title="Panel Admin"
                    right={
                        <button onClick={logout} className="nm-btn px-4 py-2 text-xs">
                            Cerrar sesión
                        </button>
                    }
                />

                <div className="nm nm-edge a-rise p-5">
                    <ProgressBar
                        value={played}
                        max={total}
                        label="Fase regular"
                        hint={`${played} / ${total} partidos`}
                    />
                </div>

                <div className="flex gap-2">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`nm-btn flex-1 py-3 text-xs ${tab === t.id ? "nm-btn-on" : ""}`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {tab === "regular" && (
                    <>
                        <div className="flex flex-col gap-2.5">
                            <span className="eyebrow">Seleccioná una fecha</span>
                            <div className="no-bar -mx-1 flex gap-2 overflow-x-auto px-1 py-1">
                                {fixtureWithResults.map((r) => {
                                    const active = r.round === round;
                                    const done = r.matches.every((m) => m.result !== null);
                                    const some = r.matches.some((m) => m.result !== null);

                                    return (
                                        <button
                                            key={r.round}
                                            onClick={() => setRound(r.round)}
                                            className={`nm-btn relative shrink-0 px-4 py-2.5 text-xs ${active ? "nm-btn-on" : ""}`}
                                        >
                                            {r.round}ª
                                            {!active && some && (
                                                <span
                                                    className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full"
                                                    style={{
                                                        background: done ? "var(--ok)" : "var(--red)",
                                                    }}
                                                />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {loading ? (
                            <Spinner />
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div className="flex items-baseline justify-between gap-3">
                                    <h3 className="display text-2xl" style={{ color: "var(--text-1)" }}>
                                        {current?.label}
                                    </h3>
                                    <span
                                        className="cond text-[0.68rem] font-bold uppercase tracking-[0.14em]"
                                        style={{ color: "var(--text-3)" }}
                                    >
                                        {formatDateLong(current?.date)} ·{" "}
                                        {current?.matches.filter((m) => m.result !== null).length}/
                                        {current?.matches.length} cargados
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {current?.matches.map((match, i) => (
                                        <MatchResultForm
                                            key={match.id}
                                            match={match}
                                            date={current.date}
                                            delay={i * 45}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {tab === "playoffs" && <PlayoffAdminPanel />}
            </div>
        </Layout>
    );
}
