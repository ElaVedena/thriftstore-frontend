import { useState, useEffect, useCallback } from 'react'; 
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
import { getOptimizedImageUrl, getImageWithBackgroundRemoved } from '../utils/cloudinary';
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

    // Generate product-specific SEO data
    const getProductTitle = () => {
        if (!product) return 'Product Details | VedaThrifts';
        return `${product.name} | VedaThrifts - Thrift Store Kenya`;
    };

    const getProductDescription = () => {
        if (!product) return 'View product details at VedaThrifts';
        
        let description = product.description || `${product.name} - Quality secondhand item available at VedaThrifts.`;
        
        if (description.length > 155) {
            description = description.substring(0, 152) + '...';
        }
        
        if (product.price) {
            description += ` Price: KES ${product.price}.`;
        }
        if (product.condition) {
            description += ` Condition: ${product.condition}.`;
        }
        
        return description;
    };

    const getProductKeywords = () => {
        if (!product) return 'thrift store, secondhand fashion, vintage clothing';
        
        const keywords = [
            product.name,
            product.brand,
            product.category,
            product.condition,
            'thrift store',
            'secondhand fashion',
            'vintage clothing',
            'sustainable fashion',
            'affordable clothes',
            'VedaThrifts',
            'Kenya'
        ].filter(Boolean);
        
        return keywords.join(', ');
    };

    const getProductImage = () => {
        if (product?.images?.[0]) {
            return product.images[0];
        }
        if (product?.image) {
            return product.image;
        }
        return 'https://vedathrifts.com/default-product.jpg';
    };

    // FIX: Remove width/height from image optimization to preserve aspect ratio
    const getOptimizedProductImage = (imageUrl, isMobile = false) => {
        if (!imageUrl) return getProductImage();
        
        // Use 'limit' crop to preserve aspect ratio
        if (isMobile) {
            return getOptimizedImageUrl(imageUrl, {
                width: 400,
                height: 400,
                crop: 'limit',  // Changed from 'scale' to 'limit'
                quality: 'auto',
                format: 'webp'
            });
        } else {
            return getOptimizedImageUrl(imageUrl, {
                width: 800,
                height: 800,
                crop: 'limit',  // Changed from 'scale' to 'limit'
                quality: 'auto',
                format: 'auto'
            });
        }
    };

    const getProductPrice = () => {
        return product?.price || 0;
    };

    const getProductAvailability = () => {
        if (!product) return 'out of stock';
        return product.stock > 0 ? 'in stock' : 'out of stock';
    };

    const getProductCondition = () => {
        return product?.condition || 'good';
    };

    if (loading) {
        return (
            <>
                <Helmet>
                    <title>Loading Product | VedaThrifts</title>
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="loading-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading product details...</p>
                </div>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Helmet>
                    <title>Product Not Found | VedaThrifts</title>
                    <meta name="description" content="The product you're looking for doesn't exist or has been removed from VedaThrifts." />
                    <meta name="robots" content="noindex, nofollow" />
                </Helmet>
                <div className="product-not-found">
                    <i className="fas fa-exclamation-circle"></i>
                    <h2>Product Not Found</h2>
                    <p>The product you're looking for doesn't exist or has been removed.</p>
                    <a href="/shop" className="continue-shopping-btn">Continue Shopping</a>
                </div>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>{getProductTitle()}</title>
                <meta name="description" content={getProductDescription()} />
                <meta name="keywords" content={getProductKeywords()} />
                <meta name="author" content="VedaThrifts" />
                <meta name="robots" content="index, follow" />
                
                <meta name="product:brand" content={product.brand || 'VedaThrifts'} />
                <meta name="product:condition" content={getProductCondition()} />
                <meta name="product:availability" content={getProductAvailability()} />
                <meta name="product:retailer_item_id" content={product.id} />
                
                <meta property="og:title" content={getProductTitle()} />
                <meta property="og:description" content={getProductDescription()} />
                <meta property="og:type" content="product" />
                <meta property="og:url" content={`https://vedathrifts.com/product/${product.id}`} />
                <meta property="og:image" content={getProductImage()} />
                <meta property="og:image:alt" content={product.name} />
                <meta property="og:site_name" content="VedaThrifts" />
                <meta property="og:locale" content="en_KE" />
                <meta property="product:price:amount" content={getProductPrice()} />
                <meta property="product:price:currency" content="KES" />
                <meta property="product:availability" content={getProductAvailability()} />
                <meta property="product:retailer_item_id" content={product.id} />
                <meta property="product:condition" content={getProductCondition()} />
                
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={getProductTitle()} />
                <meta name="twitter:description" content={getProductDescription()} />
                <meta name="twitter:image" content={getProductImage()} />
                <meta name="twitter:label1" content="Price" />
                <meta name="twitter:data1" content={`KES ${getProductPrice()}`} />
                <meta name="twitter:label2" content="Condition" />
                <meta name="twitter:data2" content={getProductCondition()} />
                
                <link rel="canonical" href={`https://vedathrifts.com/product/${product.id}`} />
                
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": product.name,
                        "description": product.description,
                        "image": getProductImage(),
                        "brand": {
                            "@type": "Brand",
                            "name": product.brand || "VedaThrifts"
                        },
                        "offers": {
                            "@type": "Offer",
                            "url": `https://vedathrifts.com/product/${product.id}`,
                            "priceCurrency": "KES",
                            "price": getProductPrice(),
                            "availability": getProductAvailability() === 'in stock' 
                                ? "https://schema.org/InStock" 
                                : "https://schema.org/OutOfStock",
                            "itemCondition": `https://schema.org/${getProductCondition() === 'new' ? 'NewCondition' : 'UsedCondition'}`,
                            "seller": {
                                "@type": "Organization",
                                "name": "VedaThrifts"
                            }
                        },
                        "aggregateRating": product.rating ? {
                            "@type": "AggregateRating",
                            "ratingValue": product.rating,
                            "reviewCount": product.reviewCount || 0
                        } : undefined
                    })}
                </script>
            </Helmet>

            <div className="product-detail-page">
                <div className="product-detail-container">
                    <div className="product-detail-grid">
                        <div className="product-gallery">
                            <ProductImages 
                                images={product.images || [product.image]} 
                                productName={product.name}
                                optimizedImages={true}
                            />
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
        </>
    );
}

export default ProductDetail;