import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import {
    descartadaHacePoco,
    esIOS,
    esMovil,
    fueInstalada,
    hayPrompt,
    instantanea,
    lanzarPrompt,
    registrarDescarte,
    suscribir,
    yaInstalada,
} from "../services/pwaInstall";

/**
 * Estado compartido de la instalación.
 *
 * Va en un contexto y no en un hook suelto porque hay dos consumidores en
 * lugares distintos del árbol: el botón manual del menú y el modal automático
 * del Layout. Con un hook cada uno tendría su propio estado y el botón no
 * podría abrir el modal.
 */

const PWAInstallContext = createContext(null);

/** Margen para no pisar el primer render de la página. */
const RETRASO_MS = 3000;

export function PWAInstallProvider({ children }) {
    // Solo para que el árbol se entere de que cambió el evento nativo.
    useSyncExternalStore(suscribir, instantanea, () => "0|0");

    const puedeInstalar = hayPrompt();
    const instalada = yaInstalada() || fueInstalada();

    // Se lee una sola vez: no queremos tocar localStorage en cada render.
    const [descartadaAntes] = useState(descartadaHacePoco);

    const [pasoElRetraso, setPasoElRetraso] = useState(false);
    const [cerradaPorElUsuario, setCerradaPorElUsuario] = useState(false);
    const [abiertaAMano, setAbiertaAMano] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setPasoElRetraso(true), RETRASO_MS);
        return () => clearTimeout(t);
    }, []);

    /* Alcanza con estar en un celular: ni iOS ni Firefox Android ni el
       navegador embebido de Instagram disparan `beforeinstallprompt`, y son
       justamente los que más necesitan que les expliquemos el camino a mano.
       En escritorio no aparece solo, pero el botón del menú sí funciona. */
    const correspondeAutomatico =
        pasoElRetraso &&
        !instalada &&
        !descartadaAntes &&
        !cerradaPorElUsuario &&
        esMovil;

    const mostrarModal = abiertaAMano || correspondeAutomatico;

    const abrirModal = useCallback(() => setAbiertaAMano(true), []);

    const cerrarModal = useCallback(() => {
        registrarDescarte();
        setAbiertaAMano(false);
        setCerradaPorElUsuario(true);
    }, []);

    const instalar = useCallback(async () => {
        const resultado = await lanzarPrompt();
        if (resultado === "accepted") {
            setAbiertaAMano(false);
            setCerradaPorElUsuario(true);
        }
        return resultado;
    }, []);

    /* El botón del menú: en cualquier celular sin instalar, y en escritorio
       solo si el navegador ofreció el prompt nativo. */
    const puedeOfrecerse = !instalada && (esMovil || puedeInstalar);

    const valor = useMemo(
        () => ({
            puedeInstalar,
            esIOS,
            yaInstalada: instalada,
            puedeOfrecerse,
            mostrarModal,
            instalar,
            abrirModal,
            cerrarModal,
        }),
        [puedeInstalar, instalada, puedeOfrecerse, mostrarModal, instalar, abrirModal, cerrarModal]
    );

    return (
        <PWAInstallContext.Provider value={valor}>
            {children}
        </PWAInstallContext.Provider>
    );
}

export function usePWAInstall() {
    const context = useContext(PWAInstallContext);
    if (!context) throw new Error("usePWAInstall debe usarse dentro de PWAInstallProvider");
    return context;
}
