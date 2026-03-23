export const priceRanges = [
    { label: 'Under KSh 500', min: 0, max: 500 },
    { label: 'KSh 500 - KSh 1,000', min: 500, max: 1000 },
    { label: 'KSh 1,000 - KSh 2,500', min: 1000, max: 2500 },
    { label: 'KSh 2,500 - KSh 5,000', min: 2500, max: 5000 },
    { label: 'KSh 5,000 - KSh 10,000', min: 5000, max: 10000 },
    { label: 'Over KSh 10,000', min: 10000, max: Infinity }
];

// Size options
export const sizeOptions = {
    clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'],
    shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    accessories: ['One Size']
};

// Condition options
export const conditionOptions = [
    'New with tags',
    'New without tags',
    'Like New',
    'Very Good',
    'Good',
    'Fair'
];

// Sort options
export const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
    { value: 'rating_desc', label: 'Top Rated' },
    { value: 'popularity', label: 'Most Popular' }
];

// Category mapping
export const categoryMap = {
    'all': 'All Categories',
    'clothing': 'Clothing',
    'jackets': 'Jackets',
    'pants': 'Pants',
    'dresses': 'Dresses',
    'shoes': 'Shoes',
    'accessories': 'Accessories',
    'sweaters': 'Sweaters',
    'skirts': 'Skirts',
    't-shirts': 'T-Shirts',
    'vintage': 'Vintage',
    'designer': 'Designer'
};

// Brand list 
export const popularBrands = [
   'thrift', 'Levi\'s', 'Nike', 'Adidas', 'Zara', 'H&M',
    'Vintage', 'Ralph Lauren', 'Free People', 'Dr. Martens',
    'Anthropologie', 'London Fog', 'Wrangler', 'Starter'
];

// Color options
export const colorOptions = [
    { name: 'Black', value: 'black', hex: '#000000' },
    { name: 'White', value: 'white', hex: '#FFFFFF' },
    { name: 'Gray', value: 'gray', hex: '#808080' },
    { name: 'Red', value: 'red', hex: '#FF0000' },
    { name: 'Blue', value: 'blue', hex: '#0000FF' },
    { name: 'Green', value: 'green', hex: '#00FF00' },
    { name: 'Yellow', value: 'yellow', hex: '#FFFF00' },
    { name: 'Purple', value: 'purple', hex: '#800080' },
    { name: 'Pink', value: 'pink', hex: '#FFC0CB' },
    { name: 'Brown', value: 'brown', hex: '#A52A2A' },
    { name: 'Beige', value: 'beige', hex: '#F5F5DC' },
    { name: 'Orange', value: 'orange', hex: '#FFA500' }
];

// Era options
export const eraOptions = [
    '1920s', '1930s', '1940s', '1950s', '1960s',
    '1970s', '1980s', '1990s', '2000s', '2010s',
    'Modern'
];

// Material options
export const materialOptions = [
    'Cotton', 'Polyester', 'Wool', 'Leather', 'Denim',
    'Silk', 'Linen', 'Velvet', 'Suede', 'Acrylic',
    'Nylon', 'Rayon', 'Spandex', 'Cashmere', 'Fleece'
];

// Pattern options
export const patternOptions = [
    'Solid', 'Striped', 'Plaid', 'Floral', 'Animal Print',
    'Polka Dot', 'Geometric', 'Abstract', 'Graphic', 'Tie-Dye',
    'Checked', 'Houndstooth', 'Paisley', 'Camouflage'
];

// Helper functions
export const filterProducts = (products, filters) => {
    return products.filter(product => {
        // Search term
        if (filters.search && !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
            !product.description?.toLowerCase().includes(filters.search.toLowerCase())) {
            return false;
        }

        // Category
        if (filters.category && filters.category !== 'all' && product.category !== filters.category) {
            return false;
        }

        // Price range
        if (filters.priceMin && product.price < filters.priceMin) return false;
        if (filters.priceMax && product.price > filters.priceMax) return false;

        // Size
        if (filters.size && filters.size.length > 0 && !filters.size.includes(product.size)) {
            return false;
        }

        // Condition
        if (filters.condition && filters.condition.length > 0 && 
            !filters.condition.includes(product.condition)) {
            return false;
        }

        // Brand
        if (filters.brand && filters.brand.length > 0 && !filters.brand.includes(product.brand)) {
            return false;
        }

        // Color
        if (filters.color && filters.color.length > 0 && !filters.color.includes(product.color)) {
            return false;
        }

        // Era
        if (filters.era && filters.era.length > 0 && !filters.era.includes(product.era)) {
            return false;
        }

        // Material
        if (filters.material && filters.material.length > 0 && 
            !filters.material.includes(product.material)) {
            return false;
        }

        // Pattern
        if (filters.pattern && filters.pattern.length > 0 && 
            !filters.pattern.includes(product.pattern)) {
            return false;
        }

        // Rating
        if (filters.minRating && product.rating < filters.minRating) return false;

        // In stock only
        if (filters.inStockOnly && !product.inStock) return false;

        // On sale only
        if (filters.onSaleOnly && !product.originalPrice) return false;

        return true;
    });
};

export const sortProducts = (products, sortBy) => {
    const sorted = [...products];
    
    switch (sortBy) {
        case 'price_asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price_desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'newest':
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'rating_desc':
            return sorted.sort((a, b) => b.rating - a.rating);
        case 'popularity':
            return sorted.sort((a, b) => (b.sold || 0) - (a.sold || 0));
        case 'relevance':
        default:
            return sorted;
    }
};

export const saveSearch = (searchParams, name) => {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const newSearch = {
        id: Date.now(),
        name,
        params: searchParams,
        date: new Date().toISOString()
    };
    savedSearches.push(newSearch);
    localStorage.setItem('savedSearches', JSON.stringify(savedSearches));
    return newSearch;
};

export const getSavedSearches = () => {
    return JSON.parse(localStorage.getItem('savedSearches') || '[]');
};

export const deleteSavedSearch = (id) => {
    const savedSearches = JSON.parse(localStorage.getItem('savedSearches') || '[]');
    const filtered = savedSearches.filter(s => s.id !== id);
    localStorage.setItem('savedSearches', JSON.stringify(filtered));
};

export const getSearchParamsFromURL = (searchParams) => {
    const params = {};
    
    for (let [key, value] of searchParams.entries()) {
        if (value.includes(',')) {
            params[key] = value.split(',');
        } else {
            params[key] = value;
        }
    }
    
    return params;
};

export const buildSearchURL = (basePath, params) => {
    const url = new URL(basePath, window.location.origin);
    
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            if (value.length > 0) {
                url.searchParams.set(key, value.join(','));
            }
        } else if (value) {
            url.searchParams.set(key, value);
        }
    });
    
    return url.pathname + url.search;
};