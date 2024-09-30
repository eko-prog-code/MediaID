// src/components/MovingCard.js
import React from 'react';
import './MovingCard.css';

const MovingCard = ({ imageUrl, redirectUrl }) => {
  const handleClick = () => {
    window.location.href = redirectUrl;
  };

  return (
    <div className="moving-card" onClick={handleClick}>
      <img src={imageUrl} alt="Card" className="moving-image" />
      <div className="overlay">
        <p className="overlay-text">Click to Explore</p>
      </div>
    </div>
  );
};

export default MovingCard;
