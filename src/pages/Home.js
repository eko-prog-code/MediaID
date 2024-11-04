import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import NewsList from '../components/NewsList';
import './Home.css';

function Home() {
    const [news, setNews] = useState([]);
    const [filteredNews, setFilteredNews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const categoryContainerRef = useRef(null);

    useEffect(() => {
        const fetchNews = async () => {
            const startTime = Date.now();

            try {
                const response = await axios.get('https://media-id-default-rtdb.firebaseio.com/News.json');
                if (response.data) {
                    const newsArray = Object.keys(response.data).map(key => ({
                        id: key,
                        ...response.data[key],
                    }));
                    
                    const sortedNews = newsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setNews(sortedNews);

                    const uniqueCategories = [...new Set(sortedNews.map(item => item.category))];
                    setCategories(uniqueCategories);

                    setFilteredNews(sortedNews);
                }

                const elapsedTime = Date.now() - startTime;
                const minimumLoadingTime = 4000;
                const remainingTime = Math.max(minimumLoadingTime - elapsedTime, 0);

                setTimeout(() => {
                    setIsLoading(false);
                }, remainingTime);

            } catch (error) {
                console.error("Error fetching news: ", error);
                setIsLoading(false);
            }
        };

        fetchNews();
    }, []);

    useEffect(() => {
        const filtered = news.filter((item) => {
            const matchesTitle = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
            return matchesTitle && matchesCategory;
        });
        setFilteredNews(filtered);
    }, [searchTerm, selectedCategory, news]);

    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
    };

    const scrollLeft = () => {
        categoryContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    };

    const scrollRight = () => {
        categoryContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    };

    if (isLoading) {
        return (
            <div className="loading-container">
                <img
                    src="https://firebasestorage.googleapis.com/v0/b/media-id.appspot.com/o/media-logo.png?alt=media&token=e94d5dc6-77e3-47cb-b98a-4db024d73335"
                    alt="Loading"
                    className="loading-image"
                />
                <p>Loading... Media ID </p>
                <p>(Artificial Intelligence News Indonesia)</p>
            </div>
        );
    }

    return (
        <div className="home">
            <h1>Berita Terkini</h1>

            <input
                type="text"
                placeholder="Cari berita..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            <div className="unique-category-wrapper">
                <button className="unique-scroll-button left" onClick={scrollLeft}>&#10094;</button>
                <div className="unique-category-container" ref={categoryContainerRef}>
                    {categories.map((category, index) => (
                        <div 
                            key={index} 
                            className={`unique-category-card ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            <h3>{category}</h3>
                        </div>
                    ))}
                </div>
                <button className="unique-scroll-button right" onClick={scrollRight}>&#10095;</button>
            </div>

            <NewsList news={filteredNews} />
        </div>
    );
}

export default Home;
