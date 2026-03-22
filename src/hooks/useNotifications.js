import { useEffect, useState } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '../services/messaging';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export function useNotifications() {
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    requestNotificationPermission().then(async (fcmToken) => {
      if (!fcmToken) return;
      setToken(fcmToken);
      // Guardamos el token en Firestore usando el token como ID (evita duplicados)
      await setDoc(doc(db, 'fcm_tokens', fcmToken), {
        token: fcmToken,
        createdAt: new Date().toISOString(),
      });
    });

    const unsubscribe = onForegroundMessage((payload) => {
      setNotification(payload.notification);
    });

    return unsubscribe;
  }, []);

  return { token, notification };
}