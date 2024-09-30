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
    const [isLoading, setIsLoading] = useState(true); // State untuk loading
    const categoryContainerRef = useRef(null);

    useEffect(() => {
        // Fetch news and extract categories
        const fetchNews = async () => {
            const startTime = Date.now(); // Waktu mulai loading

            try {
                const response = await axios.get('https://media-id-default-rtdb.firebaseio.com/News.json');
                if (response.data) {
                    const newsArray = Object.keys(response.data).map(key => ({
                        id: key,
                        ...response.data[key],
                    }));
                    
                    // Sort news by date (newest first)
                    const sortedNews = newsArray.sort((a, b) => new Date(b.date) - new Date(a.date));
                    setNews(sortedNews);

                    // Extract unique categories from news
                    const uniqueCategories = [...new Set(sortedNews.map(item => item.category))];
                    setCategories(uniqueCategories);

                    // Initialize filtered news
                    setFilteredNews(sortedNews);
                }

                // Menghitung waktu berlalu
                const elapsedTime = Date.now() - startTime;
                const minimumLoadingTime = 4000; // 4 detik
                const remainingTime = Math.max(minimumLoadingTime - elapsedTime, 0);

                // Menunggu sisa waktu untuk memenuhi durasi minimal 4 detik
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

    // Filter news based on search term and selected category
    useEffect(() => {
        const filtered = news.filter((item) => {
            const matchesTitle = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
            return matchesTitle && matchesCategory;
        });
        setFilteredNews(filtered);
    }, [searchTerm, selectedCategory, news]);

    // Handle category click to filter news
    const handleCategoryClick = (categoryName) => {
        setSelectedCategory(categoryName);
    };

    // Scroll categories left
    const scrollLeft = () => {
        categoryContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    };

    // Scroll categories right
    const scrollRight = () => {
        categoryContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    };

    // Jika masih loading, tampilkan animasi loading
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

            {/* Filter by title */}
            <input
                type="text"
                placeholder="Cari berita..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
            />

            {/* Categories horizontal scroll */}
            <div className="category-wrapper">
                <button className="scroll-button left" onClick={scrollLeft}>&#10094;</button>
                <div className="category-container" ref={categoryContainerRef}>
                    {categories.map((category, index) => (
                        <div 
                            key={index} 
                            className={`category-card ${selectedCategory === category ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            <h3>{category}</h3>
                        </div>
                    ))}
                </div>
                <button className="scroll-button right" onClick={scrollRight}>&#10095;</button>
            </div>

            <NewsList news={filteredNews} />
        </div>
    );
}

export default Home;
