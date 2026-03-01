import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/UyP.png";

export default function Login() {
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Si ya está logueado, redirige directo al admin
    if (isAdmin) {
        navigate("/admin");
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await login(email, password);
            navigate("/admin");
        } catch (err) {
            console.error(err);
            setError("Email o contraseña incorrectos.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4"
            style={{ backgroundColor: "#0a0a2e" }}
        >
            <div
                className="w-full max-w-md rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6"
                style={{ backgroundColor: "#000055" }}
            >
                {/* Logo */}
                <img src={logo} alt="UyP Logo" className="h-24 w-24 object-contain" />

                {/* Título */}
                <div className="text-center">
                    <h1 className="text-2xl font-black text-white uppercase tracking-wide">
                        Panel Administrador
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#ffffff88" }}>
                        Unión y Progreso — Torneo Promocional 2026
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-300 uppercase tracking-wider">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@uyp.com"
                            className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none focus:ring-2 transition-all"
                            style={{
                                backgroundColor: "#0a0a2e",
                                border: "1px solid #ffffff22",
                                focusRingColor: "#A90000",
                            }}
                        />
                    </div>

                    {/* Contraseña */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-300 uppercase tracking-wider">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 outline-none focus:ring-2 transition-all"
                            style={{
                                backgroundColor: "#0a0a2e",
                                border: "1px solid #ffffff22",
                            }}
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <div
                            className="text-sm text-center py-2 px-4 rounded-lg"
                            style={{ backgroundColor: "#A9000033", color: "#ff6b6b" }}
                        >
                            {error}
                        </div>
                    )}

                    {/* Botón */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 rounded-lg text-white font-bold uppercase tracking-wider transition-all duration-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: "#A90000" }}
                        onMouseEnter={e => { if (!loading) e.target.style.backgroundColor = "#8a0000" }}
                        onMouseLeave={e => { if (!loading) e.target.style.backgroundColor = "#A90000" }}
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}