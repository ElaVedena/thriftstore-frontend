// Shop.jsx - Add cache flag to prevent refetching
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { productService } from '../services/productService';
import { useNotification } from '../hooks/useNotification';
import SortBar from '../components/products/SortBar';
import ProductGrid from '../components/products/ProductGrid';
import Pagination from '../components/common/Pagination';
import Filters from '../components/products/Filters';
import { getSearchParamsFromURL, filterProducts, sortProducts } from '../utils/searchHelpers';
import '../components/css/Shop.css';

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
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
  
  const [productsPerPage, setProductsPerPage] = useState(12);
  
  const { showError } = useNotification();
  
  // Track if data has been loaded
  const hasLoaded = useRef(false);
  const isInitialMount = useRef(true);

  // Detect screen size
  useEffect(() => {
    const updateProductsPerPage = () => {
      setProductsPerPage(12);
    };
    
    updateProductsPerPage();
    window.addEventListener('resize', updateProductsPerPage);
    return () => window.removeEventListener('resize', updateProductsPerPage);
  }, []);

  // Clear URL params when leaving shop page
  useEffect(() => {
    return () => {
      // When navigating away from shop page, clear all search params from URL
      if (location.pathname !== '/shop') {
        // Replace current URL without search params
        window.history.replaceState({}, '', location.pathname);
      }
    };
  }, [location.pathname]);

  // Save state to sessionStorage before navigation
  useEffect(() => {
    const saveState = () => {
      const stateToSave = {
        allProducts,
        searchTerm,
        filters,
        sortBy,
        viewMode,
        currentPage,
        totalProducts,
        totalPages,
        displayedProducts
      };
      sessionStorage.setItem('shopState', JSON.stringify(stateToSave));
    };

    window.addEventListener('beforeunload', saveState);
    return () => window.removeEventListener('beforeunload', saveState);
  }, [allProducts, searchTerm, filters, sortBy, viewMode, currentPage, totalProducts, totalPages, displayedProducts]);

  // Restore state from sessionStorage when navigating back
  useEffect(() => {
    const savedState = sessionStorage.getItem('shopState');
    if (savedState && !hasLoaded.current && location.pathname === '/shop') {
      try {
        const parsed = JSON.parse(savedState);
        if (parsed.allProducts && parsed.allProducts.length > 0) {
          setAllProducts(parsed.allProducts);
          setSearchTerm(parsed.searchTerm || '');
          setFilters(parsed.filters || {});
          setSortBy(parsed.sortBy || 'relevance');
          setViewMode(parsed.viewMode || 'grid');
          setCurrentPage(parsed.currentPage || 0);
          setTotalProducts(parsed.totalProducts || 0);
          setTotalPages(parsed.totalPages || 0);
          setDisplayedProducts(parsed.displayedProducts || []);
          setLoading(false);
          hasLoaded.current = true;
          return;
        }
      } catch (e) {
        console.error('Error restoring shop state:', e);
      }
    }
  }, [location.pathname]);

  // Load filters from URL on initial mount only (only on shop page)
  useEffect(() => {
    // Only load filters if we're on the shop page
    if (location.pathname !== '/shop') return;
    if (hasLoaded.current) return;
    
    const urlFilters = getSearchParamsFromURL(searchParams);
    
    const newFilters = { ...filters };
    
    if (urlFilters.category) newFilters.category = urlFilters.category;
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
    
    setFilters(newFilters);
  }, [location.pathname]); // Add location.pathname as dependency

  // Update URL when filters change (only on shop page)
  useEffect(() => {
    // Only update URL if we're on the shop page
    if (location.pathname !== '/shop') return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
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
    
    // Only update if there are params, otherwise clear them
    if (Array.from(params).length > 0) {
      setSearchParams(params, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [searchTerm, filters, sortBy, currentPage, setSearchParams, location.pathname]);

  // Fetch all products once - only if not already loaded
  useEffect(() => {
    if (hasLoaded.current && allProducts.length > 0) return;
    
    const fetchAllProducts = async () => {
      setLoading(true);
      
      try {
        const result = await productService.getProducts(0, 100);
        
        if (result.success) {
          const productsData = result.data?.content || result.data || [];
          setAllProducts(productsData);
          hasLoaded.current = true;
        } else {
          showError(result.message || 'Failed to load products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        showError('An error occurred while fetching products');
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, [showError]);

  // Apply filters and sorting
  useEffect(() => {
    if (allProducts.length === 0) return;

    const filterCriteria = {
      ...filters,
      priceMin: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
      priceMax: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      minRating: filters.rating ? parseFloat(filters.rating) : undefined,
      search: searchTerm
    };

    let filtered = filterProducts(allProducts, filterCriteria);
    
    if (sortBy === 'price-low') {
      filtered = [...filtered].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === 'price-high') {
      filtered = [...filtered].sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === 'rating') {
      filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else if (sortBy === 'relevance') {
      filtered = [...filtered].sort((a, b) => (b.createdAt || b.id) - (a.createdAt || a.id));
    }

    setTotalProducts(filtered.length);
    setTotalPages(Math.ceil(filtered.length / productsPerPage));

    const start = currentPage * productsPerPage;
    const paginatedProducts = filtered.slice(start, start + productsPerPage);
    setDisplayedProducts(paginatedProducts);

  }, [allProducts, filters, sortBy, currentPage, searchTerm, productsPerPage]);

  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value;
    setSearchTerm(searchValue);
    setCurrentPage(0);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
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

  return (
    <>
      <Helmet>
        <title>Shop | VedaThrifts</title>
      </Helmet>

      <div className="shop-page">
        <div className="shop-header">
          <div className="shop-header-left">
            <h1>Shop All Products</h1>
            {filters.category && (
              <p className="category-description">
                Showing products in category: <strong>{filters.category.charAt(0).toUpperCase() + filters.category.slice(1)}</strong>
              </p>
            )}
          </div>
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="search"
              placeholder="Search products..."
              defaultValue={searchTerm}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              <i className="fas fa-search"></i>
            </button>
          </form>
        </div>

        <div className="shop-content">
          <div className="filters-sidebar">
            <button onClick={clearFilters} className="clear-filters-top">
              <i className="fas fa-times-circle"></i> Clear All Filters
            </button>
            <Filters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              products={displayedProducts}
            />
          </div>
          
          <main className="shop-main">
            <SortBar
              sortBy={sortBy}
              onSortChange={handleSortChange}
              totalProducts={totalProducts}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />

            {loading && allProducts.length === 0 ? (
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