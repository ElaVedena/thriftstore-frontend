import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  
  // Carousel states
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [currentNewArrivalsIndex, setCurrentNewArrivalsIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Refs for auto-slide timers
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

  // Auto-slide for featured products on mobile
  useEffect(() => {
    if (isMobile && featuredProducts.length > 1) {
      if (featuredTimerRef.current) {
        clearInterval(featuredTimerRef.current);
      }
      
      featuredTimerRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // 5 seconds
      
      return () => {
        if (featuredTimerRef.current) {
          clearInterval(featuredTimerRef.current);
        }
      };
    }
  }, [isMobile, featuredProducts.length]);

  // Auto-slide for new arrivals on mobile
  useEffect(() => {
    if (isMobile && newArrivals.length > 1) {
      if (newArrivalsTimerRef.current) {
        clearInterval(newArrivalsTimerRef.current);
      }
      
      newArrivalsTimerRef.current = setInterval(() => {
        setCurrentNewArrivalsIndex((prevIndex) => 
          prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // 5 seconds
      
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
    resetFeaturedTimer();
  };

  const goToNextFeatured = () => {
    setCurrentFeaturedIndex((prevIndex) => 
      prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
    );
    resetFeaturedTimer();
  };

  // Manual navigation for new arrivals carousel
  const goToPreviousNewArrivals = () => {
    setCurrentNewArrivalsIndex((prevIndex) => 
      prevIndex === 0 ? newArrivals.length - 1 : prevIndex - 1
    );
    resetNewArrivalsTimer();
  };

  const goToNextNewArrivals = () => {
    setCurrentNewArrivalsIndex((prevIndex) => 
      prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
    );
    resetNewArrivalsTimer();
  };

  // Reset timers
  const resetFeaturedTimer = () => {
    if (featuredTimerRef.current) {
      clearInterval(featuredTimerRef.current);
      featuredTimerRef.current = setInterval(() => {
        setCurrentFeaturedIndex((prevIndex) => 
          prevIndex === featuredProducts.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }
  };

  const resetNewArrivalsTimer = () => {
    if (newArrivalsTimerRef.current) {
      clearInterval(newArrivalsTimerRef.current);
      newArrivalsTimerRef.current = setInterval(() => {
        setCurrentNewArrivalsIndex((prevIndex) => 
          prevIndex === newArrivals.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
    }
  };

  // Dot indicators navigation
  const goToFeaturedSlide = (index) => {
    setCurrentFeaturedIndex(index);
    resetFeaturedTimer();
  };

  const goToNewArrivalsSlide = (index) => {
    setCurrentNewArrivalsIndex(index);
    resetNewArrivalsTimer();
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [featuredRes, newArrivalsRes, categoriesRes] = await Promise.allSettled([
          productService.getFeaturedProducts(4),
          productService.getNewArrivals(4),
          categoryService.getAllCategories()
        ]);

        if (featuredRes.status === 'fulfilled' && featuredRes.value?.success) {
          const products = featuredRes.value.data || [];
          setFeaturedProducts(products.slice(0, 4));
        } else {
          setFeaturedProducts([]);
        }

        if (newArrivalsRes.status === 'fulfilled' && newArrivalsRes.value?.success) {
          const products = newArrivalsRes.value.data || [];
          setNewArrivals(products.slice(0, 4));
        } else {
          setNewArrivals([]);
        }

        if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.success) {
          const categoryData = categoriesRes.value.data || [];
          setCategories(categoryData);
        } else {
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
  const scrollCategoriesLeft = () => {
    const container = document.querySelector('.categories-grid-scroll');
    if (container) {
      container.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollCategoriesRight = () => {
    const container = document.querySelector('.categories-grid-scroll');
    if (container) {
      container.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

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
        <meta name="description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices." />
        <meta name="keywords" content="thrift store Kenya, secondhand fashion, vintage clothing, sustainable fashion" />
        <meta name="author" content="VedaThrifts" />
        <meta name="robots" content="index, follow" />
        
        <meta property="og:title" content="VedaThrifts - Best Thrift Store in Kenya" />
        <meta property="og:description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vedathrifts.com" />
        <meta property="og:image" content="https://vedathrifts.com/og-image-home.jpg" />
        <meta property="og:site_name" content="VedaThrifts" />
        <meta property="og:locale" content="en_KE" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VedaThrifts - Best Thrift Store in Kenya" />
        <meta name="twitter:description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion." />
        <meta name="twitter:image" content="https://vedathrifts.com/og-image-home.jpg" />
        
        <link rel="canonical" href="https://vedathrifts.com" />
      </Helmet>

      <div className="home">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <span className="hero-badge">Sustainable Fashion</span>
            <h1>Welcome to <span>Vedathrifts</span></h1>
            <p>Curated vintage • Sustainable style • One-of-a-kind finds</p>
            <Link to="/shop" className="btn">Shop Now <i className="fas fa-arrow-right"></i></Link>
          </div>
        </section>

        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="categories-section">
            <div className="container">
              <div className="section-header no-view-all">
                <h2>Shop by Category</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="categories-slider-container">
                <button className="scroll-btn scroll-left" onClick={scrollCategoriesLeft}>
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                <div className="categories-grid-scroll">
                  {categories.map(category => (
                    <div key={`category-${category.id}`} className="category-slide">
                      <CategoryCard category={category} />
                    </div>
                  ))}
                </div>
                
                <button className="scroll-btn scroll-right" onClick={scrollCategoriesRight}>
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section className="featured-section">
            <div className="container">
              <div className="section-header no-view-all">
                <h2>Featured Products</h2>
                <div className="section-divider"></div>
                <p className="section-subtitle">Handpicked just for you</p>
              </div>
              
              {/* Desktop Grid */}
              <div className="product-grid desktop-grid">
                {featuredProducts.map(product => (
                  <ProductCard key={`featured-${product.id}`} product={product} />
                ))}
              </div>
              
              {/* Mobile Carousel */}
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
              </div>
            </div>
          </section>
        )}

        {/* New Arrivals Section */}
        {newArrivals.length > 0 && (
          <section className="new-arrivals-section">
            <div className="container">
              <div className="section-header">
                <h2>New Arrivals</h2>
                <div className="section-divider"></div>
                <p className="section-subtitle">Fresh styles just dropped</p>
              </div>
              
              {/* Desktop Grid */}
              <div className="product-grid desktop-grid">
                {newArrivals.map(product => (
                  <ProductCard key={`new-${product.id}`} product={product} />
                ))}
              </div>
              
              {/* Mobile Carousel */}
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
              </div>
              
              <div className="section-footer">
                <Link to="/shop?sort=newest" className="view-all-link">
                  View All New Arrivals <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default Home;