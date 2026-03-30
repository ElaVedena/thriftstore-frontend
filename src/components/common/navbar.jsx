import { Link, useMatch, useResolvedPath, useLocation } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext'; 
import '../../components/css/nav.css';

export default function Navbar() {
  const navbarRef = useRef(null);
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth(); 
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close dropdown and mobile menu when route changes
  useEffect(() => {
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  useEffect(() => {
    const setNavbarHeight = () => {
      if (navbarRef.current) {
        const navbarHeight = navbarRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${navbarHeight}px`);
      }
    };

    setNavbarHeight();
    window.addEventListener('resize', setNavbarHeight);

    return () => {
      window.removeEventListener('resize', setNavbarHeight);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      <Link to="/" className="site-title">VedaThrifts</Link>
      
      {/* Desktop Navigation - Full menu */}
      <ul className="desktop-nav">
        <CustomLink to="/">Home</CustomLink>
        <CustomLink to="/shop">Shop</CustomLink>
        <CustomLink to="/beauty">Beauty</CustomLink>
        <CustomLink to="/about">About</CustomLink>
        <CustomLink to="/contact">Contact</CustomLink>
        <CustomLink to="/cart" className="cart-link-wrapper">
          <span className="cart-icon">
            <i className="fas fa-shopping-cart"></i>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </span>
          Cart
        </CustomLink>
        
        {isAuthenticated ? (
          <li className="user-menu-container">
            <button 
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <i className="fas fa-user-circle"></i>
              <span className="user-name">
                {user?.name?.split(' ')[0] || 'User'}
              </span>
              <i className={`fas fa-chevron-${showUserMenu ? 'up' : 'down'}`}></i>
            </button>
            
            {showUserMenu && (
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fas fa-user"></i>
                  My Profile
                </Link>
                <Link to="/orders" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fas fa-shopping-bag"></i>
                  My Orders
                </Link>
                <Link to="/wishlist" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                  <i className="fas fa-heart"></i>
                  Wishlist
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={handleLogout} className="dropdown-item logout-item">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            )}
          </li>
        ) : (
          <>
            <CustomLink to="/login">Login</CustomLink>
            <CustomLink to="/register">Sign Up</CustomLink>
          </>
        )}
      </ul>

      {/* Mobile Navigation */}
      <div className="mobile-nav">
        {/* Core Links - Always visible on mobile */}
        <div className="mobile-core-links">
          <Link to="/" className="mobile-core-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <Link to="/shop" className="mobile-core-link" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
          <Link to="/beauty" className="mobile-core-link" onClick={() => setIsMobileMenuOpen(false)}>Beauty</Link>
          <Link to="/cart" className="mobile-core-link" onClick={() => setIsMobileMenuOpen(false)}>
            <span className="cart-icon">
              <i className="fas fa-shopping-cart"></i>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </span>
          </Link>
          
          {!isAuthenticated && (
            <Link to="/login" className="mobile-core-link" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
          )}
          
          {isAuthenticated && (
            <div className="mobile-user-icon" onClick={() => setShowUserMenu(!showUserMenu)}>
              <i className="fas fa-user-circle"></i>
            </div>
          )}
        </div>
        
        {/* Hamburger Button */}
        <button 
          className="hamburger" 
          onClick={toggleMobileMenu}
          aria-label="Menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      {/* Mobile Full Menu (Hidden by default) */}
      <div className={`mobile-full-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-header">
          <h3>Menu</h3>
          <button className="close-menu" onClick={toggleMobileMenu}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <ul>
          <li><Link to="/about" onClick={toggleMobileMenu}>About</Link></li>
          <li><Link to="/contact" onClick={toggleMobileMenu}>Contact</Link></li>
          {isAuthenticated ? (
            <>
              <li><Link to="/profile" onClick={toggleMobileMenu}>My Profile</Link></li>
              <li><Link to="/orders" onClick={toggleMobileMenu}>My Orders</Link></li>
              <li><Link to="/wishlist" onClick={toggleMobileMenu}>Wishlist</Link></li>
              <li><button onClick={() => { handleLogout(); toggleMobileMenu(); }} className="logout-btn">Logout</button></li>
            </>
          ) : (
            <li><Link to="/register" onClick={toggleMobileMenu}>Sign Up</Link></li>
          )}
        </ul>
      </div>
    </nav>
  );
}

// Desktop CustomLink (unchanged)
function CustomLink({ to, children, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  
  return (
    <li className={isActive ? "active" : ""}>
      <Link to={to} {...props}>
        {children}
      </Link>
    </li>
  );
}