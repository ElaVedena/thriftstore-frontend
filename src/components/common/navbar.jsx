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
  const location = useLocation();

  // Close dropdown when route changes
  useEffect(() => {
    setShowUserMenu(false);
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
  };

  return (
    <nav className="navbar" ref={navbarRef}>
      <Link to="/" className="site-title">VedaThrifts</Link>
      <ul>
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
    </nav>
  );
}
 
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