// src/App.js
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

import MedicTechImage from './assets/MedicTech RME.png';
import SinarRobusta from './assets/Sinar Robusta (1).png';
import EbookStore from './assets/Ebook Store.png';
import SellYourSongsImage from './assets/Sell your songs.png';

function App() {
  const [news, setNews] = useState([]);
  const [filteredNews, setFilteredNews] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [notification, setNotification] = useState({ title: '', body: '' });

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

  useEffect(() => {
    requestForToken();

    const unsubscribeMessageListener = onMessageListener()
      .then(payload => {
        console.log('Message received: ', payload);
        setNotification({
          title: payload.notification.title,
          body: payload.notification.body,
        });
      })
      .catch(err => console.log('failed: ', err));

    return () => unsubscribeMessageListener;
  }, []);

  // Function to handle notification subscription manually (when clicking the bell)
  const handleNotificationSubscription = async () => {
    try {
      await requestForToken();
      alert('You have subscribed to notifications!');
    } catch (error) {
      console.error("Failed to subscribe to notifications: ", error);
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

        <div className="notification-bell" onClick={handleNotificationSubscription}>
          🔔
        </div>

        {/* Display Notification Popup */}
        {notification.title && (
          <div className="notification-popup">
            <h2>{notification.title}</h2>
            <p>{notification.body}</p>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
