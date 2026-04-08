import { useState, useEffect } from 'react';
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
        { label: 'Under 250', min: 0, max: 250 },
        { label: '250-500', min: 250, max: 500 },
        { label: '500-1000', min: 500, max: 1000 },
        { label: 'Over 1000', min: 1000, max: 10000 }
    ];

    // Close filters when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isExpanded && window.innerWidth <= 768) {
                const sidebar = document.querySelector('.filters-sidebar');
                const toggleBtn = document.querySelector('.mobile-toggle');
                
                if (sidebar && !sidebar.contains(event.target) && 
                    toggleBtn && !toggleBtn.contains(event.target)) {
                    setIsExpanded(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    // Prevent body scroll when filters are open on mobile
    useEffect(() => {
        if (isExpanded && window.innerWidth <= 768) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        return () => {
            document.body.style.overflow = '';
        };
    }, [isExpanded]);

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

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.category) count++;
        if (filters.size) count++;
        if (filters.condition) count++;
        if (filters.brand) count++;
        if (filters.minPrice || filters.maxPrice) count++;
        if (filters.rating) count++;
        return count;
    };

    return (
        <>
            {/* Overlay for mobile */}
            <div 
                className={`filters-overlay ${isExpanded ? 'active' : ''}`} 
                onClick={() => setIsExpanded(false)}
            />
            
            <div className={`filters-sidebar ${isExpanded ? 'expanded' : ''}`}>
                <div className="filters-header">
                    <h2>
                        Filters 
                        {hasActiveFilters() && (
                            <span style={{ 
                                fontSize: '0.6rem', 
                                marginLeft: '0.35rem',
                                color: '#CEABB1',
                                fontWeight: 'normal'
                            }}>
                                ({getActiveFilterCount()})
                            </span>
                        )}
                    </h2>
                    <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                        {hasActiveFilters() && (
                            <button onClick={onClearFilters} className="clear-filters">
                                Clear
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
                </div>

                <div className="filters-content">
                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div className="filter-section">
                            <h3>Category</h3>
                            <select
                                value={filters.category || ''}
                                onChange={(e) => {
                                    onFilterChange({ category: e.target.value });
                                    if (window.innerWidth <= 768) {
                                        setIsExpanded(false);
                                    }
                                }}
                            >
                                <option value="">All categories</option>
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
                                onChange={(e) => {
                                    onFilterChange({ size: e.target.value });
                                    if (window.innerWidth <= 768) {
                                        setIsExpanded(false);
                                    }
                                }}
                            >
                                <option value="">All sizes</option>
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
                                onChange={(e) => {
                                    onFilterChange({ condition: e.target.value });
                                    if (window.innerWidth <= 768) {
                                        setIsExpanded(false);
                                    }
                                }}
                            >
                                <option value="">All conditions</option>
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
                                onChange={(e) => {
                                    onFilterChange({ brand: e.target.value });
                                    if (window.innerWidth <= 768) {
                                        setIsExpanded(false);
                                    }
                                }}
                            >
                                <option value="">All brands</option>
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
                        <h3>Price (KES)</h3>
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
                        <h3>Rating</h3>
                        <select
                            value={filters.rating || ''}
                            onChange={(e) => {
                                onFilterChange({ rating: e.target.value });
                                if (window.innerWidth <= 768) {
                                    setIsExpanded(false);
                                }
                            }}
                        >
                            <option value="">Any</option>
                            <option value="4">4★+</option>
                            <option value="3">3★+</option>
                            <option value="2">2★+</option>
                            <option value="1">1★+</option>
                        </select>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Filters;