import React from 'react';
import NewsCard from './NewsCard';
import './NewsList.css';

const NewsList = ({ news }) => {
    if (!news.length) return <p>No news available</p>;

    return (
        <div className="news-list">
            {news.map((item) => (
                <NewsCard 
                    key={item.id} 
                    id={item.id} 
                    title={item.title} 
                    summary={item.summary} 
                    image={item.image} 
                    date={item.date} 
                />
            ))}
        </div>
    );
};

export default NewsList;
