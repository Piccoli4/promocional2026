import Navbar from "./Navbar";
import { useTheme } from "../../context/ThemeContext";

export default function Layout({ children }) {
    const { theme } = useTheme();

    return (
        <div
            className="min-h-screen transition-colors duration-300"
            style={{ backgroundColor: theme.bgApp, color: theme.textPrimary }}
        >
            <Navbar />
            <main className="max-w-6xl mx-auto px-4 py-8">
                {children}
            </main>
            <footer
                className="text-center text-xs py-6 mt-8 border-t"
                style={{
                    color: theme.textMuted,
                    borderColor: theme.border,
                }}
            >
                Unión y Progreso — Torneo Promocional 2026
            </footer>
        </div>
    );
}