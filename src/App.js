import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './components/Login';
import Register from './components/Register';
import Read from './pages/Read';
import MovingCard from './components/MovingCard';
import './App.css';
import { requestForToken, onMessageListener } from './firebase';
import { getDatabase, ref, push, onValue, update } from 'firebase/database';

import MedicTechImage from './assets/MedicTech RME.png';
import SinarRobusta from './assets/Sinar Robusta (1).png';
import EbookStore from './assets/Ebook Store.png';
import SellYourSongsImage from './assets/Sell your songs.png';

function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  const cardContainerRef = useRef(null);

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://media-id-default-rtdb.firebaseio.com/News.json');
        const newsArray = response.data;
        setNews(newsArray);
        setFilteredNews(newsArray);
      } catch (error) {
        console.error('Error fetching news: ', error);
      }
    };
    fetchNews();
  }, []);

  // Auth listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Scroll functionality for cards
  const scrollLeft = () => {
    cardContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    cardContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Fetch notifications from Firebase for the current user, or show placeholder if user is not logged in
  useEffect(() => {
    if (currentUser) {
      const db = getDatabase();
      const userId = currentUser.uid;
      const notifRef = ref(db, `users/${userId}/notifications`);

      onValue(
        notifRef,
        (snapshot) => {
          const firebaseNotifications = snapshot.val();
          if (firebaseNotifications) {
            const notificationsArray = Object.keys(firebaseNotifications).map((key) => ({
              id: key,
              ...firebaseNotifications[key],
            }));
            setNotifications(notificationsArray);

            const unreadNotifications = notificationsArray.filter((notification) => !notification.read);
            setUnreadCount(unreadNotifications.length);
          }
        },
        (error) => {
          console.error('Error fetching notifications: ', error);
        }
      );
    } else {
      // Placeholder notification for users not logged in
      const placeholderNotification = {
        id: 'placeholder',
        title: 'Welcome!',
        body: 'Login to view your notifications.',
        date: new Date().toLocaleString(),
        read: false,
      };

      setNotifications([placeholderNotification]);
      setUnreadCount(1);
    }
  }, [currentUser]);

  // Request notification permission and listen for FCM messages
  useEffect(() => {
    requestForToken();

    const unsubscribeMessageListener = onMessageListener()
      .then((payload) => {
        console.log('Message received: ', payload);

        const newNotification = {
          title: payload.notification.title,
          body: payload.notification.body,
          date: new Date().toLocaleString(),
          read: false,
        };

        if (currentUser) {
          const db = getDatabase();
          const userId = currentUser.uid;
          const notifRef = ref(db, `users/${userId}/notifications`);
          push(notifRef, newNotification)
            .then(() => {
              console.log('Notification saved to Firebase');
            })
            .catch((error) => {
              console.error('Error saving notification to Firebase: ', error);
            });
        }
      })
      .catch((err) => console.log('Failed to get message: ', err));

    return () => unsubscribeMessageListener;
  }, [currentUser]);

  // Toggle notification popup and mark notifications as read
  const toggleNotificationPopup = () => {
    setShowNotificationPopup((prev) => !prev);

    // Mark notifications as read if the popup was closed and is now opening
    if (!showNotificationPopup && currentUser) {
      const db = getDatabase();
      const userId = currentUser.uid;

      notifications.forEach((notification) => {
        if (!notification.read) {
          const specificNotifRef = ref(db, `users/${userId}/notifications/${notification.id}`);

          update(specificNotifRef, { read: true })
            .then(() => console.log(`Notification ${notification.id} marked as read`))
            .catch((error) => console.error('Error updating notification:', error));
        }
      });

      setUnreadCount(0);
    }
  };

  return (
    <Router>
      <div className="App">
        <Header setFilteredNews={setFilteredNews} news={news} />
        <div className="moving-card-container-wrapper">
          <button className="scroll-arrow left-arrow" onClick={scrollLeft}>
            &#10094;
          </button>
          <div className="moving-card-container" ref={cardContainerRef}>
            <MovingCard imageUrl={MedicTechImage} redirectUrl="https://play.google.com/store/apps/details?id=com.medictech&hl=id&pli=1" />
            <MovingCard imageUrl={SinarRobusta} redirectUrl="https://cek-harga-kopi.vercel.app/" />
            <MovingCard imageUrl={EbookStore} redirectUrl="https://ebookstore-id.vercel.app/" />
            <MovingCard imageUrl={SellYourSongsImage} redirectUrl="https://sell-your-songs.vercel.app/" />
          </div>
          <button className="scroll-arrow right-arrow" onClick={scrollRight}>
            &#10095;
          </button>
        </div>

        <Routes>
          <Route path="/" element={<Home news={news} filteredNews={filteredNews} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/read/:slug/:id" element={<Read currentUser={currentUser} />} />
        </Routes>

        {/* Notification bell with unread count */}
        <div className="notification-bell" onClick={toggleNotificationPopup}>
          🔔
          {unreadCount > 0 && <span className="notification-count">{unreadCount}</span>}
        </div>

        {/* Notification popup */}
        {showNotificationPopup && (
          <div className="notification-popup">
            <h2>Notifications</h2>
            <ul>
              {notifications.length === 0 ? (
                <li>No notifications</li>
              ) : (
                notifications.map((notification) => (
                  <li key={notification.id} className={notification.read ? 'read' : 'unread'}>
                    <strong>{notification.title}</strong>
                    <p>{notification.body}</p>
                    <span>{notification.date}</span>
                  </li>
                ))
              )}
            </ul>
            <button onClick={toggleNotificationPopup}>Close</button>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
