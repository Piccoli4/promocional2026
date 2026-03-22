importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD_oKYzPrTTA2wiFdPsOoZo-2AAk3Pg9eo",
  authDomain: "promocional-2026.firebaseapp.com",
  projectId: "promocional-2026",
  storageBucket: "promocional-2026.firebasestorage.app",
  messagingSenderId: "265778996996",
  appId: "1:265778996996:web:fb0ccc31fac280cd6b9251",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;
  self.registration.showNotification(title, {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
  });
});