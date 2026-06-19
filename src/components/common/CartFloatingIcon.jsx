// components/common/CartFloatingIcon.jsx
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './CartFloatingIcon.css';

function CartFloatingIcon() {
  const { totalItems } = useCart();

  return (
    <Link to="/cart" className="cart-floating-icon" aria-label="View cart">
      <i className="fas fa-shopping-cart"></i>
      {totalItems > 0 && (
        <span className="cart-floating-badge">{totalItems}</span>
      )}
    </Link>
  );
}

export default CartFloatingIcon;