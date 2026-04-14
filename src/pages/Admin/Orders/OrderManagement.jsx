import { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { useNotification } from '../../../hooks/useNotification';
import Sidebar from '../../../components/admin/Sidebar';
import DataTable from '../../../components/admin/DataTable';
import '../Admin.css';

function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [updatingOrderId, setUpdatingOrderId] = useState(null);
    const [dateRange, setDateRange] = useState('3days');
    const { showSuccess, showError } = useNotification();

    // Add class to body to hide global header and footer
    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    // Statuses that should be visible to admin (excluding PENDING and PENDING_PAYMENT)
    const VISIBLE_STATUSES = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    
    // Filter tabs that should be shown (no Pending tab)
    const FILTER_TABS = [
        { key: 'all', label: 'All' },
        { key: 'processing', label: 'Processing' },
        { key: 'shipped', label: 'Shipped' },
        { key: 'delivered', label: 'Delivered' },
        { key: 'cancelled', label: 'Cancelled' }
    ];

    useEffect(() => {
        loadOrders();
    }, [dateRange]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const response = await adminService.getOrders();
            if (response.success) {
                let allOrders = response.data?.content || response.data || [];
                
                // Filter out pending/unpaid orders
                allOrders = allOrders.filter(order => 
                    VISIBLE_STATUSES.includes(order.status?.toUpperCase())
                );
                
                allOrders = allOrders.map(order => ({
                    ...order,
                    userName: order.user?.name || order.userName || order.customerName || '-',
                    userEmail: order.user?.email || order.userEmail || order.customerEmail || '-'
                }));
                
                if (dateRange !== 'all') {
                    const now = new Date();
                    let daysToSubtract = 3;
                    
                    if (dateRange === '7days') daysToSubtract = 7;
                    if (dateRange === '30days') daysToSubtract = 30;
                    
                    const cutoffDate = new Date();
                    cutoffDate.setDate(now.getDate() - daysToSubtract);
                    
                    allOrders = allOrders.filter(order => {
                        const orderDate = new Date(order.createdAt);
                        return orderDate >= cutoffDate;
                    });
                }
                
                setOrders(allOrders);
            } else {
                showError(response.message || 'Failed to load orders');
                setOrders([]);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
            showError('An error occurred while loading orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (order, newStatus) => {
        if (order.status === newStatus) return;
        
        setUpdatingOrderId(order.id);
        try {
            const response = await adminService.updateOrderStatus(order.id, newStatus);
            if (response.success) {
                showSuccess(`Order ${order.orderNumber} status updated to ${newStatus}`);
                await loadOrders();
            } else {
                showError(response.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            showError('An error occurred while updating order status');
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const handleViewOrder = (order) => {
        window.location.href = `/admin/orders/${order.id}`;
    };

    const formatPrice = (price) => `KSh ${Number(price).toLocaleString()}`;

    const normalizeStatus = (status) => {
        if (!status) return 'processing';
        return status.toLowerCase();
    };

    const getStatusCount = (statusFilter) => {
        if (statusFilter === 'all') return orders.length;
        return orders.filter(o => normalizeStatus(o.status) === statusFilter.toLowerCase()).length;
    };

    const getDateRangeLabel = () => {
        switch(dateRange) {
            case '3days': return 'Last 3 Days';
            case '7days': return 'Last 7 Days';
            case '30days': return 'Last 30 Days';
            case 'all': return 'All Orders';
            default: return 'Last 3 Days';
        }
    };

    const columns = [
        {
            key: 'orderNumber',
            label: 'Order ID',
            render: (value, item) => value || item.id || '-'
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (_, item) => item.userName || item.user?.name || '-'
        },
        {
            key: 'email',
            label: 'Email',
            render: (_, item) => item.userEmail || item.user?.email || '-'
        },
        {
            key: 'createdAt',
            label: 'Date',
            render: (date) => date ? new Date(date).toLocaleDateString() : '-'
        },
        {
            key: 'total',
            label: 'Total',
            render: (total) => total ? formatPrice(total) : '-'
        },
        {
            key: 'items',
            label: 'Items',
            render: (_, item) => item.items?.length || 0
        },
        {
            key: 'status',
            label: 'Status',
            render: (status, item) => {
                const normalizedStatus = normalizeStatus(status);
                return (
                    <div className="status-control">
                        <select
                            value={normalizedStatus}
                            onChange={(e) => handleStatusChange(item, e.target.value)}
                            className={`status-select status-${normalizedStatus}`}
                            disabled={updatingOrderId === item.id}
                        >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        {updatingOrderId === item.id && (
                            <i className="fas fa-spinner fa-spin status-spinner"></i>
                        )}
                    </div>
                );
            }
        }
    ];

    const filteredOrders = filter === 'all' 
        ? orders 
        : orders.filter(o => normalizeStatus(o.status) === filter.toLowerCase());

    useEffect(() => {
        if (orders.length > 0) {
            console.log('Orders with statuses:', orders.map(o => ({
                orderNumber: o.orderNumber,
                status: o.status,
                date: o.createdAt,
                customer: o.userName
            })));
        }
    }, [orders]);

    if (loading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading orders...</p>
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
                    <h1>Order Management</h1>
                    
                    <div className="header-controls">
                        <div className="date-range-filter">
                            <span className="filter-label">
                                <i className="fas fa-calendar-alt"></i>
                                Show:
                            </span>
                            <div className="date-range-buttons">
                                <button
                                    className={`date-btn ${dateRange === '3days' ? 'active' : ''}`}
                                    onClick={() => setDateRange('3days')}
                                >
                                    Last 3 Days
                                </button>
                                <button
                                    className={`date-btn ${dateRange === '7days' ? 'active' : ''}`}
                                    onClick={() => setDateRange('7days')}
                                >
                                    Last 7 Days
                                </button>
                                <button
                                    className={`date-btn ${dateRange === '30days' ? 'active' : ''}`}
                                    onClick={() => setDateRange('30days')}
                                >
                                    Last 30 Days
                                </button>
                                <button
                                    className={`date-btn ${dateRange === 'all' ? 'active' : ''}`}
                                    onClick={() => setDateRange('all')}
                                >
                                    All Orders
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="filter-tabs">
                        {FILTER_TABS.map(tab => (
                            <button
                                key={tab.key}
                                className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                                onClick={() => setFilter(tab.key)}
                            >
                                {tab.label} ({getStatusCount(tab.key)})
                            </button>
                        ))}
                    </div>
                    
                    <div className="orders-info">
                        <span>
                            <i className="fas fa-info-circle"></i>
                            Showing {filteredOrders.length} completed orders ({getDateRangeLabel()})
                        </span>
                    </div>
                </div>

                <DataTable
                    columns={columns}
                    data={filteredOrders}
                    onView={handleViewOrder}
                    onEdit={null}
                    onDelete={null}
                    emptyMessage="No completed orders found"
                />
            </main>
        </div>
    );
}

export default OrderManagement;