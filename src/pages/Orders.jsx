import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../hooks/useNotification';
import { orderService } from '../services/orderService';
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

    useEffect(() => {
        loadOrders();
    }, [currentPage]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getMyOrders(currentPage, 10);
            
            if (response.success) {
                // Handle the nested response structure
                // The data comes as: { success: true, data: { content: [...], totalPages, ... } }
                const ordersData = response.data?.data || response.data;
                
                setOrders(ordersData.content || []);
                setTotalPages(ordersData.totalPages || 0);
                setTotalElements(ordersData.totalElements || 0);
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

    // Ensure orders is always an array for filtering
    const ordersArray = Array.isArray(orders) ? orders : [];

    // Filter orders 
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
                    <p className="orders-count">{totalElements} total orders</p>
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
                {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => (
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
                            : "You haven't placed any orders yet"}
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