importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyC-d82aNLkbU25yi2ERbN-4iRC5UA0FEWQ",
    authDomain: "tetra-42213.firebaseapp.com",
    projectId: "tetra-42213",
    storageBucket: "tetra-42213.firebasestorage.app",
    messagingSenderId: "190040403852",
    appId: "1:190040403852:web:8df86a9762a68ed39170a9",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/icon.png',
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
