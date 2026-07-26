import TeamLogo from "../ui/TeamLogo";

/** Panel del campeón: escudo flotando sobre un aro en perspectiva. */
export default function ChampionBanner({ team }) {
    return (
        <div className="nm-lg nm-edge scene a-pop relative overflow-hidden px-6 py-8">
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        "radial-gradient(24rem 14rem at 50% 0%, var(--red-ghost), transparent 70%)",
                }}
            />

            <div className="tilt relative flex flex-col items-center gap-3">
                <span className="eyebrow" style={{ color: "var(--gold)" }}>
                    Campeón
                </span>

                <div className="relative flex h-28 w-28 items-center justify-center">
                    {/* Aro en perspectiva */}
                    <span
                        className="hoop-ring absolute bottom-2 h-12 w-24"
                        style={{ opacity: 0.55 }}
                    />
                    <span className="a-float relative z-10">
                        <TeamLogo team={team} size={82} />
                    </span>
                </div>

                <h3
                    className="display text-center text-3xl sm:text-4xl"
                    style={{ color: "var(--text-1)" }}
                >
                    {team}
                </h3>
                <p
                    className="cond text-center text-[0.68rem] font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--text-3)" }}
                >
                    Torneo Oficial Promocional 2026
                </p>
            </div>
        </div>
    );
}
