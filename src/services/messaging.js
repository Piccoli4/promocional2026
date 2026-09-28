import { getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db, messaging } from './firebase';

const VAPID_KEY = 'BNKTB-lFXnKkkTkeY1PlmeJ09OptowtxuVZDnw3-VRif_lvYWFLI3yy4BezLfAlqhccZZxlRhxrJG5rboJL7Msk';

/**
 * Obtiene el token del dispositivo y lo guarda en "fcm_tokens", que es de
 * donde la función de Netlify saca a quién avisar. El ID del documento es
 * el propio token, así que volver a guardarlo no genera duplicados.
 */
async function registrarToken() {
  const token = await getToken(messaging, { vapidKey: VAPID_KEY });
  if (!token) return null;
  await setDoc(
    doc(db, 'fcm_tokens', token),
    { token, updatedAt: new Date().toISOString() },
    { merge: true }
  );
  return token;
}

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return null;
    return await registrarToken();
  } catch (error) {
    console.error('Error al activar las notificaciones:', error);
    return null;
  }
}

/**
 * Para quien ya dio permiso: FCM rota los tokens cada tanto, así que al abrir
 * la app se vuelve a guardar el vigente. También recupera a los que activaron
 * las alertas cuando el token todavía no se guardaba.
 */
export async function refreshNotificationToken() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    await registrarToken();
  } catch (error) {
    console.error('Error al actualizar el token de notificaciones:', error);
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}
