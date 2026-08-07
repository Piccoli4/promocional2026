import { useState } from "react";

/**
 * Instalación en Android/Chromium: se dispara el prompt nativo.
 *
 * Si el navegador no lo expone —Firefox, o el navegador embebido de Instagram
 * o Facebook— caemos a instrucciones manuales en el mismo modal en vez de
 * dejar un botón que no hace nada.
 */
export default function AndroidInstallContent({ puedeInstalar, instalar, onCerrar }) {
    // Si ya sabemos que no hay prompt, arrancamos directo en las instrucciones:
    // más vale eso que un botón "Instalar" que no va a hacer nada.
    const [sinPrompt, setSinPrompt] = useState(!puedeInstalar);
    const [instalando, setInstalando] = useState(false);

    const handleInstalar = async () => {
        setInstalando(true);
        const resultado = await instalar();
        setInstalando(false);
        if (resultado === "no-disponible") setSinPrompt(true);
    };

    return (
        <>
            <ul className="flex flex-col gap-2.5 text-sm" style={{ color: "var(--text-2)" }}>
                <li className="flex gap-2.5">
                    <span aria-hidden="true">🏀</span>
                    Acceso directo en la pantalla de inicio, como cualquier app.
                </li>
                <li className="flex gap-2.5">
                    <span aria-hidden="true">⚡</span>
                    Se abre a pantalla completa, sin la barra del navegador.
                </li>
                <li className="flex gap-2.5">
                    <span aria-hidden="true">🔔</span>
                    Recibís los resultados apenas se cargan.
                </li>
            </ul>

            {sinPrompt && (
                <div className="nm-in-sm flex flex-col gap-2 rounded-2xl p-4">
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>
                        Tu navegador no permite instalarla desde acá. Abrí el menú{" "}
                        <strong style={{ color: "var(--text-1)" }}>⋮</strong> y elegí{" "}
                        <strong style={{ color: "var(--text-1)" }}>«Instalar aplicación»</strong> o{" "}
                        <strong style={{ color: "var(--text-1)" }}>«Agregar a pantalla de inicio»</strong>.
                    </p>
                    <p className="text-[0.8rem]" style={{ color: "var(--text-3)" }}>
                        Si estás dentro de Instagram o Facebook, abrila en Chrome primero.
                    </p>
                </div>
            )}

            <div className="flex gap-2">
                {!sinPrompt && (
                    <button
                        onClick={handleInstalar}
                        disabled={instalando}
                        className="nm-btn nm-btn-accent flex-1 px-4 py-3 text-xs"
                    >
                        {instalando ? "..." : "Instalar"}
                    </button>
                )}
                <button
                    onClick={onCerrar}
                    className={`nm-btn px-4 py-3 text-xs ${sinPrompt ? "flex-1" : ""}`}
                >
                    {sinPrompt ? "Entendido" : "Ahora no"}
                </button>
            </div>
        </>
    );
}
