import Modal from "../ui/Modal";
import Basketball3D from "../ui/Basketball3D";
import AndroidInstallContent from "./AndroidInstallContent";
import IOSInstallContent from "./IOSInstallContent";
import { usePWAInstall } from "../../context/PWAInstallContext";

/**
 * Decide qué instrucciones mostrar. iOS no tiene API de instalación, así que
 * se le explica el camino a mano; en Android/Chromium se dispara el prompt.
 */
export default function InstallPWAModal() {
    const { mostrarModal, esIOS, puedeInstalar, instalar, cerrarModal } = usePWAInstall();

    if (!mostrarModal) return null;

    return (
        <Modal
            titulo={esIOS ? "Instalá la app en tu iPhone" : "Instalá la app"}
            onCerrar={cerrarModal}
        >
            <div className="flex justify-center py-1">
                <Basketball3D size={92} intro={false} />
            </div>

            {esIOS ? (
                <IOSInstallContent onCerrar={cerrarModal} />
            ) : (
                <AndroidInstallContent
                    puedeInstalar={puedeInstalar}
                    instalar={instalar}
                    onCerrar={cerrarModal}
                />
            )}
        </Modal>
    );
}
