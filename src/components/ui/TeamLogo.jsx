import { teamLogos, teamBadges } from "../../data/teamLogos";

/**
 * Escudo del equipo. Los clubes que presentan más de un equipo comparten
 * escudo, así que se les dibuja una insignia con la letra correspondiente.
 */
export default function TeamLogo({ team, size = 36, className = "", dim = false }) {
    const logo = teamLogos[team];
    const badge = teamBadges[team];
    const badgeSize = Math.max(13, Math.round(size * 0.42));

    return (
        <span
            className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            {logo ? (
                <img
                    src={logo}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-contain transition-opacity duration-300"
                    style={{ opacity: dim ? 0.45 : 1 }}
                />
            ) : (
                <span
                    className="nm-in-sm flex h-full w-full items-center justify-center rounded-full text-[0.6rem]"
                    style={{ color: "var(--text-3)" }}
                >
                    ?
                </span>
            )}

            {badge && (
                <span
                    className="cond absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full font-bold leading-none text-white"
                    style={{
                        width: badgeSize,
                        height: badgeSize,
                        fontSize: badgeSize * 0.62,
                        background: "linear-gradient(145deg, var(--red-bright), var(--red))",
                        boxShadow: "0 2px 6px -1px rgba(0,0,0,0.45)",
                        border: "1.5px solid var(--surface)",
                    }}
                >
                    {badge}
                </span>
            )}
        </span>
    );
}
