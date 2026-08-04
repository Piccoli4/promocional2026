import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/UyP.png";

/* ── Iconografía (SVG inline, hereda currentColor) ─────────────────── */

const Icon = {
    home: (
        <path d="M3 10.6 12 3.5l9 7.1V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
    ),
    table: (
        <>
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M3 9.5h18M3 15h18M9 4v16" />
        </>
    ),
    calendar: (
        <>
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
        </>
    ),
    trophy: (
        <>
            <path d="M7 4h10v5a5 5 0 0 1-10 0z" />
            <path d="M7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5A3.5 3.5 0 0 1 16.5 11" />
            <path d="M12 14v3M9 20h6M10 17h4" />
        </>
    ),
    shield: (
        <path d="M12 3l7 3v5.5c0 4.4-2.9 8.2-7 9.5-4.1-1.3-7-5.1-7-9.5V6z" />
    ),
    chart: (
        <>
            <path d="M4 20V4" />
            <path d="M4 20h16" />
            <path d="M8.5 20v-6M13 20V8.5M17.5 20v-9" />
        </>
    ),
};

function NavIcon({ name, active }) {
    // Los iconos son de contorno: rellenarlos los convertiría en manchas.
    // El estado activo se marca con color, grosor y el hueco neumórfico.
    return (
        <svg
            className="h-5 w-5 transition-[stroke-width] duration-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={active ? 2.4 : 1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {Icon[name]}
        </svg>
    );
}

// Con cinco ítems la barra inferior queda justa en pantallas angostas, así que
// las etiquetas se mantienen cortas a propósito.
const LINKS = [
    { to: "/", label: "Inicio", icon: "home" },
    { to: "/tabla", label: "Tabla", icon: "table" },
    { to: "/fixture", label: "Fixture", icon: "calendar" },
    { to: "/estadisticas", label: "Estadísticas", icon: "chart" },
    { to: "/playoffs", label: "Final", icon: "trophy" },
];

/* ── Interruptor de tema: knob neumórfico que se desliza ──────────── */

function ThemeToggle() {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="nm-in-sm relative h-9 w-16 shrink-0 rounded-full"
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            aria-label={isDark ? "Activar modo claro" : "Activar modo oscuro"}
        >
            <span
                className="absolute top-1 flex h-7 w-7 items-center justify-center rounded-full text-sm transition-[left] duration-400 cursor-pointer"
                style={{
                    left: isDark ? "calc(100% - 2rem)" : "0.25rem",
                    background: "var(--surface)",
                    boxShadow: "var(--nm-xs)",
                    transitionTimingFunction: "var(--ease-spring)",
                }}
            >
                {isDark ? "🌙" : "☀️"}
            </span>
        </button>
    );
}

/* ── Barra superior ───────────────────────────────────────────────── */

export function TopBar() {
    const { isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    const links = isAdmin
        ? [...LINKS, { to: "/admin", label: "Admin", icon: "shield" }]
        : LINKS;

    return (
        <header className="sticky top-0 z-40 px-3 pt-3 sm:px-5 sm:pt-4">
            <div
                className="nm nm-edge mx-auto flex max-w-6xl items-center gap-3 px-3 py-2.5 sm:px-5 sm:py-3"
                style={{ backdropFilter: "blur(6px)" }}
            >
                <NavLink to="/" className="flex min-w-0 items-center gap-3">
                    <span className="nm-sm flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl p-1.5">
                        <img src={logo} alt="Unión y Progreso" className="h-full w-full object-contain" />
                    </span>
                    <span className="flex min-w-0 flex-col leading-none">
                        <span
                            className="display truncate text-lg sm:text-xl"
                            style={{ color: "var(--text-1)" }}
                        >
                            Unión y Progreso
                        </span>
                        <span
                            className="cond truncate text-[0.62rem] font-bold uppercase tracking-[0.18em]"
                            style={{ color: "var(--red)" }}
                        >
                            Oficial 2026
                        </span>
                    </span>
                </NavLink>

                {/* Enlaces de escritorio */}
                <nav className="ml-auto hidden items-center gap-1 md:flex">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === "/"}
                            className={({ isActive }) =>
                                `nm-btn flex items-center gap-2 px-4 py-2 text-xs ${isActive ? "nm-btn-on" : ""}`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <NavIcon name={link.icon} active={isActive} />
                                    {link.label}
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2 md:ml-2">
                    <ThemeToggle />
                    {isAdmin && (
                        <button
                            onClick={handleLogout}
                            className="nm-btn hidden px-4 py-2 text-xs md:block"
                        >
                            Salir
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
}

/* ── Barra inferior (móvil) ───────────────────────────────────────── */

export function BottomNav() {
    const { isAdmin } = useAuth();
    const links = isAdmin
        ? [...LINKS, { to: "/admin", label: "Admin", icon: "shield" }]
        : LINKS;

    return (
        <nav
            className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 md:hidden"
            style={{
                background:
                    "linear-gradient(to top, var(--bg) 55%, transparent)",
            }}
        >
            <div className="nm nm-edge mx-auto flex max-w-md items-stretch justify-between gap-1 p-1.5">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.to === "/"}
                        className="group flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl py-2 transition-all duration-300"
                        style={({ isActive }) => ({
                            color: isActive ? "var(--red)" : "var(--text-3)",
                            boxShadow: isActive ? "var(--nm-in-sm)" : "none",
                            background: isActive ? "var(--sunken)" : "transparent",
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <NavIcon name={link.icon} active={isActive} />
                                <span className="cond text-[0.6rem] font-bold uppercase tracking-wider">
                                    {link.label}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
