import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Pages
import Home from "./pages/Home";
import Standings from "./pages/Standings";
import Fixture from "./pages/Fixture";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

/**
 * Ruta protegida: solo accesible si hay un admin logueado.
 * Si no hay sesión, redirige al login.
 */
function ProtectedRoute({ children }) {
  const { isAdmin } = useAuth();
  return isAdmin ? children : <Navigate to="/login" replace />;
}

// Si el admin abre la app desde el ícono (start_url = "/"), lo manda al panel
function HomeOrAdmin() {
  const { isAdmin } = useAuth();
  return isAdmin ? <Navigate to="/admin" replace /> : <Home />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<HomeOrAdmin />} />
        <Route path="/tabla" element={<Standings />} />
        <Route path="/fixture" element={<Fixture />} />
        <Route path="/login" element={<Login />} />

        {/* Ruta protegida — solo admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          }
        />

        {/* Cualquier ruta desconocida redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}