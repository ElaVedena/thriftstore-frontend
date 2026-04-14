import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminService } from '../../../services/adminService';
import { useNotification } from '../../../hooks/useNotification';
import Sidebar from '../../../components/admin/Sidebar';
import DataTable from '../../../components/admin/DataTable';
import '../Admin.css';

function ProductList() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useNotification();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [showDeleted, setShowDeleted] = useState(false); 
    const [imageErrors, setImageErrors] = useState({});

    // Add class to body to hide global header and footer
    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    const baseUrl = useMemo(() => 
        process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080',
    []);

    const loadProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await adminService.getProducts(currentPage, 10);
            if (response.success) {
                let allProducts = response.data.content || [];
                
                if (!showDeleted) {
                    allProducts = allProducts.filter(product => 
                        product.status?.toUpperCase() !== 'DELETED'
                    );
                }
                
                setProducts(allProducts);
                setTotalPages(response.data.totalPages || 0);
                setTotalElements(response.data.totalElements || 0);
                setImageErrors({});
            } else {
                showError(response.message);
            }
        } catch (error) {
            showError('Failed to load products');
        } finally {
            setLoading(false);
        }
    }, [currentPage, showError, showDeleted]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    const handleDelete = useCallback(async (product) => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
            try {
                const response = await adminService.deleteProduct(product.id);
                if (response.success) {
                    showSuccess('Product deleted successfully');
                    await loadProducts();
                } else {
                    showError(response.message);
                }
            } catch (error) {
                showError('Failed to delete product');
            }
        }
    }, [loadProducts, showSuccess, showError]);

    const handlePageChange = useCallback((newPage) => {
        setCurrentPage(newPage - 1);
    }, []);

    const toggleShowDeleted = () => {
        setShowDeleted(!showDeleted);
        setCurrentPage(0); 
    };

    const getImageUrl = useCallback((product) => {
        if (!product?.images || product.images.length === 0) {
            return '/placeholder-image.jpg';
        }
        
        const imageUrl = product.images[0];
        
        if (imageUrl.startsWith('http')) {
            return imageUrl;
        }
        
        return baseUrl + imageUrl;
    }, [baseUrl]);

    const handleImageError = useCallback((productId) => {
        setImageErrors(prev => ({ ...prev, [productId]: true }));
    }, []);

    const activeProductCount = products.filter(p => p.status?.toUpperCase() !== 'DELETED').length;
    
    const columns = useMemo(() => [
        {
            key: 'image',
            label: 'Image',
            render: (_, item) => (
                <div className="product-image-container">
                    {imageErrors[item.id] ? (
                        <div className="image-placeholder">
                            <i className="fas fa-image"></i>
                        </div>
                    ) : (
                        <img 
                            src={getImageUrl(item)} 
                            alt={item.name || 'Product'} 
                            className="product-thumb"
                            onError={() => handleImageError(item.id)}
                            loading="lazy"
                            style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'cover',
                                borderRadius: '4px'
                            }}
                        />
                    )}
                </div>
            )
        },
        {
            key: 'name',
            label: 'Product Name',
            render: (value) => value || '-'
        },
        {
            key: 'price',
            label: 'Price',
            render: (price) => price ? `KSh ${Number(price).toLocaleString()}` : '-'
        },
        {
            key: 'stock',
            label: 'Stock',
            render: (stock) => stock ?? 0
        },
        {
            key: 'category',
            label: 'Category',
            render: (value) => value ? value.charAt(0).toUpperCase() + value.slice(1) : '-'
        },
        {
            key: 'status',
            label: 'Status',
            render: (status) => (
                <span className={`status-badge ${status?.toLowerCase() || 'active'}`}>
                    {status || 'ACTIVE'}
                </span>
            )
        }
    ], [getImageUrl, imageErrors, handleImageError]);

    if (loading && products.length === 0) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading products...</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="admin-layout">
            <Sidebar />
            
            <main className="admin-main">
                <div className="admin-header">
                    <h1>Products</h1>
                    <div className="header-actions">
                        <Link to="/admin/products/add" className="admin-btn primary">
                            <i className="fas fa-plus"></i>
                            Add New Product
                        </Link>
                        <button onClick={toggleShowDeleted} className="admin-btn secondary">
                            <i className="fas fa-trash"></i>
                            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
                        </button>
                    </div>
                </div>

                <div className="products-stats">
                    <span>
                        Showing {showDeleted ? products.length : activeProductCount} of {showDeleted ? totalElements : activeProductCount} active products
                    </span>
                    {showDeleted && (
                        <span className="deleted-warning">
                            <i className="fas fa-exclamation-triangle"></i>
                            Showing deleted products
                        </span>
                    )}
                </div>

                <DataTable
                    columns={columns}
                    data={products}
                    onEdit={(product) => navigate(`/admin/products/edit/${product.id}`)}
                    onDelete={handleDelete}
                    emptyMessage="No products found"
                />

                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage)}
                            disabled={currentPage === 0}
                        >
                            <i className="fas fa-chevron-left"></i> Previous
                        </button>
                        <span>Page {currentPage + 1} of {totalPages}</span>
                        <button
                            onClick={() => handlePageChange(currentPage + 2)}
                            disabled={currentPage === totalPages - 1}
                        >
                            Next <i className="fas fa-chevron-right"></i>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default ProductList;