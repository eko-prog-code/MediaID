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
import { getDatabase, ref, push, onValue } from "firebase/database";  // Import Firebase Database methods

import MedicTechImage from './assets/MedicTech RME.png';
import SinarRobusta from './assets/Sinar Robusta (1).png';
import EbookStore from './assets/Ebook Store.png';
import SellYourSongsImage from './assets/Sell your songs.png';

function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);  // Notifications state
  const [unreadCount, setUnreadCount] = useState(0);  // Unread notification count
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);  // Popup state

  const cardContainerRef = useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('https://media-id-default-rtdb.firebaseio.com/News.json');
        const newsArray = response.data;
        setNews(newsArray);
        setFilteredNews(newsArray);
      } catch (error) {
        console.error("Error fetching news: ", error);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const scrollLeft = () => {
    cardContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    cardContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  // Firebase notification fetch & listener
  useEffect(() => {
    const db = getDatabase();
    const notifRef = ref(db, 'SaveNotif');  // Reference to notifications in the database

    // Listen to changes in the Firebase notifications data
    onValue(notifRef, (snapshot) => {
      const firebaseNotifications = snapshot.val();
      if (firebaseNotifications) {
        const notificationsArray = Object.values(firebaseNotifications);
        setNotifications(notificationsArray);

        // Calculate unread count (notifications that are not read)
        const unreadNotifications = notificationsArray.filter(notification => !notification.read);
        setUnreadCount(unreadNotifications.length);
      }
    }, (error) => {
      console.error("Error fetching notifications: ", error);
    });
  }, []);

  // Request notification permission and listen for incoming FCM messages
  useEffect(() => {
    requestForToken();

    const unsubscribeMessageListener = onMessageListener()
      .then(payload => {
        console.log('Message received: ', payload);

        const newNotification = {
          title: payload.notification.title,
          body: payload.notification.body,
          date: new Date().toLocaleString(),
          read: false,  // Initially mark as unread
        };

        // Save the new notification locally and in Firebase
        const db = getDatabase();
        const notifRef = ref(db, 'SaveNotif');  // Reference in the database
        push(notifRef, newNotification)  // Push to Firebase
          .then(() => {
            console.log('Notification saved to Firebase');
          })
          .catch(error => {
            console.error("Error saving notification to Firebase: ", error);
          });

      })
      .catch(err => console.log('Failed to get message: ', err));

    return () => unsubscribeMessageListener;
  }, []);

  // Toggle the notification popup and mark notifications as read
  const toggleNotificationPopup = () => {
    setShowNotificationPopup(!showNotificationPopup);

    if (!showNotificationPopup) {
      // Mark notifications as read and update in Firebase
      const db = getDatabase();
      const notifRef = ref(db, 'SaveNotif');
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        read: true,  // Mark as read
      }));

      // Update Firebase with read notifications
      updatedNotifications.forEach(notification => {
        const notifKey = notification.key;  // Assuming notification has a unique key
        if (notifKey) {
          const specificNotifRef = ref(db, `SaveNotif/${notifKey}`);
          specificNotifRef.update({ read: true }).catch(error => {
            console.error("Error updating notification in Firebase: ", error);
          });
        }
      });

      // Reset unread count locally
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
            <MovingCard 
              imageUrl={MedicTechImage} 
              redirectUrl="https://play.google.com/store/apps/details?id=com.medictech&hl=id&pli=1" 
            />
            <MovingCard 
              imageUrl={SinarRobusta} 
              redirectUrl="https://cek-harga-kopi.vercel.app/" 
            />
            <MovingCard 
              imageUrl={EbookStore} 
              redirectUrl="https://ebookstore-id.vercel.app/" 
            />
            <MovingCard 
              imageUrl={SellYourSongsImage} 
              redirectUrl="https://sell-your-songs.vercel.app/" 
            />
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
          {unreadCount > 0 && (
            <span className="notification-count">{unreadCount}</span>  // Show count of unread notifications
          )}
        </div>

        {/* Notification popup */}
        {showNotificationPopup && (
          <div className="notification-popup">
            <h2>Notifications</h2>
            <ul>
              {notifications.length === 0 ? (
                <li>No notifications</li>
              ) : (
                notifications.map((notification, index) => (
                  <li key={index} className={notification.read ? 'read' : 'unread'}>
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
