import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import ProductCard from "../components/products/ProductCard";
import CategoryCard from "../components/products/CategoryCard";
import CartFloatingIcon from '../components/common/CartFloatingIcon';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import '../components/css/Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Carousel states
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [currentNewArrivalsIndex, setCurrentNewArrivalsIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for scroll containers
  const featuredScrollRef = useRef(null);
  const newArrivalsScrollRef = useRef(null);
  
  // Auto-slide timers
  const featuredTimerRef = useRef(null);
  const newArrivalsTimerRef = useRef(null);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-slide for featured products on mobile - 2 seconds
  useEffect(() => {
    if (isMobile && featuredProducts.length > 1) {
      if (featuredTimerRef.current) {
        clearInterval(featuredTimerRef.current);
      }
      
      featuredTimerRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
      
      return () => {
        if (featuredTimerRef.current) {
          clearInterval(featuredTimerRef.current);
        }
      };
    }
  }, [isMobile, featuredProducts.length]);

  // Auto-slide for new arrivals on mobile - 2 seconds
  useEffect(() => {
    if (isMobile && newArrivals.length > 1) {
      if (newArrivalsTimerRef.current) {
        clearInterval(newArrivalsTimerRef.current);
      }
      
      newArrivalsTimerRef.current = setInterval(() => {
        setCurrentNewArrivalsIndex((prevIndex) => 
          prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
      
      return () => {
        if (newArrivalsTimerRef.current) {
          clearInterval(newArrivalsTimerRef.current);
        }
      };
    }
  }, [isMobile, newArrivals.length]);

  // Reset current index when products change
  useEffect(() => {
    setCurrentFeaturedIndex(0);
    setCurrentNewArrivalsIndex(0);
  }, [featuredProducts, newArrivals]);

  // Manual navigation for featured carousel
  const goToPreviousFeatured = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === 0 ? featuredProducts.length - 1 : prevIndex - 1
    );
    if (featuredTimerRef.current) {
      clearInterval(featuredTimerRef.current);
      featuredTimerRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
    }
  };

  const goToNextFeatured = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
    );
    if (featuredTimerRef.current) {
      clearInterval(featuredTimerRef.current);
      featuredTimerRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
    }
  };

  // Manual navigation for new arrivals carousel
  const goToPreviousNewArrivals = () => {
    setCurrentNewArrivalsIndex((prevIndex) => 
      prevIndex === 0 ? newArrivals.length - 1 : prevIndex - 1
    );
    if (newArrivalsTimerRef.current) {
      clearInterval(newArrivalsTimerRef.current);
      newArrivalsTimerRef.current = setInterval(() => {
        setCurrentNewArrivalsIndex((prevIndex) => 
          prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
    }
  };

  const goToNextNewArrivals = () => {
    setCurrentNewArrivalsIndex((prevIndex) => 
      prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
    );
    if (newArrivalsTimerRef.current) {
      clearInterval(newArrivalsTimerRef.current);
      newArrivalsTimerRef.current = setInterval(() => {
        setCurrentNewArrivalsIndex((prevIndex) => 
          prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
    }
  };

  // Dot indicators navigation
  const goToFeaturedSlide = (index) => {
    setCurrentFeaturedIndex(index);
    if (featuredTimerRef.current) {
      clearInterval(featuredTimerRef.current);
      featuredTimerRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
    }
  };

  const goToNewArrivalsSlide = (index) => {
    setCurrentNewArrivalsIndex(index);
    if (newArrivalsTimerRef.current) {
      clearInterval(newArrivalsTimerRef.current);
      newArrivalsTimerRef.current = setInterval(() => {
        setCurrentNewArrivalsIndex((prevIndex) => 
          prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
        );
      }, 2000);
    }
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching home data from database...');
        
        const [featuredRes, newArrivalsRes, categoriesRes] = await Promise.allSettled([
          productService.getFeaturedProducts(8),
          productService.getNewArrivals(4),
          categoryService.getAllCategories()
        ]);

        let newArrivalsProducts = [];
        if (newArrivalsRes.status === 'fulfilled' && newArrivalsRes.value?.success) {
          newArrivalsProducts = newArrivalsRes.value.data || [];
          setNewArrivals(newArrivalsProducts.slice(0, 4));
          console.log('New arrivals loaded:', newArrivalsProducts.slice(0, 4).length);
        } else {
          console.warn('Failed to load new arrivals');
          setNewArrivals([]);
        }

        if (featuredRes.status === 'fulfilled' && featuredRes.value?.success) {
          let products = featuredRes.value.data || [];
          
          const newArrivalsIds = new Set(newArrivalsProducts.map(p => p.id));
          let filteredProducts = products.filter(product => !newArrivalsIds.has(product.id));
          
          const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());
          setFeaturedProducts(shuffled.slice(0, 4));
          console.log('Featured products loaded:', shuffled.slice(0, 4).length);
        } else {
          console.warn('Failed to load featured products');
          setFeaturedProducts([]);
        }

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

  if (loading) {
    return (
      <>
        <Helmet>
          <title>Loading... | VedaThrifts</title>
        </Helmet>
        <div className="home-loading">
          <div className="spinner">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading Vedathrifts...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Helmet>
          <title>Error | VedaThrifts</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="home-error">
          <i className="fas fa-exclamation-circle"></i>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>VedaThrifts - Best Thrift Store in Kenya | Affordable Secondhand Fashion</title>
        <meta name="description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices. Free delivery available in Nairobi and across Kenya." />
        <meta name="keywords" content="thrift store Kenya, secondhand fashion, vintage clothing, affordable clothes, sustainable fashion, pre-loved items, VedaThrifts, thrift shopping Nairobi" />
        <meta name="author" content="VedaThrifts" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="VedaThrifts - Best Thrift Store in Kenya" />
        <meta property="og:description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vedathrifts.com" />
        <meta property="og:image" content="https://vedathrifts.com/og-image-home.jpg" />
        <meta property="og:image:alt" content="VedaThrifts - Affordable Secondhand Fashion" />
        <meta property="og:site_name" content="VedaThrifts" />
        <meta property="og:locale" content="en_KE" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VedaThrifts - Best Thrift Store in Kenya" />
        <meta name="twitter:description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices." />
        <meta name="twitter:image" content="https://vedathrifts.com/og-image-home.jpg" />
        <meta name="twitter:site" content="@VedaThrifts" />
        
        <link rel="canonical" href="https://vedathrifts.com" />
        
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi" />
        <meta name="geo.position" content="-1.286389;36.817223" />
        <meta name="ICBM" content="-1.286389, 36.817223" />
      </Helmet>

      <div className="home">
        <section className="hero">
          <div className="hero-content">
            <h1>Welcome to Vedathrifts</h1>
            <p>Curated vintage • Sustainable style • One-of-a-kind finds</p>
            <Link to="/shop" className="btn">Shop Now</Link>
          </div>
        </section>

        {/* Shop by Category - Now using GRID layout instead of horizontal scroll */}
        {categories.length > 0 && (
          <section className="categories-section">
            <div className="section-header no-view-all">
              <h2>Shop by Category</h2>
            </div>
            
            <div className="categories-grid">
              {categories.map(category => (
                <div key={`category-${category.id}`} className="category-item">
                  <CategoryCard category={category} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <section className="featured">
            <div className="section-header no-view-all">
              <h2>Featured Products</h2>
            </div>
            
            <div className="product-grid desktop-grid">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard key={`featured-${product.id}`} product={product} />
              ))}
            </div>
            
            <div className="mobile-carousel">
              <div className="carousel-container">
                <button className="carousel-arrow prev" onClick={goToPreviousFeatured}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <div className="carousel-slide">
                  {featuredProducts[currentFeaturedIndex] && (
                    <ProductCard product={featuredProducts[currentFeaturedIndex]} />
                  )}
                </div>
                
                <button className="carousel-arrow next" onClick={goToNextFeatured}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div className="carousel-dots">
                {featuredProducts.map((_, index) => (
                  <button
                    key={`featured-dot-${index}`}
                    className={`carousel-dot ${currentFeaturedIndex === index ? 'active' : ''}`}
                    onClick={() => goToFeaturedSlide(index)}
                  />
                ))}
              </div>
              
              <div className="carousel-timer-indicator">
                <div className="timer-progress" key={currentFeaturedIndex}></div>
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <section className="new-arrivals">
            <div className="section-header">
              <h2>New Arrivals</h2>
            </div>
            
            <div className="product-grid desktop-grid">
              {newArrivals.slice(0, 4).map(product => (
                <ProductCard key={`new-${product.id}`} product={product} />
              ))}
            </div>
            
            <div className="mobile-carousel">
              <div className="carousel-container">
                <button className="carousel-arrow prev" onClick={goToPreviousNewArrivals}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <div className="carousel-slide">
                  {newArrivals[currentNewArrivalsIndex] && (
                    <ProductCard product={newArrivals[currentNewArrivalsIndex]} />
                  )}
                </div>
                
                <button className="carousel-arrow next" onClick={goToNextNewArrivals}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              
              <div className="carousel-dots">
                {newArrivals.map((_, index) => (
                  <button
                    key={`new-dot-${index}`}
                    className={`carousel-dot ${currentNewArrivalsIndex === index ? 'active' : ''}`}
                    onClick={() => goToNewArrivalsSlide(index)}
                  />
                ))}
              </div>
              
              <div className="carousel-timer-indicator">
                <div className="timer-progress" key={currentNewArrivalsIndex}></div>
              </div>
            </div>
            
            <div className="section-footer">
              <Link to="/shop?sort=newest" className="view-all-link">
                View All New Arrivals <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </section>
        )}
      </div>

      {/* Floating Cart Icon */}
      <CartFloatingIcon />
    </>
  );
}

export default Home;