import { initializeApp } from "firebase/app";
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
} from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// Caché en IndexedDB: al volver a abrir la app (o a una página) los datos se
// muestran al instante desde el celular y Firestore solo baja lo que cambió.
// Sin esto, cada visita esperaba la conexión completa con el servidor, que en
// datos móviles tarda varios segundos. Si el navegador no tiene IndexedDB, el
// SDK vuelve solo a la caché en memoria.
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
export const auth = getAuth(app);
// Fuerza que la sesión persista en localStorage (clave para iOS PWA)
setPersistence(auth, browserLocalPersistence);
export const messaging = getMessaging(app);