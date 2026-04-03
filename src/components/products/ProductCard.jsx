import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import WishlistButton from '../wishlist/WishlistButton';
import CloudinaryImage from '../common/CloudinaryImage';
import { getMobileOptimizedUrl, getImageForUseCase } from '../../utils/cloudinary';
import '../../components/css/ProductCard.css';

function ProductCard({ product, priority = false }) {
    const { addToCart } = useCart();

    const handleAddToCartClick = (e) => {
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
        
        addToCart(cartItem);
    };

    const imageUrl = product.images?.[0] || product.image;
    const isInStock = product.stock > 0;

    // Get optimized image URLs for different screen sizes
    const mobileImageUrl = getMobileOptimizedUrl(imageUrl, 120, 120);
    const desktopImageUrl = getImageForUseCase(imageUrl, 'product_card');
    
    // Responsive srcSet for different screen sizes
    const srcSet = `
        ${getMobileOptimizedUrl(imageUrl, 120, 120)} 120w,
        ${getMobileOptimizedUrl(imageUrl, 240, 240)} 240w,
        ${getImageForUseCase(imageUrl, 'product_card')} 300w
    `;
    
    const sizes = "(max-width: 480px) 120px, (max-width: 768px) 240px, 300px";

    return (
        <div className="product-card">
            <Link to={`/product/${product.id}`} className="product-link">
                <div className="product-image">
                    <img
                        src={desktopImageUrl}
                        srcSet={srcSet}
                        sizes={sizes}
                        alt={product.name || 'Product'}
                        className="product-img"
                        loading={priority ? "eager" : "lazy"}
                        width="100%"
                        height="auto"
                    />
                    
                    {/* Condition badge  */}
                    {product.condition && (
                        <span className="product-condition">{product.condition}</span>
                    )}
                    
                    {/* Stock badge*/}
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