import { useState } from 'react';
import '../../components/css/SortBar.css';

function SortBar({ sortBy, onSortChange, totalProducts, viewMode, onViewModeChange }) {
    const sortOptions = [
        { value: 'relevance', label: 'Default Sorting' },
        { value: 'price-low', label: 'Price: Low to High' },
        { value: 'price-high', label: 'Price: High to Low' },
        { value: 'rating', label: 'Top Rated' },
        { value: 'name', label: 'Name: A to Z' }
    ];

    const handleSortChange = (e) => {
        const newSortValue = e.target.value;
        if (onSortChange) {
            onSortChange(newSortValue);
        }
    };

    return (
        <div className="sort-bar">
            <div className="sort-bar-left">
                <span className="product-count">
                    <strong>{totalProducts}</strong> products found
                </span>
            </div>

            <div className="sort-bar-right">
                <div className="sort-selector">
                    <label htmlFor="sort">Sort by:</label>
                    <select
                        id="sort"
                        value={sortBy}
                        onChange={handleSortChange}
                        className="sort-select"
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="view-mode">
                    <button
                        className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => onViewModeChange && onViewModeChange('grid')}
                        title="Grid view"
                    >
                        <i className="fas fa-th"></i>
                    </button>
                    <button
                        className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => onViewModeChange && onViewModeChange('list')}
                        title="List view"
                    >
                        <i className="fas fa-list"></i>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SortBar;