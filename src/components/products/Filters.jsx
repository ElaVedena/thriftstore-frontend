import { useState } from 'react';
import '../../components/css/Filters.css';

function Filters({ filters, onFilterChange, onClearFilters, products }) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Get unique values from products
    const categories = products && products.length > 0 
        ? [...new Set(products.map(p => p?.category).filter(Boolean))]
        : [];
    
    const sizes = products && products.length > 0 
        ? [...new Set(products.map(p => p?.size).filter(Boolean))]
        : [];
    
    const conditions = products && products.length > 0 
        ? [...new Set(products.map(p => p?.condition).filter(Boolean))]
        : [];
    
    const brands = products && products.length > 0 
        ? [...new Set(products.map(p => p?.brand).filter(Boolean))]
        : [];

    // Price range presets
    const priceRanges = [
        { label: 'Under KSh 250', min: 0, max: 250 },
        { label: 'KSh 250 - 500', min: 250, max: 500 },
        { label: 'KSh 500 - 1000', min: 500, max: 1000 },
        { label: 'Over KSh 1000', min: 1000, max: 10000 }
    ];

    const handlePriceRangeClick = (min, max) => {
        onFilterChange({ minPrice: min, maxPrice: max });
    };

    const capitalize = (str) => {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const hasActiveFilters = () => {
        return filters.category || filters.size || filters.condition || 
               filters.brand || filters.minPrice || filters.maxPrice || filters.rating;
    };

    return (
        <div className={`filters-sidebar ${isExpanded ? 'expanded' : ''}`}>
            <div className="filters-header">
                <h2>Filters</h2>
                {hasActiveFilters() && (
                    <button onClick={onClearFilters} className="clear-filters">
                        Clear All
                    </button>
                )}
                <button 
                    className="mobile-toggle" 
                    onClick={() => setIsExpanded(!isExpanded)}
                    aria-label="Toggle filters"
                >
                    <i className={`fas fa-${isExpanded ? 'times' : 'sliders-h'}`}></i>
                </button>
            </div>

            <div className="filters-content">
                {/* Category Filter */}
                {categories.length > 0 && (
                    <div className="filter-section">
                        <h3>Category</h3>
                        <select
                            value={filters.category || ''}
                            onChange={(e) => onFilterChange({ category: e.target.value })}
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {capitalize(cat)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Size Filter */}
                {sizes.length > 0 && (
                    <div className="filter-section">
                        <h3>Size</h3>
                        <select
                            value={filters.size || ''}
                            onChange={(e) => onFilterChange({ size: e.target.value })}
                        >
                            <option value="">All Sizes</option>
                            {sizes.map(size => (
                                <option key={size} value={size}>{size}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Condition Filter */}
                {conditions.length > 0 && (
                    <div className="filter-section">
                        <h3>Condition</h3>
                        <select
                            value={filters.condition || ''}
                            onChange={(e) => onFilterChange({ condition: e.target.value })}
                        >
                            <option value="">All Conditions</option>
                            {conditions.map(condition => (
                                <option key={condition} value={condition}>
                                    {capitalize(condition)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Brand Filter */}
                {brands.length > 0 && (
                    <div className="filter-section">
                        <h3>Brand</h3>
                        <select
                            value={filters.brand || ''}
                            onChange={(e) => onFilterChange({ brand: e.target.value })}
                        >
                            <option value="">All Brands</option>
                            {brands.map(brand => (
                                <option key={brand} value={brand}>
                                    {capitalize(brand)}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Price Range Filter */}
                <div className="filter-section">
                    <h3>Price Range (KES)</h3>
                    <div className="price-inputs">
                        <input
                            type="number"
                            placeholder="Min"
                            value={filters.minPrice || ''}
                            onChange={(e) => onFilterChange({ minPrice: e.target.value })}
                            min="0"
                            step="10"
                        />
                        <span>-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={filters.maxPrice || ''}
                            onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
                            min="0"
                            step="10"
                        />
                    </div>
                    
                    <div className="price-presets">
                        {priceRanges.map((range, index) => (
                            <button
                                key={index}
                                onClick={() => handlePriceRangeClick(range.min, range.max)}
                                className={`price-preset-btn ${filters.minPrice == range.min && filters.maxPrice == range.max ? 'active' : ''}`}
                                type="button"
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Rating Filter */}
                <div className="filter-section">
                    <h3>Minimum Rating</h3>
                    <select
                        value={filters.rating || ''}
                        onChange={(e) => onFilterChange({ rating: e.target.value })}
                    >
                        <option value="">Any Rating</option>
                        <option value="4">4★ & above</option>
                        <option value="3">3★ & above</option>
                        <option value="2">2★ & above</option>
                        <option value="1">1★ & above</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

export default Filters;