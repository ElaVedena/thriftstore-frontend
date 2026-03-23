import { useState, useEffect } from 'react';
import { productService } from '../../../services/productService'; 
import ProductGrid from '../ProductGrid';
import '../../../components/css/RelatedProducts.css';

function RelatedProducts({ currentProduct, category }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadRelatedProducts = async () => {
            setLoading(true);
            try {
                const result = await productService.filterProducts(
                    { category },
                    0,
                    4
                );
                if (result.success) {
                    const filtered = result.data.content.filter(
                        p => p.id !== currentProduct.id
                    );
                    setProducts(filtered);
                }
            } catch (error) {
                console.error('Failed to load related products:', error);
            } finally {
                setLoading(false);
            }
        };

        if (category) {
            loadRelatedProducts();
        }
    }, [category, currentProduct.id]);

    if (loading) {
        return <div className="related-loading">Loading recommendations...</div>;
    }

    if (products.length === 0) return null;

    return (
        <div className="related-products">
            <h2>You Might Also Like</h2>
            <ProductGrid products={products} />
        </div>
    );
}

export default RelatedProducts;