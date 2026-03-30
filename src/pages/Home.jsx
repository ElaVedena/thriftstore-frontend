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

  // Refs for scroll containers
  const featuredScrollRef = useRef(null);
  const newArrivalsScrollRef = useRef(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching home data from database...');
        
        // Fetch all data in parallel
        const [featuredRes, newArrivalsRes, categoriesRes] = await Promise.allSettled([
          productService.getFeaturedProducts(8),
          productService.getNewArrivals(8),
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

  // Scroll handlers for featured products
  const scrollFeaturedLeft = () => {
    if (featuredScrollRef.current) {
      featuredScrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollFeaturedRight = () => {
    if (featuredScrollRef.current) {
      featuredScrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  // Scroll handlers for new arrivals
  const scrollNewArrivalsLeft = () => {
    if (newArrivalsScrollRef.current) {
      newArrivalsScrollRef.current.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollNewArrivalsRight = () => {
    if (newArrivalsScrollRef.current) {
      newArrivalsScrollRef.current.scrollBy({ left: 280, behavior: 'smooth' });
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
        {/* Primary SEO */}
        <title>VedaThrifts - Best Thrift Store in Kenya | Affordable Secondhand Fashion</title>
        <meta name="description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices. Free delivery available in Nairobi and across Kenya." />
        <meta name="keywords" content="thrift store Kenya, secondhand fashion, vintage clothing, affordable clothes, sustainable fashion, pre-loved items, VedaThrifts, thrift shopping Nairobi" />
        <meta name="author" content="VedaThrifts" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph / Facebook / WhatsApp */}
        <meta property="og:title" content="VedaThrifts - Best Thrift Store in Kenya" />
        <meta property="og:description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vedathrifts.com" />
        <meta property="og:image" content="https://vedathrifts.com/og-image-home.jpg" />
        <meta property="og:image:alt" content="VedaThrifts - Affordable Secondhand Fashion" />
        <meta property="og:site_name" content="VedaThrifts" />
        <meta property="og:locale" content="en_KE" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="VedaThrifts - Best Thrift Store in Kenya" />
        <meta name="twitter:description" content="Discover Kenya's best thrift store. Shop quality secondhand clothes, vintage dresses, and sustainable fashion at unbeatable prices." />
        <meta name="twitter:image" content="https://vedathrifts.com/og-image-home.jpg" />
        <meta name="twitter:site" content="@VedaThrifts" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://vedathrifts.com" />
        
        {/* Alternate language versions (if you add Swahili later) */}
        <link rel="alternate" href="https://vedathrifts.com" hrefLang="x-default" />
        
        {/* Additional SEO */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi" />
        <meta name="geo.position" content="-1.286389;36.817223" />
        <meta name="ICBM" content="-1.286389, 36.817223" />
      </Helmet>

      <div className="home">
        {/* Hero section with background image */}
        <section className="hero">
          <div className="hero-content">
            <h1>Welcome to Vedathrifts</h1>
            <p>Curated vintage • Sustainable style • One-of-a-kind finds</p>
            <Link to="/shop" className="btn">Shop Now</Link>
          </div>
        </section>

        {/* Categories Section - Keep as is with slider */}
        {categories.length > 0 && (
          <section className="categories-section">
            <div className="section-header">
              <h2>Shop by Category</h2>
              <Link to="/categories" className="view-all-link">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
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
          </section>
        )}

        {/* Featured products - Now with horizontal scroll on mobile */}
        {featuredProducts.length > 0 && (
          <section className="featured">
            <div className="section-header">
              <h2>Featured Products</h2>
              <Link to="/shop" className="view-all-link">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            
            {/* Desktop grid view */}
            <div className="product-grid desktop-grid">
              {featuredProducts.slice(0, 4).map(product => (
                <ProductCard 
                  key={`featured-${product.id}`} 
                  product={product} 
                />
              ))}
            </div>
            
            {/* Mobile horizontal scroll view */}
            <div className="product-slider-container mobile-scroll">
              <button className="scroll-btn scroll-left" onClick={scrollFeaturedLeft}>
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="product-scroll" ref={featuredScrollRef}>
                {featuredProducts.map(product => (
                  <div key={`featured-mobile-${product.id}`} className="product-slide">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              <button className="scroll-btn scroll-right" onClick={scrollFeaturedRight}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </section>
        )}

        {/* New arrivals - Now with horizontal scroll on mobile */}
        {newArrivals.length > 0 && (
          <section className="new-arrivals">
            <div className="section-header">
              <h2>New Arrivals</h2>
              <Link to="/shop?sort=newest" className="view-all-link">
                View All <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
            
            {/* Desktop grid view */}
            <div className="product-grid desktop-grid">
              {newArrivals.slice(0, 4).map(product => (
                <ProductCard 
                  key={`new-${product.id}`} 
                  product={product} 
                />
              ))}
            </div>
            
            {/* Mobile horizontal scroll view */}
            <div className="product-slider-container mobile-scroll">
              <button className="scroll-btn scroll-left" onClick={scrollNewArrivalsLeft}>
                <i className="fas fa-chevron-left"></i>
              </button>
              
              <div className="product-scroll" ref={newArrivalsScrollRef}>
                {newArrivals.map(product => (
                  <div key={`new-mobile-${product.id}`} className="product-slide">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              <button className="scroll-btn scroll-right" onClick={scrollNewArrivalsRight}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default Home;