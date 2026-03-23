import { useState, useEffect, useCallback } from 'react'; 
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useNotification } from '../hooks/useNotification';
import { productService } from '../services/productService'; 
import ProductImages from '../components/products/ProductDetail/ProductImages';
import ProductInfo from '../components/products/ProductDetail/ProductInfo';
import ProductActions from '../components/products/ProductDetail/ProductActions';
import ProductDescription from '../components/products/ProductDetail/ProductDescription';
import ReviewList from '../components/reviews/ReviewList';
import ReviewForm from '../components/reviews/ReviewForm';
import ProductShare from '../components/products/ProductDetail/ProductShare';
import RelatedProducts from '../components/products/ProductDetail/RelatedProducts';
import '../components/css/ProductDetail.css';

function ProductDetail() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { showError, showSuccess } = useNotification();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showReviewForm, setShowReviewForm] = useState(false);

    // Wrap loadProduct in useCallback
    const loadProduct = useCallback(async () => {
        setLoading(true);
        try {
            const result = await productService.getProductById(id);
            if (result.success) {
                setProduct(result.data);
            } else {
                showError(result.message || 'Failed to load product');
            }
        } catch (error) {
            showError('An error occurred while loading the product');
        } finally {
            setLoading(false);
        }
    }, [id, showError]); 

    useEffect(() => {
        loadProduct();
    }, [loadProduct]); 

    const handleAddToCart = (productWithDetails) => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] || product.image,
            brand: product.brand,
            condition: product.condition,
            selectedSize: productWithDetails.selectedSize || product.size || 'One Size',
            quantity: productWithDetails.quantity || 1,
            originalPrice: product.originalPrice
        });
        
        showSuccess(`${product.name} added to cart!`, {
            action: {
                label: 'View Cart',
                onClick: () => window.location.href = '/cart'
            }
        });
    };

    const handleReviewSubmitted = (newReview) => {
        setShowReviewForm(false);
        loadProduct(); 
        setTimeout(() => {
            document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading product details...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="product-not-found">
                <i className="fas fa-exclamation-circle"></i>
                <h2>Product Not Found</h2>
                <p>The product you're looking for doesn't exist or has been removed.</p>
                <a href="/shop" className="continue-shopping-btn">Continue Shopping</a>
            </div>
        );
    }

    return (
        <div className="product-detail-page">
            <div className="product-detail-container">
                <div className="product-detail-grid">
                    <div className="product-gallery">
                        <ProductImages images={product.images || [product.image]} productName={product.name} />
                    </div>
                    
                    <div className="product-detail-info">
                        <ProductInfo product={product} />
                        <ProductActions product={product} onAddToCart={handleAddToCart} />
                        <ProductShare product={product} />
                        
                      
                    </div>
                </div>

                <ProductDescription 
                    description={product.description} 
                    details={product.details || []} 
                />

                <div id="reviews-section" className="reviews-section">
                    {showReviewForm && (
                        <ReviewForm 
                            productId={product.id} 
                            onReviewSubmitted={handleReviewSubmitted}
                        />
                    )}
                    
                    <ReviewList productId={product.id} />
                </div>

                <RelatedProducts 
                    currentProduct={product} 
                    category={product.category}
                />
            </div>
        </div>
    );
}

export default ProductDetail;