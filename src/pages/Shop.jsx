import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productService } from '../services/productService';
import { useNotification } from '../hooks/useNotification';
import AdvancedSearch from '../components/products/AdvancedSearch';
import SavedSearches from '../components/products/SavedSearches';
import SortBar from '../components/products/SortBar';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';
import Filters from '../components/products/Filters';
import { getSearchParamsFromURL, filterProducts, sortProducts } from '../utils/searchHelpers';
import '../components/css/Shop.css';

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allProducts, setAllProducts] = useState([]); 
  const [displayedProducts, setDisplayedProducts] = useState([]); 
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    size: '',
    condition: '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    brand: '',
    color: '',
    era: '',
    material: '',
    pattern: '',
    inStockOnly: false,
    onSaleOnly: false
  });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Mobile: 2 products per row = 4 products per page (2 rows)
  // Desktop: 4 products per row = 8 products per page (2 rows)
  // Use responsive products per page based on screen size
  const [productsPerPage, setProductsPerPage] = useState(8);
  
  const { showError } = useNotification();

  // Detect screen size and adjust products per page
  useEffect(() => {
    const updateProductsPerPage = () => {
      const width = window.innerWidth;
      if (width <= 768) {
        // Mobile: 2 columns x 2 rows = 4 products
        setProductsPerPage(4);
      } else if (width <= 1024) {
        // Tablet: 3 columns x 2 rows = 6 products
        setProductsPerPage(6);
      } else {
        // Desktop: 4 columns x 2 rows = 8 products
        setProductsPerPage(8);
      }
    };
    
    updateProductsPerPage();
    window.addEventListener('resize', updateProductsPerPage);
    return () => window.removeEventListener('resize', updateProductsPerPage);
  }, []);

  // Load filters from URL on initial mount
  useEffect(() => {
    const urlFilters = getSearchParamsFromURL(searchParams);
    
    console.log('🔍 URL Search Params:', Object.fromEntries(searchParams.entries()));
    console.log('📦 Parsed URL Filters:', urlFilters);
    
    // Map URL params to state
    const newFilters = { ...filters };
    
    if (urlFilters.category) {
      newFilters.category = urlFilters.category;
      console.log(' Loading category from URL:', urlFilters.category);
    }
    
    if (urlFilters.q) setSearchTerm(urlFilters.q);
    if (urlFilters.min_price) newFilters.minPrice = urlFilters.min_price;
    if (urlFilters.max_price) newFilters.maxPrice = urlFilters.max_price;
    if (urlFilters.size) newFilters.size = Array.isArray(urlFilters.size) ? urlFilters.size[0] : urlFilters.size;
    if (urlFilters.condition) newFilters.condition = Array.isArray(urlFilters.condition) ? urlFilters.condition[0] : urlFilters.condition;
    if (urlFilters.brand) newFilters.brand = Array.isArray(urlFilters.brand) ? urlFilters.brand[0] : urlFilters.brand;
    if (urlFilters.color) newFilters.color = Array.isArray(urlFilters.color) ? urlFilters.color[0] : urlFilters.color;
    if (urlFilters.era) newFilters.era = Array.isArray(urlFilters.era) ? urlFilters.era[0] : urlFilters.era;
    if (urlFilters.material) newFilters.material = Array.isArray(urlFilters.material) ? urlFilters.material[0] : urlFilters.material;
    if (urlFilters.pattern) newFilters.pattern = Array.isArray(urlFilters.pattern) ? urlFilters.pattern[0] : urlFilters.pattern;
    if (urlFilters.rating) newFilters.rating = urlFilters.rating;
    if (urlFilters.in_stock) newFilters.inStockOnly = urlFilters.in_stock === 'true';
    if (urlFilters.on_sale) newFilters.onSaleOnly = urlFilters.on_sale === 'true';
    if (urlFilters.sort) setSortBy(urlFilters.sort);
    if (urlFilters.page) setCurrentPage(parseInt(urlFilters.page) - 1);
    
    console.log('📊 Setting filters:', newFilters);
    setFilters(newFilters);
  }, [searchParams]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (searchTerm) params.set('q', searchTerm);
    if (filters.category) params.set('category', filters.category);
    if (filters.minPrice) params.set('min_price', filters.minPrice);
    if (filters.maxPrice) params.set('max_price', filters.maxPrice);
    if (filters.size) params.set('size', filters.size);
    if (filters.condition) params.set('condition', filters.condition);
    if (filters.brand) params.set('brand', filters.brand);
    if (filters.color) params.set('color', filters.color);
    if (filters.era) params.set('era', filters.era);
    if (filters.material) params.set('material', filters.material);
    if (filters.pattern) params.set('pattern', filters.pattern);
    if (filters.rating) params.set('rating', filters.rating);
    if (filters.inStockOnly) params.set('in_stock', 'true');
    if (filters.onSaleOnly) params.set('on_sale', 'true');
    if (sortBy !== 'relevance') params.set('sort', sortBy);
    if (currentPage > 0) params.set('page', (currentPage + 1).toString());
    
    setSearchParams(params);
  }, [searchTerm, filters, sortBy, currentPage, setSearchParams]);

  // Fetch all products once
  useEffect(() => {
    const fetchAllProducts = async () => {
      setLoading(true);
      
      try {
        console.log('Fetching all products for filtering');
        const result = await productService.getProducts(0, 100); // Get up to 100 products
        
        if (result.success) {
          const productsData = result.data?.content || result.data || [];
          setAllProducts(productsData);
          console.log(` Fetched ${productsData.length} products for filtering`);
        } else {
          showError(result.message || 'Failed to load products');
        }
      } catch (error) {
        console.error(' Error fetching products:', error);
        showError('An error occurred while fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [showError]);

  // Apply filters and sorting whenever allProducts or filters change
  useEffect(() => {
    if (allProducts.length === 0) return;

    console.log('🔄 Applying filters:', filters);
    console.log('🔄 Sort by:', sortBy);

    // Convert price strings to numbers
    const filterCriteria = {
      ...filters,
      priceMin: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      priceMax: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      minRating: filters.rating ? parseFloat(filters.rating) : undefined,
      search: searchTerm
    };

    // Apply filters using the helper function
    let filtered = filterProducts(allProducts, filterCriteria);
    console.log(`After filtering: ${filtered.length} products`);

    // Apply sorting
    filtered = sortProducts(filtered, sortBy);
    console.log(` After sorting: ${filtered.length} products`);

    // Update total products and pages
    setTotalProducts(filtered.length);
    setTotalPages(Math.ceil(filtered.length / productsPerPage));

    // Apply pagination
    const start = currentPage * productsPerPage;
    const paginatedProducts = filtered.slice(start, start + productsPerPage);
    setDisplayedProducts(paginatedProducts);

  }, [allProducts, filters, sortBy, currentPage, searchTerm, productsPerPage]);

  // Sync advanced search with sidebar filters
  const handleAdvancedSearch = (searchFilters) => {
    setSearchTerm(searchFilters.search || '');
    setFilters({
      category: searchFilters.category || '',
      size: searchFilters.size?.length ? searchFilters.size[0] : '',
      condition: searchFilters.condition?.length ? searchFilters.condition[0] : '',
      minPrice: searchFilters.priceMin || '',
      maxPrice: searchFilters.priceMax || '',
      rating: searchFilters.minRating || '',
      brand: searchFilters.brand?.length ? searchFilters.brand[0] : '',
      color: searchFilters.color?.length ? searchFilters.color[0] : '',
      era: searchFilters.era?.length ? searchFilters.era[0] : '',
      material: searchFilters.material?.length ? searchFilters.material[0] : '',
      pattern: searchFilters.pattern?.length ? searchFilters.pattern[0] : '',
      inStockOnly: searchFilters.inStockOnly || false,
      onSaleOnly: searchFilters.onSaleOnly || false
    });
    setSortBy(searchFilters.sortBy || 'relevance');
    setCurrentPage(0);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      size: '',
      condition: '',
      minPrice: '',
      maxPrice: '',
      rating: '',
      brand: '',
      color: '',
      era: '',
      material: '',
      pattern: '',
      inStockOnly: false,
      onSaleOnly: false
    });
    setSearchTerm('');
    setSortBy('relevance');
    setCurrentPage(0);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    console.log('Added to cart:', product);
  };

  const getPageTitle = () => {
    if (filters.category) {
      const categoryName = filters.category.charAt(0).toUpperCase() + filters.category.slice(1);
      return `${categoryName} Products`;
    }
    return 'Shop All Products';
  };

  const getPageDescription = () => {
    if (filters.category) {
      const categoryName = filters.category.charAt(0).toUpperCase() + filters.category.slice(1);
      return `Shop ${categoryName} products at VedaThrifts. Find quality secondhand ${filters.category.toLowerCase()}, vintage pieces, and sustainable fashion at affordable prices in Kenya.`;
    }
    return 'Shop all products at VedaThrifts. Discover quality secondhand clothing, vintage fashion, and sustainable style. Affordable thrift shopping in Kenya.';
  };

  const getPageKeywords = () => {
    const baseKeywords = 'thrift store Kenya, secondhand fashion, vintage clothing, sustainable fashion, affordable clothes';
    if (filters.category) {
      return `${filters.category.toLowerCase()}, ${baseKeywords}`;
    }
    return baseKeywords;
  };

  return (
    <>
      <Helmet>
        {/* Primary SEO */}
        <title>{getPageTitle()} | VedaThrifts - Thrift Store Kenya</title>
        <meta name="description" content={getPageDescription()} />
        <meta name="keywords" content={getPageKeywords()} />
        <meta name="author" content="VedaThrifts" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:title" content={`${getPageTitle()} | VedaThrifts`} />
        <meta property="og:description" content={getPageDescription()} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://vedathrifts.com/shop${window.location.search}`} />
        <meta property="og:image" content="https://vedathrifts.com/og-image-shop.jpg" />
        <meta property="og:image:alt" content="Shop Secondhand Fashion at VedaThrifts" />
        <meta property="og:site_name" content="VedaThrifts" />
        <meta property="og:locale" content="en_KE" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${getPageTitle()} | VedaThrifts`} />
        <meta name="twitter:description" content={getPageDescription()} />
        <meta name="twitter:image" content="https://vedathrifts.com/og-image-shop.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={`https://vedathrifts.com/shop${window.location.search}`} />
      </Helmet>

      <div className="shop-page">
        <div className="shop-header">
          <div className="shop-header-left">
            <h1>{getPageTitle()}</h1>
            {filters.category && (
              <p className="category-description">
                Showing products in category: <strong>{filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}</strong>
              </p>
            )}
          </div>
          <div className="search-section">
            <AdvancedSearch 
              onSearch={handleAdvancedSearch}
              initialFilters={{
                search: searchTerm,
                category: filters.category,
                priceMin: filters.minPrice,
                priceMax: filters.maxPrice,
                size: filters.size ? [filters.size] : [],
                condition: filters.condition ? [filters.condition] : [],
                brand: filters.brand ? [filters.brand] : [],
                color: filters.color ? [filters.color] : [],
                era: filters.era ? [filters.era] : [],
                material: filters.material ? [filters.material] : [],
                pattern: filters.pattern ? [filters.pattern] : [],
                minRating: filters.rating,
                inStockOnly: filters.inStockOnly,
                onSaleOnly: filters.onSaleOnly,
                sortBy: sortBy
              }}
            />
            <SavedSearches />
          </div>
        </div>

        <div className="shop-content">
          <Filters
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            products={displayedProducts}
          />
          
          <main className="shop-main">
            <SortBar
              sortBy={sortBy}
              onSortChange={setSortBy}
              totalProducts={totalProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {loading ? (
              <div className="products-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading products...</p>
              </div>
            ) : displayedProducts.length === 0 ? (
              <div className="no-products">
                <i className="fas fa-box-open"></i>
                <h3>No products found</h3>
                <p>Try adjusting your filters or search term</p>
                <button onClick={clearFilters} className="clear-filters-btn">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <ProductGrid 
                products={displayedProducts} 
                onAddToCart={handleAddToCart}
              />
            )}
            
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage + 1}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default Shop;