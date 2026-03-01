import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import logo from "../../assets/UyP.png";

const navLinks = [
    { to: "/", label: "Inicio" },
    { to: "/tabla", label: "Tabla" },
    { to: "/fixture", label: "Fixture" },
];

function ThemeToggleButton({ isDark, toggleTheme, theme }) {
    return (
        <button
            onClick={toggleTheme}
            className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none shrink-0"
            style={{
                backgroundColor: isDark ? "#A90000" : "#00005522",
                border: `1px solid ${isDark ? "#A90000" : "#00005533"}`,
            }}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            <div
                className="absolute top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs transition-all duration-300"
                style={{
                    left: isDark ? "calc(100% - 1.375rem)" : "0.125rem",
                    backgroundColor: isDark ? "#ffffff" : "#000055",
                }}
            >
                {isDark ? "🌙" : "☀️"}
            </div>
        </button>
    );
}

export default function Navbar() {
    const { isAdmin, logout } = useAuth();
    const { isDark, toggleTheme, theme } = useTheme();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <nav
            className="sticky top-0 z-50 transition-colors duration-300"
            style={{
                backgroundColor: theme.bgNav,
                boxShadow: isDark
                    ? "0 2px 20px rgba(0,0,0,0.3)"
                    : "0 2px 20px rgba(0,0,85,0.1)",
                borderBottom: `1px solid ${theme.border}`,
            }}
        >
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

                {/* Logo + Título */}
                <NavLink to="/" className="flex items-center gap-3 shrink-0">
                    <img src={logo} alt="UyP" className="h-10 w-10 object-contain" />
                    <div className="flex flex-col leading-tight">
                        <span
                            className="font-black text-base tracking-wide uppercase transition-colors duration-300"
                            style={{ color: theme.textNav }}
                        >
                            Unión y Progreso
                        </span>
                        <span
                            className="text-xs tracking-widest uppercase transition-colors duration-300"
                            style={{ color: theme.textNavMuted }}
                        >
                            Torneo Promocional 2026
                        </span>
                    </div>
                </NavLink>

                {/* Links escritorio */}
                <div className="hidden md:flex items-center gap-6">
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === "/"}
                            className={({ isActive }) =>
                                `text-sm uppercase tracking-wider font-semibold pb-0.5 transition-all duration-200 border-b-2 ${isActive ? "border-red-700" : "border-transparent"
                                }`
                            }
                            style={({ isActive }) => ({
                                color: isActive ? theme.textNavActive : theme.textNavLink,
                            })}
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <NavLink
                            to="/admin"
                            className={({ isActive }) =>
                                `text-sm uppercase tracking-wider font-semibold pb-0.5 transition-all duration-200 border-b-2 ${isActive ? "border-red-700" : "border-transparent"
                                }`
                            }
                            style={({ isActive }) => ({
                                color: isActive ? theme.textNavActive : theme.textNavLink,
                            })}
                        >
                            Admin
                        </NavLink>
                    )}
                </div>

                {/* Derecha */}
                <div className="flex items-center gap-3">
                    <ThemeToggleButton isDark={isDark} toggleTheme={toggleTheme} theme={theme} />

                    {isAdmin && (
                        <button
                            onClick={handleLogout}
                            className="hidden md:block text-xs font-bold uppercase tracking-wider text-white px-3 py-1.5 rounded-lg transition-all duration-200"
                            style={{ backgroundColor: "#A90000" }}
                            onMouseEnter={e => e.target.style.backgroundColor = "#8a0000"}
                            onMouseLeave={e => e.target.style.backgroundColor = "#A90000"}
                        >
                            Salir
                        </button>
                    )}

                    {/* Hamburguesa */}
                    <button
                        className="md:hidden transition-colors duration-300"
                        style={{ color: theme.textNavLink }}
                        onClick={() => setMenuOpen(!menuOpen)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {menuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Menú mobile */}
            {menuOpen && (
                <div
                    className="md:hidden px-4 pt-2 pb-4 flex flex-col gap-3 transition-colors duration-300"
                    style={{
                        backgroundColor: theme.bgNavMobile,
                        borderTop: `1px solid ${theme.border}`,
                    }}
                >
                    {navLinks.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            end={link.to === "/"}
                            onClick={() => setMenuOpen(false)}
                            className="text-sm uppercase tracking-wider font-semibold py-1 transition-colors duration-200"
                            style={({ isActive }) => ({
                                color: isActive ? theme.textNavActive : theme.textNavLink,
                            })}
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    {isAdmin && (
                        <>
                            <NavLink
                                to="/admin"
                                onClick={() => setMenuOpen(false)}
                                className="text-sm uppercase tracking-wider font-semibold py-1 transition-colors duration-200"
                                style={({ isActive }) => ({
                                    color: isActive ? theme.textNavActive : theme.textNavLink,
                                })}
                            >
                                Admin
                            </NavLink>
                            <button
                                onClick={handleLogout}
                                className="text-xs font-bold uppercase tracking-wider text-white px-3 py-2 rounded-lg w-fit"
                                style={{ backgroundColor: "#A90000" }}
                            >
                                Cerrar sesión
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}