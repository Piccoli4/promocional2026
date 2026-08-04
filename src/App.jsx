import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Home from "./pages/Home";
import Standings from "./pages/Standings";
import Fixture from "./pages/Fixture";
import Playoffs from "./pages/Playoffs";
import Stats from "./pages/Stats";
import PlayerDetail from "./pages/PlayerDetail";
import BoxScore from "./pages/BoxScore";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

/** Solo accesible con sesión de admin; si no, va al login. */
function ProtectedRoute({ children }) {
    const { isAdmin } = useAuth();
    return isAdmin ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <BrowserRouter>
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
        </BrowserRouter>
    );
}
