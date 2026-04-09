import { useState, useEffect, useCallback } from 'react';
import '../../components/css/SearchBar.css';

function SearchBar({ onSearch, placeholder = "Search products..." }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Debounce search to avoid too many updates
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim()) {
                onSearch(searchTerm);
            } else {
                onSearch('');
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Fetch suggestions based on search term
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchTerm.length > 1) {
                setIsLoading(true);
                try {
                    // You can replace this with an API call to get real suggestions
                    // For now using mock data
                    const mockSuggestions = [
                        'Vintage Jeans',
                        'Denim Jacket',
                        'Nike Shoes',
                        'Leather Bag',
                        'Cotton Shirt',
                        'Summer Dress',
                        'Winter Coat',
                        'Sneakers'
                    ].filter(item => 
                        item.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                    
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 100));
                    setSuggestions(mockSuggestions.slice(0, 5));
                } catch (error) {
                    console.error('Error fetching suggestions:', error);
                    setSuggestions([]);
                } finally {
                    setIsLoading(false);
                }
            } else {
                setSuggestions([]);
            }
        };

        fetchSuggestions();
    }, [searchTerm]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearch(searchTerm);
            setShowSuggestions(false);
        }
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        onSearch(suggestion);
        setShowSuggestions(false);
    };

    const handleClear = () => {
        setSearchTerm('');
        onSearch('');
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
                {searchTerm && (
                    <button
                        type="button"
                        className="search-clear"
                        onClick={handleClear}
                        aria-label="Clear search"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                )}
                <button type="submit" className="search-button">
                    <i className="fas fa-search"></i>
                </button>
            </form>

            {showSuggestions && (suggestions.length > 0 || isLoading) && (
                <div className="search-suggestions">
                    {isLoading ? (
                        <div className="suggestion-loading">
                            <i className="fas fa-spinner fa-spin"></i>
                            <span>Loading suggestions...</span>
                        </div>
                    ) : (
                        suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="suggestion-item"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <i className="fas fa-search"></i>
                                <span>{suggestion}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default SearchBar;