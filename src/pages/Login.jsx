import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CourtBackdrop from "../components/ui/CourtBackdrop";
import Basketball3D from "../components/ui/Basketball3D";

export default function Login() {
    const { login, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isAdmin) navigate("/admin", { replace: true });
    }, [isAdmin, navigate]);

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
        <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
            <CourtBackdrop />

            <div className="nm-lg nm-edge a-rise relative z-10 flex w-full max-w-md flex-col items-center gap-6 p-8">
                <Basketball3D size={96} />

                <div className="flex flex-col items-center gap-1 text-center">
                    <h1 className="display text-3xl" style={{ color: "var(--text-1)" }}>
                        Panel de Administración
                    </h1>
                    <p
                        className="cond text-[0.68rem] font-bold uppercase tracking-[0.18em]"
                        style={{ color: "var(--red)" }}
                    >
                        Torneo Oficial Promocional 2026
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
                    <label className="flex flex-col gap-1.5">
                        <span className="eyebrow">Email</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="admin@uyp.com"
                            className="nm-input w-full px-4 py-3 text-base"
                        />
                    </label>

                    <label className="flex flex-col gap-1.5">
                        <span className="eyebrow">Contraseña</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="••••••••"
                            className="nm-input w-full px-4 py-3 text-base"
                        />
                    </label>

                    {error && (
                        <p
                            className="nm-in-sm cond px-4 py-2.5 text-center text-sm font-semibold"
                            style={{ color: "var(--danger)" }}
                        >
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="nm-btn nm-btn-accent mt-1 w-full py-3.5 text-sm"
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>
            </div>
        </div>
    );
}
