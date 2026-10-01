import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

// Inicializar solo una vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    ),
  });
}

const db = getFirestore();

// Errores de FCM que significan que el token ya no sirve y no va a volver a servir.
const DEAD_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { status: 405 });
  }

  // Solo un admin logueado puede notificar: validamos su token de Firebase Auth.
  // Si ADMIN_UIDS está definida (UIDs separados por coma), además tiene que estar en la lista.
  const idToken = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!idToken) {
    return new Response('No autorizado', { status: 401 });
  }

  let uid;
  try {
    ({ uid } = await admin.auth().verifyIdToken(idToken));
  } catch {
    return new Response('No autorizado', { status: 401 });
  }

  const allowed = (process.env.ADMIN_UIDS || '').split(',').map((s) => s.trim()).filter(Boolean);
  if (allowed.length && !allowed.includes(uid)) {
    return new Response('Prohibido', { status: 403 });
  }

  const { title, body } = await req.json();

  // Leer todos los tokens guardados
  const snapshot = await db.collection('fcm_tokens').get();
  const subs = snapshot.docs
    .map((d) => ({ ref: d.ref, token: d.data().token }))
    .filter((s) => s.token);

  if (subs.length === 0) {
    return new Response(JSON.stringify({ sent: 0, removed: 0 }), { status: 200 });
  }

  // Enviar a todos en lotes de 500 (límite de FCM)
  const chunks = [];
  for (let i = 0; i < subs.length; i += 500) {
    chunks.push(subs.slice(i, i + 500));
  }

  let totalSent = 0;
  let totalRemoved = 0;
  for (const chunk of chunks) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: chunk.map((s) => s.token),
      notification: { title, body },
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        },
        // Al tocarla abre la app. Los utm hacen que en Analytics esas visitas
        // aparezcan con fuente "notificacion" (Adquisición de tráfico).
        fcmOptions: {
          link: 'https://promocional.com.ar/?utm_source=notificacion&utm_medium=push',
        },
      },
    });
    totalSent += response.successCount;

    // Borrar los tokens que FCM da por muertos (app desinstalada, permiso
    // revocado, token rotado). Otros errores pueden ser pasajeros: se conservan.
    const batch = db.batch();
    let stale = 0;
    response.responses.forEach((r, i) => {
      if (!r.success && DEAD_TOKEN_CODES.has(r.error?.code)) {
        batch.delete(chunk[i].ref);
        stale++;
      }
    });
    if (stale > 0) {
      await batch.commit();
      totalRemoved += stale;
    }
  }

  return new Response(JSON.stringify({ sent: totalSent, removed: totalRemoved }), { status: 200 });
}

export const config = { path: '/api/send-notification' };