import '../../../components/css/ProductInfo.css'; 

function ProductInfo({ product }) {
    const StarRating = () => {
        const fullStars = Math.floor(product.rating || 0);
        const hasHalfStar = (product.rating || 0) % 1 !== 0;
        
        return (
            <div className="star-rating">
                {[...Array(5)].map((_, index) => {
                    if (index < fullStars) {
                        return <i key={index} className="fas fa-star"></i>;
                    } else if (index === fullStars && hasHalfStar) {
                        return <i key={index} className="fas fa-star-half-alt"></i>;
                    } else {
                        return <i key={index} className="far fa-star"></i>;
                    }
                })}
                <span className="rating-text">{product.rating || 0} ({product.reviewCount || 0} reviews)</span>
            </div>
        );
    };

    // Determine stock status from the stock property
    const stock = product.stock || 0;
    const isInStock = stock > 0;

    return (
        <div className="product-info">
            <h1 className="product-title">{product.name}</h1>
            
            <div className="product-meta">
                <StarRating />
                <span className="product-sku">SKU: {product.sku || `PRD-${product.id}`}</span>
            </div>

            <div className="product-price-section">
                <span className="current-price">{product.price?.toFixed(2) || '0.00'}</span>
                {product.originalPrice && (
                    <>
                        <span className="original-price">${product.originalPrice.toFixed(2)}</span>
                        <span className="discount-badge">
                            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                        </span>
                    </>
                )}
            </div>

            <div className="product-availability">
                <span className={`stock-status ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                    {isInStock ? '✓ In Stock' : '✗ Out of Stock'}
                </span>
              
                {product.condition && (
                    <span className="condition">Condition: {product.condition}</span>
                )}
            </div>

            <div className="product-specs">
                {product.brand && (
                    <div className="spec-item">
                        <span className="spec-label">Brand:</span>
                        <span className="spec-value">{product.brand}</span>
                    </div>
                )}
                {product.category && (
                    <div className="spec-item">
                        <span className="spec-label">Category:</span>
                        <span className="spec-value">{product.category}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductInfo;