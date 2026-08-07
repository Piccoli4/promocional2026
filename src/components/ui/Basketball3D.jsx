import { useEffect, useState } from "react";

/**
 * Pelota de básquet: foto real animada con CSS.
 *
 * Al abrir la app cae desde arriba con backspin, pica dos veces aplastándose
 * contra el piso y se acomoda flotando. El giro es en el plano de la pantalla
 * —como el backspin de una pelota que pica de verdad—, no sobre su eje: con
 * una sola foto no hay información del lado de atrás.
 */

/* El intro corre una sola vez por carga de la app. */
let introPlayed = false;

export default function Basketball3D({ size = 168, className = "", intro = true }) {
    const [phase, setPhase] = useState(() => {
        if (!intro || introPlayed) return "idle";
        introPlayed = true;
        return "intro";
    });

    /* Red de seguridad: si el intro no llega a emitir `animationend`
       (pestaña en segundo plano, animaciones deshabilitadas), pasa a reposo. */
    useEffect(() => {
        if (phase !== "intro") return;
        const t = setTimeout(() => setPhase("idle"), 2400);
        return () => clearTimeout(t);
    }, [phase]);

    return (
        <div
            className={`bb bb-${phase} shrink-0 ${className}`}
            style={{ "--bb": `${size}px` }}
            aria-hidden="true"
        >
            <div className="bb-shadow" />

            <div
                className="bb-drop"
                onAnimationEnd={(e) => e.animationName === "bb-in" && setPhase("idle")}
            >
                <div className="bb-squash">
                    <img
                        src="/pelota.png"
                        alt=""
                        width={size}
                        height={size}
                        className="bb-img"
                        draggable="false"
                        fetchPriority="high"
                    />
                </div>
            </div>
        </div>
    );
}
