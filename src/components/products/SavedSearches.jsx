import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSavedSearches, deleteSavedSearch, buildSearchURL } from '../../utils/searchHelpers';
import '../../components/css/SavedSearches.css';

function SavedSearches() {
    const [savedSearches, setSavedSearches] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadSavedSearches();
    }, []);

    const loadSavedSearches = () => {
        setSavedSearches(getSavedSearches());
    };

    const handleUseSearch = (search) => {
        const url = buildSearchURL('/shop', search.params);
        navigate(url);
        setShowDropdown(false);
    };

    const handleDeleteSearch = (e, id) => {
        e.stopPropagation();
        deleteSavedSearch(id);
        loadSavedSearches();
    };

    if (savedSearches.length === 0) return null;

    return (
        <div className="saved-searches">
            <button
                className="saved-searches-toggle"
                onClick={() => setShowDropdown(!showDropdown)}
            >
                <i className="fas fa-bookmark"></i>
                <span>Saved Searches</span>
                <span className="count">{savedSearches.length}</span>
            </button>

            {showDropdown && (
                <div className="saved-searches-dropdown">
                    {savedSearches.map(search => (
                        <div
                            key={search.id}
                            className="saved-search-item"
                            onClick={() => handleUseSearch(search)}
                        >
                            <div className="search-info">
                                <span className="search-name">{search.name}</span>
                                <span className="search-date">
                                    {new Date(search.date).toLocaleDateString()}
                                </span>
                            </div>
                            <button
                                className="delete-search"
                                onClick={(e) => handleDeleteSearch(e, search.id)}
                                title="Delete saved search"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default SavedSearches;