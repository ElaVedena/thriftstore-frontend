import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { useNotification } from '../../hooks/useNotification';
import Sidebar from '../../components/admin/Sidebar';
import StatsCard from '../../components/admin/StatsCard';
import './Admin.css';

function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [totalRevenue, setTotalRevenue] = useState(0);
    const [paidOrderCount, setPaidOrderCount] = useState(0);
    const { showError } = useNotification();

    // Add class to body to hide global header and footer
    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    const loadDashboardStats = useCallback(async () => {
        try {
            // Load dashboard stats
            const response = await adminService.getDashboardStats();
            if (response.success) {
                setStats(response.data);
                
                // Also fetch revenue stats to get accurate paid order count
                await loadRevenueStats();
            } else {
                showError(response.message);
            }
        } catch (error) {
            showError('Failed to load dashboard stats');
        } finally {
            setLoading(false);
        }
    }, [showError]);

    const loadRevenueStats = useCallback(async () => {
        try {
            // Fetch revenue stats for all time (or use a broader filter)
            const revenueResponse = await adminService.getRevenueStats('month');
            if (revenueResponse.success && revenueResponse.data) {
                setTotalRevenue(revenueResponse.data.totalRevenue || 0);
                setPaidOrderCount(revenueResponse.data.orderCount || 0);
            }
        } catch (error) {
            console.error('Failed to load revenue stats:', error);
        }
    }, []);

    useEffect(() => {
        loadDashboardStats();
    }, [loadDashboardStats]);

    const formatPrice = (price) => `KSh ${price?.toLocaleString() || 0}`;

    if (loading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading dashboard...</p>
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
                    <h1>Dashboard</h1>
                    <p className="admin-welcome">Welcome back, Admin</p>
                </div>

                {/* Stats Cards - Shows accurate revenue from paid orders */}
                <div className="stats-grid">
                    <StatsCard
                        title="Total Revenue"
                        value={formatPrice(totalRevenue || stats?.totalRevenue || 0)}
                        icon="fas fa-money-bill-wave"
                        color="#4caf50"
                    />
                    <StatsCard
                        title="Active Products"
                        value={stats?.totalProducts || 0}
                        icon="fas fa-box"
                        color="#2196f3"
                    />
                    <StatsCard
                        title="Paid Orders"
                        value={paidOrderCount || stats?.totalOrders || 0}
                        icon="fas fa-shopping-cart"
                        color="#ff9800"
                    />
                    <StatsCard
                        title="Total Users"
                        value={stats?.totalUsers || 0}
                        icon="fas fa-users"
                        color="#CEABB1"
                    />
                </div>

                {/* Revenue Details Section */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Revenue Overview</h2>
                        <Link to="/admin/revenue" className="view-all">
                            View Details <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                    <div className="revenue-overview">
                        <div className="revenue-stat">
                            <span className="revenue-label">Total Revenue (Paid Orders)</span>
                            <span className="revenue-value">{formatPrice(totalRevenue || stats?.totalRevenue || 0)}</span>
                        </div>
                        <div className="revenue-stat">
                            <span className="revenue-label">Paid Orders Count</span>
                            <span className="revenue-value">{paidOrderCount || stats?.totalOrders || 0}</span>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Recent Orders</h2>
                        <Link to="/admin/orders" className="view-all">
                            View All <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>

                    <div className="recent-orders">
                        <table className="recent-table">
                            <thead>
                                <tr>
                                    <th>Order ID</th>
                                    <th>Customer</th>
                                    <th>Date</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats?.recentOrders?.map(order => (
                                    <tr key={order.id}>
                                        <td>
                                            <Link to={`/admin/orders/${order.id}`} className="order-link">
                                                {order.orderNumber}
                                            </Link>
                                        </td>
                                        <td>{order.user?.name || 'N/A'}</td>
                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td>{formatPrice(order.total)}</td>
                                        <td>
                                            <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                                    <tr>
                                        <td colSpan="5" className="no-data">
                                            No recent orders found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Low Stock Alert - Only showing active products */}
                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>Low Stock Alert</h2>
                        <Link to="/admin/products" className="view-all">
                            Manage Products <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>

                    <div className="low-stock-grid">
                        {stats?.lowStock?.map(product => (
                            <div key={product.id} className="low-stock-card">
                                <div className="product-info">
                                    <h4>{product.name}</h4>
                                    <p className="product-category">{product.category}</p>
                                </div>
                                <div className="stock-info">
                                    <span className="stock-count">{product.stock} left</span>
                                    <Link to={`/admin/products/edit/${product.id}`} className="restock-link">
                                        Restock
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {(!stats?.lowStock || stats.lowStock.length === 0) && (
                            <div className="no-low-stock">
                                <i className="fas fa-check-circle"></i>
                                <p>All products have sufficient stock</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;