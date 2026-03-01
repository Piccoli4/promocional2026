import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const themes = {
    dark: {
        name: "dark",

        bgApp: "#252545",
        bgCard: "#2e2e55",
        bgCardAlt: "#333360",
        bgNav: "#000055",
        bgNavMobile: "#252545",
        bgInput: "#252545",
        bgRow1: "#2a2a50",
        bgRow2: "#2e2e55",
        bgTableHead: "#000055",
        bgTableFoot: "#000055",
        bgButton: "#2e2e55",
        bgHero: "linear-gradient(135deg, #000055 0%, #4a1010 100%)",

        // Textos Navbar
        textNav: "#ffffff",
        textNavMuted: "#ffffff66",
        textNavLink: "#ffffffaa",
        textNavActive: "#ffffff",
        borderNavActive: "#A90000",

        // Textos Hero
        textHeroSub: "#ff9999",
        textHeroTitle: "#ffffff",
        textHeroDesc: "#ffffff88",
        borderHeroBtn: "#ffffff44",
        textHeroBtn: "#ffffffcc",

        border: "#ffffff12",
        borderStrong: "#ffffff25",
        borderAccent: "#A90000",

        textPrimary: "#ffffff",
        textSecondary: "#ffffffaa",
        textMuted: "#ffffff44",
        textAccent: "#A90000",
        textGreen: "#4ade80",
        textRed: "#f87171",

        shadow: "0 4px 24px rgba(0,0,0,0.4)",
        shadowCard: "0 2px 12px rgba(0,0,0,0.3)",
    },

    light: {
        name: "light",

        bgApp: "#ede9e1ff",
        bgCard: "#ffffff",
        bgCardHover: "#faf7f2",
        bgNav: "#ffffff",
        bgNavMobile: "#f5f0e8",
        bgInput: "#f0ebe0",
        bgRow1: "#ffffff",
        bgRow2: "#faf7f2",
        bgTableHead: "#000055",
        bgTableFoot: "#000055",
        bgButton: "#f0ebe0",
        bgHero: "linear-gradient(135deg, #f0ebe0 0%, #e8e0d0 100%)",

        // Textos Navbar
        textNav: "#000055",
        textNavMuted: "#00005566",
        textNavLink: "#000055aa",
        textNavActive: "#000055",
        borderNavActive: "#A90000",

        // Textos Hero — siempre blanco porque el fondo es oscuro
        textHeroSub: "#A90000",
        textHeroTitle: "#000055",
        textHeroDesc: "#00005588",
        borderHeroBtn: "#00005533",
        textHeroBtn: "#000055cc",

        border: "#00005518",
        borderStrong: "#00005530",
        borderAccent: "#A90000",

        textPrimary: "#0f0f1a",
        textSecondary: "#0f0f1aaa",
        textMuted: "#0f0f1a66",
        textAccent: "#A90000",
        textGreen: "#16a34a",
        textRed: "#dc2626",

        shadow: "0 4px 24px rgba(0,0,85,0.08)",
        shadowCard: "0 2px 12px rgba(0,0,85,0.06)",
    },
};

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem("theme");
        return saved ? saved === "dark" : true;
    });

    const theme = isDark ? themes.dark : themes.light;

    const toggleTheme = () => {
        setIsDark((prev) => {
            localStorage.setItem("theme", !prev ? "dark" : "light");
            return !prev;
        });
    };

    useEffect(() => {
        document.body.style.backgroundColor = theme.bgApp;
    }, [theme.bgApp]);

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
    return context;
}