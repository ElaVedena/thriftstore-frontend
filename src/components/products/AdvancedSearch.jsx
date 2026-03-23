import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useDebounce from '../../hooks/useDebounce';
import {
    priceRanges,
    sizeOptions,
    conditionOptions,
    sortOptions,
    categoryMap,
    popularBrands,
    colorOptions,
    eraOptions,
    materialOptions,
    patternOptions,
    saveSearch
} from '../../utils/searchHelpers';
import '../../components/css/AdvancedSearch.css';

function AdvancedSearch({ onSearch, initialFilters = {} }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');
    const [filters, setFilters] = useState({
        category: initialFilters.category || 'all',
        priceMin: initialFilters.priceMin || '',
        priceMax: initialFilters.priceMax || '',
        size: initialFilters.size || [],
        condition: initialFilters.condition || [],
        brand: initialFilters.brand || [],
        color: initialFilters.color || [],
        era: initialFilters.era || [],
        material: initialFilters.material || [],
        pattern: initialFilters.pattern || [],
        minRating: initialFilters.minRating || '',
        inStockOnly: initialFilters.inStockOnly || false,
        onSaleOnly: initialFilters.onSaleOnly || false,
        sortBy: initialFilters.sortBy || 'relevance'
    });
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [activeFilterCount, setActiveFilterCount] = useState(0);
    const searchRef = useRef(null);
    const debouncedSearch = useDebounce(searchTerm, 500);

    // Calculate active filter count
    useEffect(() => {
        let count = 0;
        if (filters.category && filters.category !== 'all') count++;
        if (filters.priceMin || filters.priceMax) count++;
        if (filters.size.length > 0) count += filters.size.length;
        if (filters.condition.length > 0) count += filters.condition.length;
        if (filters.brand.length > 0) count += filters.brand.length;
        if (filters.color.length > 0) count += filters.color.length;
        if (filters.era.length > 0) count += filters.era.length;
        if (filters.material.length > 0) count += filters.material.length;
        if (filters.pattern.length > 0) count += filters.pattern.length;
        if (filters.minRating) count++;
        if (filters.inStockOnly) count++;
        if (filters.onSaleOnly) count++;
        
        setActiveFilterCount(count);
    }, [filters]);

    // Trigger search when debounced search term changes
    useEffect(() => {
        handleSearch();
    }, [debouncedSearch]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsExpanded(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = () => {
        const searchFilters = {
            ...filters,
            search: searchTerm
        };
        
        if (onSearch) {
            onSearch(searchFilters);
        }
        
        // Update URL with search params
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (filters.category && filters.category !== 'all') params.set('category', filters.category);
        if (filters.priceMin) params.set('min_price', filters.priceMin);
        if (filters.priceMax) params.set('max_price', filters.priceMax);
        if (filters.size.length > 0) params.set('size', filters.size.join(','));
        if (filters.condition.length > 0) params.set('condition', filters.condition.join(','));
        if (filters.brand.length > 0) params.set('brand', filters.brand.join(','));
        if (filters.color.length > 0) params.set('color', filters.color.join(','));
        if (filters.era.length > 0) params.set('era', filters.era.join(','));
        if (filters.material.length > 0) params.set('material', filters.material.join(','));
        if (filters.pattern.length > 0) params.set('pattern', filters.pattern.join(','));
        if (filters.minRating) params.set('rating', filters.minRating);
        if (filters.sortBy !== 'relevance') params.set('sort', filters.sortBy);
        
        navigate(`/shop?${params.toString()}`);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleMultiSelectChange = (key, value) => {
        setFilters(prev => {
            const current = [...prev[key]];
            const index = current.indexOf(value);
            
            if (index === -1) {
                current.push(value);
            } else {
                current.splice(index, 1);
            }
            
            return { ...prev, [key]: current };
        });
    };

    const clearFilters = () => {
        setFilters({
            category: 'all',
            priceMin: '',
            priceMax: '',
            size: [],
            condition: [],
            brand: [],
            color: [],
            era: [],
            material: [],
            pattern: [],
            minRating: '',
            inStockOnly: false,
            onSaleOnly: false,
            sortBy: 'relevance'
        });
        setSearchTerm('');
    };

    const handleSaveSearch = () => {
        if (!searchName.trim()) return;
        
        saveSearch({
            ...filters,
            search: searchTerm
        }, searchName);
        
        setShowSaveDialog(false);
        setSearchName('');
    };

    const quickFilters = [
        { label: 'Under KSh 500', action: () => handleFilterChange('priceMax', 500) },
        { label: 'KSh 500 - 1,000', action: () => {
            handleFilterChange('priceMin', 500);
            handleFilterChange('priceMax', 1000);
        }},
        { label: 'On Sale', action: () => handleFilterChange('onSaleOnly', !filters.onSaleOnly) },
        { label: 'New Arrivals', action: () => handleFilterChange('sortBy', 'newest') },
        { label: 'Top Rated', action: () => handleFilterChange('minRating', 4) }
    ];

    return (
        <div className="advanced-search" ref={searchRef}>
            {/* Search Bar */}
            <div className="search-bar-container">
                <div className="search-input-wrapper">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsExpanded(true)}
                    />
                    {searchTerm && (
                        <button
                            className="clear-search"
                            onClick={() => setSearchTerm('')}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                
                <button
                    className={`filter-toggle ${activeFilterCount > 0 ? 'active' : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <i className="fas fa-sliders-h"></i>
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="filter-count">{activeFilterCount}</span>
                    )}
                </button>
            </div>

            {/* Quick Filters */}
            <div className="quick-filters">
                {quickFilters.map((filter, index) => (
                    <button
                        key={index}
                        className="quick-filter-btn"
                        onClick={filter.action}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {/* Advanced Filters Panel */}
            {isExpanded && (
                <div className="filters-panel">
                    <div className="filters-header">
                        <h3>Filters</h3>
                        <button onClick={clearFilters} className="clear-filters-btn">
                            Clear All
                        </button>
                    </div>

                    <div className="filters-grid">
                        {/* Category */}
                        <div className="filter-group">
                            <label>Category</label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                {Object.entries(categoryMap).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Price Range */}
                        <div className="filter-group">
                            <label>Price Range (KSh)</label>
                            <div className="price-inputs">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.priceMin}
                                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                                />
                                <span>-</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.priceMax}
                                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                                />
                            </div>
                            <div className="price-presets">
                                {priceRanges.slice(0, 4).map((range, index) => (
                                    <button
                                        key={index}
                                        className="price-preset"
                                        onClick={() => {
                                            handleFilterChange('priceMin', range.min);
                                            handleFilterChange('priceMax', range.max === Infinity ? '' : range.max);
                                        }}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Size */}
                        <div className="filter-group">
                            <label>Size</label>
                            <div className="checkbox-group">
                                {sizeOptions.clothing.map(size => (
                                    <label key={size} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.size.includes(size)}
                                            onChange={() => handleMultiSelectChange('size', size)}
                                        />
                                        {size}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Condition */}
                        <div className="filter-group">
                            <label>Condition</label>
                            <div className="checkbox-group">
                                {conditionOptions.map(condition => (
                                    <label key={condition} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.condition.includes(condition)}
                                            onChange={() => handleMultiSelectChange('condition', condition)}
                                        />
                                        {condition}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Brand */}
                        <div className="filter-group">
                            <label>Brand</label>
                            <div className="checkbox-group">
                                {popularBrands.slice(0, 8).map(brand => (
                                    <label key={brand} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.brand.includes(brand)}
                                            onChange={() => handleMultiSelectChange('brand', brand)}
                                        />
                                        {brand}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Color */}
                        <div className="filter-group">
                            <label>Color</label>
                            <div className="color-grid">
                                {colorOptions.map(color => (
                                    <button
                                        key={color.value}
                                        className={`color-swatch ${filters.color.includes(color.value) ? 'selected' : ''}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                        onClick={() => handleMultiSelectChange('color', color.value)}
                                    >
                                        {filters.color.includes(color.value) && (
                                            <i className="fas fa-check"></i>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rating */}
                        <div className="filter-group">
                            <label>Minimum Rating</label>
                            <select
                                value={filters.minRating}
                                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                            >
                                <option value="">Any Rating</option>
                                <option value="4">4 ★ & above</option>
                                <option value="3">3 ★ & above</option>
                                <option value="2">2 ★ & above</option>
                                <option value="1">1 ★ & above</option>
                            </select>
                        </div>

                        {/* Additional Filters */}
                        <div className="filter-group">
                            <label>Additional</label>
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.inStockOnly}
                                        onChange={(e) => handleFilterChange('inStockOnly', e.target.checked)}
                                    />
                                    In Stock Only
                                </label>
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={filters.onSaleOnly}
                                        onChange={(e) => handleFilterChange('onSaleOnly', e.target.checked)}
                                    />
                                    On Sale Only
                                </label>
                            </div>
                        </div>

                        {/* Sort By */}
                        <div className="filter-group">
                            <label>Sort By</label>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            >
                                {sortOptions.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="filters-footer">
                        <button
                            className="save-search-btn"
                            onClick={() => setShowSaveDialog(true)}
                        >
                            <i className="fas fa-bookmark"></i>
                            Save This Search
                        </button>
                        <button
                            className="apply-filters-btn"
                            onClick={() => {
                                handleSearch();
                                setIsExpanded(false);
                            }}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}

            {/* Save Search Dialog */}
            {showSaveDialog && (
                <div className="save-search-dialog">
                    <div className="dialog-content">
                        <h4>Save Search</h4>
                        <input
                            type="text"
                            placeholder="Enter a name for this search"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            autoFocus
                        />
                        <div className="dialog-actions">
                            <button onClick={() => setShowSaveDialog(false)}>
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSearch}
                                disabled={!searchName.trim()}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdvancedSearch;