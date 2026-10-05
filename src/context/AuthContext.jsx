import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../services/firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Escucha en tiempo real si hay un usuario logueado o no
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        // Limpia el listener cuando el componente se desmonta
        return () => unsubscribe();
    }, []);

    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        return signOut(auth);
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAdmin: !!user, // true si hay usuario logueado
    };

    // No se espera a saber si hay sesión: el público no la necesita y la app
    // arranca antes. Las rutas de admin miran `loading` (ver ProtectedRoute).
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
    }
    return context;
}