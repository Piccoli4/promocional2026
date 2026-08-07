import { useCallback, useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { FORMATOS, generarPlaca, nombreArchivo } from "../../utils/shareCard";

/**
 * Botón que abre una hoja con la vista previa de la placa, el selector de
 * formato y las acciones de compartir o descargar.
 *
 * La placa se genera al abrir la hoja y al cambiar de formato, nunca al tocar
 * "Compartir": iOS exige que `navigator.share()` salga de un gesto del usuario
 * y un `await` en el medio le hace perder la activación.
 */

const IconoCompartir = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 15V3m0 0L8 7m4-4 4 4" />
        <path d="M4 13v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6" />
    </svg>
);

function puedeCompartirArchivos(file) {
    return (
        typeof navigator !== "undefined" &&
        typeof navigator.share === "function" &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
    );
}

function Hoja({ tipo, datos, base, onCerrar }) {
    const [formato, setFormato] = useState("cuadrada");
    const [resultado, setResultado] = useState(null);
    const [aviso, setAviso] = useState("");

    /* El padre arma `datos` en cada render, así que la identidad del objeto no
       sirve como dependencia: la placa se regeneraría sin parar. Serializado
       sí es estable, y de paso es lo que el efecto vuelve a leer. */
    const clave = JSON.stringify(datos);
    const pedido = `${tipo}|${formato}|${clave}`;

    /* Genera la placa al abrir y cada vez que cambia el formato. El resultado
       viaja con el `pedido` que lo originó: si todavía no coincide con el
       actual, la vista sabe que está generando sin necesidad de resetear nada. */
    useEffect(() => {
        let vigente = true;
        let creada = null;

        generarPlaca({ tipo, datos: JSON.parse(clave), formato })
            .then((blob) => {
                if (!vigente) return;
                if (!blob) {
                    setResultado({ pedido, error: true });
                    return;
                }
                creada = URL.createObjectURL(blob);
                setResultado({ pedido, url: creada, blob });
            })
            .catch(() => vigente && setResultado({ pedido, error: true }));

        return () => {
            vigente = false;
            if (creada) URL.revokeObjectURL(creada);
        };
    }, [tipo, clave, formato, pedido]);

    const listo = resultado?.pedido === pedido;
    const url = listo ? resultado.url : null;
    const blob = listo ? resultado.blob : null;
    const error = listo ? Boolean(resultado.error) : false;

    const archivo = () =>
        blob ? new File([blob], nombreArchivo(base), { type: "image/jpeg" }) : null;

    const compartir = async () => {
        const file = archivo();
        if (!file) return;

        if (puedeCompartirArchivos(file)) {
            try {
                await navigator.share({ files: [file] });
                onCerrar();
            } catch (err) {
                // El usuario canceló la hoja del sistema: no es un error.
                if (err?.name !== "AbortError") setAviso("No se pudo compartir");
            }
            return;
        }
        descargar();
    };

    const descargar = () => {
        if (!url) return;
        const a = document.createElement("a");
        a.href = url;
        a.download = nombreArchivo(base);
        a.click();
        setAviso("Imagen descargada");
    };

    const vertical = formato === "historia";

    return (
        <Modal
            titulo="Compartir placa"
            onCerrar={onCerrar}
            accion={
                <button
                    onClick={onCerrar}
                    className="nm-btn px-3 py-1.5 text-[0.65rem]"
                    aria-label="Cerrar"
                >
                    Cerrar
                </button>
            }
        >
                {/* Selector de formato */}
                <div className="flex gap-2">
                    {Object.values(FORMATOS).map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setFormato(f.id)}
                            className={`nm-btn flex-1 px-3 py-2 text-[0.68rem] ${formato === f.id ? "nm-btn-on" : ""}`}
                        >
                            {f.label}
                            <span className="ml-1.5 font-semibold normal-case tracking-normal opacity-60">
                                {f.hint}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Vista previa */}
                <div
                    className="nm-in flex items-center justify-center overflow-hidden p-3"
                    style={{ minHeight: vertical ? 320 : 220 }}
                >
                    {error ? (
                        <p className="cond px-4 py-8 text-center text-sm" style={{ color: "var(--text-3)" }}>
                            No se pudo generar la placa.
                        </p>
                    ) : url ? (
                        <img
                            src={url}
                            alt="Vista previa de la placa"
                            className="a-pop rounded-xl"
                            style={{
                                maxHeight: vertical ? 380 : 240,
                                width: "auto",
                                boxShadow: "0 12px 30px -12px rgba(0,0,0,0.65)",
                            }}
                        />
                    ) : (
                        <div
                            className="skeleton w-full"
                            style={{ aspectRatio: vertical ? "9 / 16" : "1 / 1", maxHeight: vertical ? 380 : 240 }}
                        />
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={compartir}
                        disabled={!url}
                        className="nm-btn nm-btn-accent flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs"
                    >
                        {IconoCompartir}
                        Compartir
                    </button>
                    <button
                        onClick={descargar}
                        disabled={!url}
                        className="nm-btn px-4 py-3 text-xs"
                    >
                        Descargar
                    </button>
                </div>

                <p
                    className="cond text-center text-[0.66rem] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: "var(--text-3)", minHeight: "1rem" }}
                >
                    {aviso}
                </p>
        </Modal>
    );
}

export default function ShareButton({ tipo, datos, base, label = "Compartir", className = "" }) {
    const [abierta, setAbierta] = useState(false);
    const cerrar = useCallback(() => setAbierta(false), []);

    return (
        <>
            <button
                onClick={() => setAbierta(true)}
                className={`nm-btn flex items-center gap-2 px-4 py-2 text-xs ${className}`}
            >
                {IconoCompartir}
                {label}
            </button>

            {abierta && <Hoja tipo={tipo} datos={datos} base={base} onCerrar={cerrar} />}
        </>
    );
}
