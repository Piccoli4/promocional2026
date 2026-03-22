import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from './firebase';

const VAPID_KEY = 'BNKTB-lFXnKkkTkeY1PlmeJ09OptowtxuVZDnw3-VRif_lvYWFLI3yy4BezLfAlqhccZZxlRhxrJG5rboJL7Msk';

export async function requestNotificationPermission() {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Permiso de notificaciones denegado');
      return null;
    }

    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error al obtener permiso de notificaciones:', error);
    return null;
  }
}

export function onForegroundMessage(callback) {
  return onMessage(messaging, callback);
}