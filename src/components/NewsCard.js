// src/components/NewsCard.js
import React from 'react';
import './NewsCard.css';
import { Link } from 'react-router-dom';

function NewsCard({ id, title, summary, image, date }) {
    const truncateSummary = (text, maxLength) => {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    const truncateTitle = (text, maxLength) => {
        return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    // Fungsi untuk membuat slug dari title
    const createSlug = (text) => {
        return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    };

    // Mengganti <br /> dengan elemen <br> yang bisa dirender
    const formatSummaryWithLineBreaks = (text) => {
        return { __html: text.replace(/<br\s*\/?>/gi, '<br />') };
    };

    return (
        <div className="news-card">
            <img src={image} alt={title} className="news-image" />
            <div className="news-content">
                <h3>{truncateTitle(title, 86)}</h3>
                <div className="divider"></div>
                {/* Render HTML dalam summary */}
                <p dangerouslySetInnerHTML={formatSummaryWithLineBreaks(truncateSummary(summary, 240))}></p>
                
                <div className="footer">
                    <p className="news-date">Published on: {new Date(date).toLocaleString()}</p>
                    <Link to={`/read/${createSlug(title)}/${id}`}>
                        <button className="read-button">Baca</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default NewsCard;
