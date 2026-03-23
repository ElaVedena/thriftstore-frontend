import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from "../components/products/ProductCard";
import CategoryCard from "../components/products/CategoryCard";
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import '../components/css/Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching home data from database...');
        
        // Fetch all data in parallel
        const [featuredRes, newArrivalsRes, categoriesRes] = await Promise.allSettled([
          productService.getFeaturedProducts(4),
          productService.getNewArrivals(4),
          categoryService.getAllCategories()
        ]);

        // Handle featured products
        if (featuredRes.status === 'fulfilled' && featuredRes.value?.success) {
          setFeaturedProducts(featuredRes.value.data || []);
          console.log('Featured products loaded:', featuredRes.value.data?.length);
        } else {
          console.warn('Failed to load featured products');
          setFeaturedProducts([]);
        }

        // Handle new arrivals
        if (newArrivalsRes.status === 'fulfilled' && newArrivalsRes.value?.success) {
          setNewArrivals(newArrivalsRes.value.data || []);
          console.log('New arrivals loaded:', newArrivalsRes.value.data?.length);
        } else {
          console.warn('Failed to load new arrivals');
          setNewArrivals([]);
        }

        // Handle categories 
        if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.success) {
          const categoryData = categoriesRes.value.data || [];
          setCategories(categoryData);
          console.log('Categories loaded:', categoryData.length);
        } else {
          console.warn('Failed to load categories from database');
          setCategories([]);
        }

      } catch (err) {
        console.error('Error loading home data:', err);
        setError('Failed to load products. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  // Scroll handlers for category slider
  const scrollLeft = () => {
    const container = document.querySelector('.categories-grid-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const container = document.querySelector('.categories-grid-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="home-loading">
        <div className="spinner">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading Vedathrifts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-error">
        <i className="fas fa-exclamation-circle"></i>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="home">
      {/* Hero section with background image */}
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Vedathrifts</h1>
          <p>Curated vintage • Sustainable style • One-of-a-kind finds</p>
          <Link to="/shop" className="btn">Shop Now</Link>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section className="categories-section">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/categories" className="view-all-link">
              View All <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
          
          <div className="categories-slider-container">
            <button className="scroll-btn scroll-left" onClick={scrollLeft}>
              <i className="fas fa-chevron-left"></i>
            </button>
            
            <div className="categories-grid-scroll">
              {categories.map(category => (
                <div key={`category-${category.id}`} className="category-slide">
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
            
            <button className="scroll-btn scroll-right" onClick={scrollRight}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </section>
      )}

      {/* Featured products */}
      {featuredProducts.length > 0 && (
        <section className="featured">
          <h2>Featured Products</h2>
          <div className="product-grid">
            {featuredProducts.slice(0, 4).map(product => (
              <ProductCard 
                key={`featured-${product.id}`} 
                product={product} 
              />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/shop" className="view-all-link">
              View All Products <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </section>
      )}

      {/* New arrivals */}
      {newArrivals.length > 0 && (
        <section className="new-arrivals">
          <h2>New Arrivals</h2>
          <div className="product-grid">
            {newArrivals.slice(0, 4).map(product => (
              <ProductCard 
                key={`new-${product.id}`} 
                product={product} 
              />
            ))}
          </div>
          <div className="section-footer">
            <Link to="/shop?sort=newest" className="view-all-link">
              View All New Arrivals <i className="fas fa-arrow-right"></i>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;