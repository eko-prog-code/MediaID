import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = ({ setFilteredNews, news }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false); // State to manage the visibility of the menu

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen); // Toggle the menu state
    };

    return (
        <header className="header">
            <div className="header-left">
                <Link to="/">
                    <img
                        src="https://firebasestorage.googleapis.com/v0/b/media-id.appspot.com/o/media-logo.png?alt=media&token=e94d5dc6-77e3-47cb-b98a-4db024d73335"
                        style={{ width: '60px', height: '60px' }}
                        alt="Logo"
                        className="logo"
                    />
                </Link>
                <h3 style={{ marginLeft: '10px', color: '#fff' }}>Media ID</h3>
            </div>
            <div className="header-right">
                <div className="toggle-button" onClick={toggleMenu} style={{ cursor: 'pointer' }}>
                    {isMenuOpen ? '🔼' : '🔽'} {/* Arrow icons */}
                </div>
                {isMenuOpen && ( // Conditional rendering of the links
                    <div className="menu-links">
                        <Link to="/login" className="header-link">Login</Link>
                        <Link to="/register" className="header-link">Register</Link>
                        <Link to="/" className="header-link">Beranda</Link>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;
