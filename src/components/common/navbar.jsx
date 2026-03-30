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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  // Close dropdown and menu when route changes
  useEffect(() => {
    setShowUserMenu(false);
    setIsMenuOpen(false);
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

  // Close mobile menu when clicking a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

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
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      <Link to="/" className="site-title" onClick={handleLinkClick}>VedaThrifts</Link>
      
      {/* Core Navigation Links - Always visible on mobile */}
      <div className="nav-core-links">
        <CustomLink to="/" className="core-link" onClick={handleLinkClick}>Home</CustomLink>
        <CustomLink to="/shop" className="core-link" onClick={handleLinkClick}>Shop</CustomLink>
        <CustomLink to="/beauty" className="core-link" onClick={handleLinkClick}>Beauty</CustomLink>
        <CustomLink to="/cart" className="core-link cart-link-wrapper" onClick={handleLinkClick}>
          <span className="cart-icon">
            <i className="fas fa-shopping-cart"></i>
            {totalItems > 0 && (
              <span className="cart-badge">{totalItems}</span>
            )}
          </span>
          <span className="core-link-text">Cart</span>
        </CustomLink>
        
        {!isAuthenticated && (
          <CustomLink to="/login" className="core-link" onClick={handleLinkClick}>Login</CustomLink>
        )}
        
        {isAuthenticated && (
          <li className="user-menu-container core-user-menu">
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
                <Link to="/profile" className="dropdown-item" onClick={() => { setShowUserMenu(false); handleLinkClick(); }}>
                  <i className="fas fa-user"></i>
                  My Profile
                </Link>
                <Link to="/orders" className="dropdown-item" onClick={() => { setShowUserMenu(false); handleLinkClick(); }}>
                  <i className="fas fa-shopping-bag"></i>
                  My Orders
                </Link>
                <Link to="/wishlist" className="dropdown-item" onClick={() => { setShowUserMenu(false); handleLinkClick(); }}>
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
        )}
        
        {/* Hamburger Button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="More menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      {/* Full Navigation Menu (Hidden by default, opens with hamburger) */}
      <div className={`nav-full-menu ${isMenuOpen ? 'active' : ''}`}>
        <div className="nav-full-menu-header">
          <h3>Menu</h3>
          <button className="close-menu" onClick={toggleMenu}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <ul>
          <CustomLink to="/" onClick={handleLinkClick}>Home</CustomLink>
          <CustomLink to="/shop" onClick={handleLinkClick}>Shop</CustomLink>
          <CustomLink to="/beauty" onClick={handleLinkClick}>Beauty</CustomLink>
          <CustomLink to="/about" onClick={handleLinkClick}>About</CustomLink>
          <CustomLink to="/contact" onClick={handleLinkClick}>Contact</CustomLink>
          <CustomLink to="/cart" className="cart-link-wrapper" onClick={handleLinkClick}>
            <span className="cart-icon">
              <i className="fas fa-shopping-cart"></i>
              {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
              )}
            </span>
            Cart
          </CustomLink>
          
          {!isAuthenticated ? (
            <>
              <CustomLink to="/login" onClick={handleLinkClick}>Login</CustomLink>
              <CustomLink to="/register" onClick={handleLinkClick}>Sign Up</CustomLink>
            </>
          ) : (
            <>
              <CustomLink to="/profile" onClick={handleLinkClick}>My Profile</CustomLink>
              <CustomLink to="/orders" onClick={handleLinkClick}>My Orders</CustomLink>
              <CustomLink to="/wishlist" onClick={handleLinkClick}>Wishlist</CustomLink>
              <button onClick={handleLogout} className="logout-link">Logout</button>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
}

function CustomLink({ to, children, className, onClick, ...props }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  
  return (
    <li className={`${isActive ? "active" : ""} ${className || ''}`}>
      <Link to={to} onClick={onClick} {...props}>
        {children}
      </Link>
    </li>
  );
}