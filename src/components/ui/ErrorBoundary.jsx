import { Component } from "react";

/**
 * Evita la pantalla en blanco si algo falla en tiempo de ejecución.
 * En desarrollo muestra el detalle; en producción, un mensaje y recarga.
 */
export default class ErrorBoundary extends Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("Error no controlado:", error, info?.componentStack);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;

        return (
            <div className="flex min-h-screen items-center justify-center p-6">
                <div className="nm-lg nm-edge flex max-w-lg flex-col items-center gap-4 p-8 text-center">
                    <span className="text-4xl">🏀</span>
                    <h1 className="display text-3xl" style={{ color: "var(--text-1)" }}>
                        Algo salió mal
                    </h1>
                    <p className="text-sm" style={{ color: "var(--text-2)" }}>
                        No pudimos mostrar esta pantalla. Probá recargar la app.
                    </p>

                    {import.meta.env.DEV && (
                        <pre
                            className="nm-in-sm max-h-64 w-full overflow-auto p-3 text-left text-xs"
                            style={{ color: "var(--danger)", whiteSpace: "pre-wrap" }}
                        >
                            {error.stack || String(error)}
                        </pre>
                    )}

                    <button
                        onClick={() => window.location.reload()}
                        className="nm-btn nm-btn-accent px-6 py-3 text-xs"
                    >
                        Recargar
                    </button>
                </div>
            </div>
        );
    }
}
