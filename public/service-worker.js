// public/service-worker.js

importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging.js');

firebase.initializeApp({
    apiKey: "AIzaSyA5CQL9a1ojhNnIRsG8SoSUphPmLezrsOQ",
    authDomain: "media-id.firebaseapp.com",
    projectId: "media-id",
    storageBucket: "media-id.appspot.com",
    messagingSenderId: "249949506408",
    appId: "1:249949506408:web:19a20d99b86b3ff0cba4dd"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification.title;
  const options = {
    body: payload.notification.body,
    icon: payload.notification.icon,
  };

  self.registration.showNotification(title, options);
});