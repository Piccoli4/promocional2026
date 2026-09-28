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
  const tokens = snapshot.docs.map((d) => d.data().token);

  if (tokens.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  // Enviar a todos en lotes de 500 (límite de FCM)
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 500) {
    chunks.push(tokens.slice(i, i + 500));
  }

  let totalSent = 0;
  for (const chunk of chunks) {
    const response = await admin.messaging().sendEachForMulticast({
      tokens: chunk,
      notification: { title, body },
      webpush: {
        notification: {
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
        },
      },
    });
    totalSent += response.successCount;
  }

  return new Response(JSON.stringify({ sent: totalSent }), { status: 200 });
}

export const config = { path: '/api/send-notification' };