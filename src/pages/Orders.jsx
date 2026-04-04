import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import OrderCard from '../components/orders/OrderCard';
import '../components/css/Orders.css';

function Orders() {
    const { user } = useAuth();
    const { showError } = useNotification();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Statuses that should be visible to users (excluding pending/unpaid)
    const VISIBLE_STATUSES = ['PROCESSING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    const FILTER_STATUSES = ['all', 'processing', 'shipped', 'delivered', 'cancelled'];

    useEffect(() => {
        loadOrders();
    }, [currentPage]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getMyOrders(currentPage, 10);
            
            if (response.success) {
                const ordersData = response.data?.data || response.data;
                let ordersContent = ordersData.content || [];
                
                // Filter out pending/unpaid orders
                ordersContent = ordersContent.filter(order => 
                    VISIBLE_STATUSES.includes(order.status?.toUpperCase())
                );
                
                // Fetch product images for each order item
                const ordersWithImages = await Promise.all(ordersContent.map(async (order) => {
                    if (order.items && order.items.length > 0) {
                        const itemsWithImages = await Promise.all(order.items.map(async (item) => {
                            if (item.imageUrl || item.image) {
                                return item;
                            }
                            
                            const productId = item.productId || item.id;
                            if (productId) {
                                try {
                                    const productResponse = await productService.getProductById(productId);
                                    if (productResponse.success && productResponse.data) {
                                        const product = productResponse.data;
                                        item.imageUrl = product.images?.[0] || product.imageUrl || product.image;
                                    }
                                } catch (error) {
                                    console.error('Failed to fetch product image:', error);
                                }
                            }
                            return item;
                        }));
                        order.items = itemsWithImages;
                    }
                    return order;
                }));
                
                setOrders(ordersWithImages);
                setTotalPages(ordersData.totalPages || 0);
                setTotalElements(ordersWithImages.length);
            } else {
                showError(response.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
            showError('An error occurred while loading your orders');
        } finally {
            setLoading(false);
        }
    };

    const ordersArray = Array.isArray(orders) ? orders : [];

    const filteredOrders = ordersArray.filter(order => {
        if (filter !== 'all' && order.status !== filter.toUpperCase()) {
            return false;
        }
        
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            return (
                order.orderNumber?.toLowerCase().includes(searchLower) ||
                (order.items && Array.isArray(order.items) && order.items.some(item => 
                    item.productName?.toLowerCase().includes(searchLower)
                ))
            );
        }
        
        return true;
    });

    const getCountByStatus = (status) => {
        if (status === 'all') return ordersArray.length;
        return ordersArray.filter(o => o.status === status.toUpperCase()).length;
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && ordersArray.length === 0) {
        return (
            <div className="orders-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading your orders...</p>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-header">
                <h1>My Orders</h1>
                {totalElements > 0 && (
                    <p className="orders-count">{totalElements} completed orders</p>
                )}
                
                <div className="orders-search">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search by order ID or product name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="orders-tabs">
                {FILTER_STATUSES.map(status => (
                    <button
                        key={status}
                        className={`tab-btn ${filter === status ? 'active' : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className="tab-count">{getCountByStatus(status)}</span>
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="no-orders">
                    <i className="fas fa-shopping-bag"></i>
                    <h2>No orders found</h2>
                    <p>
                        {searchTerm || filter !== 'all' 
                            ? 'Try adjusting your filters or search term'
                            : "You haven't placed any completed orders yet"}
                    </p>
                    <Link to="/shop" className="shop-now-btn">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                    ))}
                </div>
            )}
            
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className="pagination-btn"
                    >
                        <i className="fas fa-chevron-left"></i>
                        Previous
                    </button>
                    
                    <div className="pagination-info">
                        <span>Page {currentPage + 1} of {totalPages}</span>
                        <span className="pagination-total">({totalElements} items)</span>
                    </div>
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className="pagination-btn"
                    >
                        Next
                        <i className="fas fa-chevron-right"></i>
                    </button>
                </div>
            )}
        </div>
    );
}

export default Orders;