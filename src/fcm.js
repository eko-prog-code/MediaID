import { messaging } from './firebase'; // Pastikan import dari file firebase.js yang sudah diinisialisasi
import { getToken, onMessage } from 'firebase/messaging';

export const requestForToken = async () => {
  let currentToken = '';

  try {
    currentToken = await getToken(messaging, { vapidKey: 'BEYObqCVOR2XHodNbLpXnbWytFmh5VYY-4SlaFyI_I3ZXXr-6fnQwxfh70U4cO7AOVFOkwD638pbBjHooxibsiA' });
    if (currentToken) {
      console.log('current token for client: ', currentToken);
      // Save this token to your server, or use it to send notifications to this client
    } else {
      console.log('No registration token available. Request permission to generate one.');
    }
  } catch (err) {
    console.log('An error occurred while retrieving token. ', err);
  }

  return currentToken;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      resolve(payload);
    });
  });