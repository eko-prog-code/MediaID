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
import { requestForToken, onMessageListener } from './firebase';  // Import FCM functions
import { getDatabase, ref, push } from "firebase/database";  // Import Firebase Database methods

import MedicTechImage from './assets/MedicTech RME.png';
import SinarRobusta from './assets/Sinar Robusta (1).png';
import EbookStore from './assets/Ebook Store.png';
import SellYourSongsImage from './assets/Sell your songs.png';

function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);  // To store notifications
  const [unreadCount, setUnreadCount] = useState(0);  // To store unread notification count
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);  // To show/hide notification popup

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

  // Request notification permission and listen for messages
  useEffect(() => {
    requestForToken();

    const unsubscribeMessageListener = onMessageListener()
      .then(payload => {
        console.log('Message received: ', payload);

        const newNotification = {
          title: payload.notification.title,
          body: payload.notification.body,
          date: new Date().toLocaleString(),
          read: false,  // Initially set as unread
        };

        // Save the new notification in the local state
        setNotifications(prevNotifications => [
          ...prevNotifications,
          newNotification
        ]);

        // Increase unread count
        setUnreadCount(prevCount => prevCount + 1);

        // Save the notification to Firebase Realtime Database
        const db = getDatabase();
        const notifRef = ref(db, 'SaveNotif');
        push(notifRef, newNotification);  // Push the new notification to Firebase

      })
      .catch(err => console.log('failed: ', err));

    return () => unsubscribeMessageListener;
  }, []);

  // Function to toggle notification popup
  const toggleNotificationPopup = () => {
    setShowNotificationPopup(!showNotificationPopup);

    // When the popup is opened, mark all notifications as read
    if (!showNotificationPopup) {
      setUnreadCount(0);  // Reset unread count
      setNotifications(prevNotifications =>
        prevNotifications.map(notification => ({
          ...notification,
          read: true,
        }))
      );
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
