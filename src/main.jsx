import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PWAInstallProvider } from "./context/PWAInstallContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import { iniciarCaptura } from "./services/pwaInstall";
import "./index.css";
import App from "./App";

// Antes de renderizar: `beforeinstallprompt` suele dispararse antes de que
// React monte, y si no lo agarramos acá el evento se pierde.
iniciarCaptura();

// Las páginas se bajan por separado: si hubo un deploy con la app abierta,
// el chunk que pide puede ya no existir. Recargamos para tomar la versión
// nueva, una sola vez por sesión para no entrar en un bucle.
window.addEventListener("vite:preloadError", (event) => {
  try {
    if (sessionStorage.getItem("chunk-reload")) return;
    sessionStorage.setItem("chunk-reload", "1");
  } catch {
    return;
  }
  event.preventDefault();
  window.location.reload();
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <ErrorBoundary>
        <AuthProvider>
          <PWAInstallProvider>
            <App />
          </PWAInstallProvider>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </StrictMode>
);
