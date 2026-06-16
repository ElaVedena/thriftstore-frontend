// ProductCard.jsx - Ensure no page reload
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import WishlistButton from '../wishlist/WishlistButton';
import CloudinaryImage from '../common/CloudinaryImage';
import '../../components/css/ProductCard.css';

function ProductCard({ product, priority = false }) {
    const { addToCart } = useCart();

    const handleAddToCartClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if product is in stock
        if (product.stock <= 0) {
            alert('Sorry, this product is out of stock');
            return;
        }
        
        const cartItem = {
            productId: product.id,
            productName: product.name,
            price: product.price || 0,
            quantity: 1,
            size: product.size || 'One Size',
            imageUrl: product.images?.[0] || product.image,
            stock: product.stock
        };
        
        // Add to cart - this should NOT trigger page reload
        await addToCart(cartItem);
    };

    const imageUrl = product.images?.[0] || product.image;
    const isInStock = product.stock > 0;

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-link">
                <div className="product-image">
                    <CloudinaryImage
                        src={imageUrl}
                        alt={product.name || 'Product'}
                        // FIX: Remove width and height to let CSS handle sizing
                        // This preserves the natural aspect ratio
                        crop="limit"  // Changed from 'scale' to 'limit'
                        quality="auto"
                        format="auto"
                        className="product-img"
                        priority={priority}
                        responsive={true}
                        // Keep these for responsive but use 'limit' crop
                        mobileWidth={200}  // Increased for better quality
                        mobileHeight={200}
                    />
                    
                    {isInStock ? (
                        <span className="product-stock-badge">{product.stock} left</span>
                    ) : (
                        <span className="product-stock-badge out">Out of stock</span>
                    )}
                    
                    <div className="wishlist-button">
                        <WishlistButton product={product} />
                    </div>
                </div>
                
                <div className="product-info">
                    <h3 className="product-name">{product.name || 'Product'}</h3>
                    
                    <div className="product-price">
                        <span className="price">KSh {product.price?.toFixed(2)}</span>
                    </div>
                </div>
            </Link>
            
            <button 
                className={`add-to-cart-icon ${!isInStock ? 'disabled' : ''}`}
                onClick={handleAddToCartClick}
                title={isInStock ? "Add to cart" : "Out of stock"}
                disabled={!isInStock}
            >
                <i className="fas fa-shopping-cart"></i>
            </button>
        </div>
    );
}

export default ProductCard;