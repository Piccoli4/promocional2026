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
