import { useState, useEffect } from 'react';
import '../../components/css/SearchBar.css';

function SearchBar({ onSearch, placeholder = "Search products..." }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Debounce search to avoid too many updates
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    useEffect(() => {
        if (searchTerm.length > 1) {
           
            setSuggestions([
                'Vintage Jeans',
                'Denim Jacket',
                'Nike Shoes',
                'Leather Bag'
            ].filter(item => 
                item.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        } else {
            setSuggestions([]);
        }
    }, [searchTerm]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchTerm);
        setShowSuggestions(false);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        onSearch(suggestion);
        setShowSuggestions(false);
    };

    return (
        <div className="search-bar-container">
            <form onSubmit={handleSubmit} className="search-bar">
                <input
                    type="text"
                    className="search-input"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <button type="submit" className="search-button">
                    <i className="fas fa-search"></i>
                </button>
            </form>

            {showSuggestions && suggestions.length > 0 && (
                <div className="search-suggestions">
                    {suggestions.map((suggestion, index) => (
                        <div
                            key={index}
                            className="suggestion-item"
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            <i className="fas fa-search"></i>
                            <span>{suggestion}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchBar;