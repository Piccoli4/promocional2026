import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/ui/Layout";
import { Spinner } from "./components/ui/Primitives";

// La Home y el login van en el bundle principal: son las puertas de entrada.
// El resto se baja recién al navegar (el Admin arrastra el lector de xlsx y
// BoxScore/PlayerDetail el generador de placas para compartir).
import Home from "./pages/Home";
import Login from "./pages/Login";

const Standings = lazy(() => import("./pages/Standings"));
const Fixture = lazy(() => import("./pages/Fixture"));
const Playoffs = lazy(() => import("./pages/Playoffs"));
const Stats = lazy(() => import("./pages/Stats"));
const PlayerDetail = lazy(() => import("./pages/PlayerDetail"));
const BoxScore = lazy(() => import("./pages/BoxScore"));
const Admin = lazy(() => import("./pages/Admin"));

/** Mientras baja la página se ve la estructura de siempre, no una pantalla vacía. */
function PageFallback() {
    return (
        <Layout>
            <Spinner />
        </Layout>
    );
}

/** Solo accesible con sesión de admin; si no, va al login. */
function ProtectedRoute({ children }) {
    const { isAdmin } = useAuth();
    return isAdmin ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tabla" element={<Standings />} />
                    <Route path="/fixture" element={<Fixture />} />
                    <Route path="/playoffs" element={<Playoffs />} />
                    <Route path="/estadisticas" element={<Stats />} />
                    <Route path="/jugador/:playerId" element={<PlayerDetail />} />
                    <Route path="/partido/:matchId" element={<BoxScore />} />
                    <Route path="/login" element={<Login />} />

                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
}
