import { useLocation } from "react-router-dom";
import CourtBackdrop from "./CourtBackdrop";
import { TopBar, BottomNav } from "./Navbar";
import InstallPWAModal from "../pwa/InstallPWAModal";

export default function Layout({ children }) {
    const { pathname } = useLocation();

    return (
        <div className="relative min-h-screen">
            <CourtBackdrop />

            <div className="relative z-10 flex min-h-screen flex-col">
                <TopBar />

                {/* La key remonta el contenido en cada ruta y dispara las entradas */}
                <main
                    key={pathname}
                    className="mx-auto w-full max-w-6xl flex-1 px-3 pb-32 pt-6 sm:px-5 sm:pt-8 md:pb-16"
                >
                    {children}
                </main>

                <footer className="mx-auto w-full max-w-6xl px-4 pb-28 md:pb-8">
                    <div
                        className="cond flex flex-col items-center gap-1 border-t pt-5 text-center text-[0.7rem] uppercase tracking-[0.16em]"
                        style={{ borderColor: "var(--line)", color: "var(--text-3)" }}
                    >
                        <span style={{ color: "var(--text-2)" }}>
                            Club Unión y Progreso
                        </span>
                        <span>Torneo Oficial Promocional 2026 · Asociación Santafesina de Básquetbol</span>
                    </div>
                </footer>
            </div>

            <BottomNav />

            {/* Acá y no en App para que no aparezca en el login */}
            <InstallPWAModal />
        </div>
    );
}
