import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

/**
 * El tema vive en CSS (variables en `:root` y `[data-theme="dark"]`).
 * Acá solo decidimos cuál está activo y lo escribimos en <html data-theme>.
 */
const STORAGE_KEY = "theme";

// Color de la barra del sistema en móvil, por tema
const STATUS_BAR = { dark: "#191933", light: "#e8e4db" };

function getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(getInitialTheme);
    const isDark = mode === "dark";

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", mode);
        localStorage.setItem(STORAGE_KEY, mode);

        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute("content", STATUS_BAR[mode]);
    }, [mode]);

    const toggleTheme = () => setMode((prev) => (prev === "dark" ? "light" : "dark"));

    return (
        <ThemeContext.Provider value={{ mode, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
    return context;
}
