// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';  // Import FCM messaging functions

const firebaseConfig = {
    apiKey: "AIzaSyA5CQL9a1ojhNnIRsG8SoSUphPmLezrsOQ",
    authDomain: "media-id.firebaseapp.com",
    projectId: "media-id",
    storageBucket: "media-id.appspot.com",
    messagingSenderId: "249949506408",
    appId: "1:249949506408:web:19a20d99b86b3ff0cba4dd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);
const messaging = getMessaging(app);  // Initialize FCM messaging

// Function to request permission and get FCM token
export const requestForToken = () => {
    return getToken(messaging, { vapidKey: "BEYObqCVOR2XHodNbLpXnbWytFmh5VYY-4SlaFyI_I3ZXXr-6fnQwxfh70U4cO7AOVFOkwD638pbBjHooxibsiA" })  // Replace with your VAPID key
      .then((currentToken) => {
        if (currentToken) {
          console.log('Current token for client: ', currentToken);
          // Here you can send the token to your server or save it to your database
        } else {
          console.log('No registration token available. Request permission to generate one.');
        }
      })
      .catch((err) => {
        console.log('An error occurred while retrieving token. ', err);
      });
};

// Listen to messages when the app is in the foreground
export const onMessageListener = () =>
    new Promise((resolve) => {
      onMessage(messaging, (payload) => {
        console.log('Message received. ', payload);
        resolve(payload);  // Resolve with the message payload
      });
    });

export { auth, database, storage, messaging };
