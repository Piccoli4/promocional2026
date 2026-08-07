/**
 * Instalación en iPhone. Safari no expone ninguna API de instalación, así que
 * esto es puramente instructivo.
 *
 * Los iconos van en SVG inline y no como imágenes para que hereden
 * `currentColor` y se lean igual en tema claro y oscuro.
 */

const IconoCompartir = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15V3m0 0L8.5 6.5M12 3l3.5 3.5" />
        <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" />
    </svg>
);

const IconoAgregar = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4" />
        <path d="M12 8.5v7M8.5 12h7" />
    </svg>
);

const IconoListo = (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor"
        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 12.5 9.5 18 20 6.5" />
    </svg>
);

const PASOS = [
    { icono: IconoCompartir, texto: <>Tocá el botón <strong>Compartir</strong> abajo en la barra de Safari.</> },
    { icono: IconoAgregar, texto: <>Deslizá y elegí <strong>«Agregar a pantalla de inicio»</strong>.</> },
    { icono: IconoListo, texto: <>Tocá <strong>«Agregar»</strong> arriba a la derecha.</> },
];

export default function IOSInstallContent({ onCerrar }) {
    return (
        <>
            {/* El error más común es intentarlo desde Chrome o desde el
                navegador embebido de Instagram, donde la opción no existe. */}
            <p
                className="nm-in-sm cond rounded-2xl px-4 py-3 text-center text-[0.72rem] font-bold uppercase tracking-[0.12em]"
                style={{ color: "var(--red)" }}
            >
                Tiene que ser desde Safari
            </p>

            <ol className="flex flex-col gap-3">
                {PASOS.map((paso, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <span
                            className="nm-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl"
                            style={{ color: "var(--red)" }}
                        >
                            {paso.icono}
                        </span>
                        <span className="flex min-w-0 items-baseline gap-2">
                            <span
                                className="display shrink-0 text-lg leading-none"
                                style={{ color: "var(--text-3)" }}
                            >
                                {i + 1}
                            </span>
                            <span className="text-sm" style={{ color: "var(--text-2)" }}>
                                {paso.texto}
                            </span>
                        </span>
                    </li>
                ))}
            </ol>

            <p className="text-[0.8rem]" style={{ color: "var(--text-3)" }}>
                Instalada, además, podés recibir los avisos de resultados: en iPhone las
                notificaciones solo funcionan con la app en la pantalla de inicio.
            </p>

            <button onClick={onCerrar} className="nm-btn nm-btn-accent px-4 py-3 text-xs">
                Entendido
            </button>

            {/* Señala el botón Compartir, que en iPhone está en la barra de abajo.
                En iPad esa barra está arriba, así que la flecha se esconde en
                pantallas anchas en vez de apuntar a cualquier lado. */}
            <span
                className="a-flecha flex justify-center sm:hidden"
                style={{ color: "var(--red)" }}
                aria-hidden="true"
            >
                <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 4v15m0 0-6-6m6 6 6-6" />
                </svg>
            </span>
        </>
    );
}
