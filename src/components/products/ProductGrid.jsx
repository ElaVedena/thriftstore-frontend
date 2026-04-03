import ProductCard from "./ProductCard";
import '../../components/css/ProductGrid.css';

function ProductGrid({ products, onAddToCart }) {
    if (!products || products.length === 0) {
        return (
            <div className="no-products">
                <i className="fas fa-box-open"></i> 
                <p>No products found</p>
                <span>Try adjusting your search or filter to find what you're looking for.</span>
            </div>
        );
    }

    return (
        <div className="product-grid">
            {products.map((product, index) => (
                <ProductCard 
                    key={product.id} 
                    product={product} 
                    priority={index < 4} 
                />
            ))}
        </div>
    );
}

export default ProductGrid;