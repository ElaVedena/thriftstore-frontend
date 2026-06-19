// pages/Admin/Revenue/Revenue.jsx
import { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import { useNotification } from '../../../hooks/useNotification';
import Sidebar from '../../../components/admin/Sidebar';
import '../Admin.css';
import './Revenue.css';

function Revenue() {
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('today');
    const [revenueData, setRevenueData] = useState(null);
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const { showError, showInfo } = useNotification();

    // Add class to body to hide global header and footer
    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    useEffect(() => {
        loadRevenueData();
    }, [filter]);

    const loadRevenueData = async () => {
        setLoading(true);
        try {
            let response;
            if (filter === 'custom' && customStartDate && customEndDate) {
                response = await adminService.getRevenueStatsByDateRange(customStartDate, customEndDate);
            } else {
                response = await adminService.getRevenueStats(filter);
            }
            
            if (response.success) {
                // Handle different response structures
                let data = response.data;
                
                // If data is wrapped in a data property
                if (data && data.data) {
                    data = data.data;
                }
                
                // If the response has a success flag
                if (data && data.success !== undefined) {
                    data = data.data || data;
                }
                
                // Try to find order count in various fields
                const orderCountValue = data?.orderCount || data?.totalOrders || data?.ordersCount || data?.total || 0;
                const revenueValue = data?.totalRevenue || data?.total || data?.revenue || 0;
                
                // Ensure we have the expected structure
                const formattedData = {
                    totalRevenue: revenueValue,
                    orderCount: orderCountValue,
                    dailyData: data?.dailyData || data?.daily || [],
                    topProducts: data?.topProducts || data?.products || [],
                    recentOrders: data?.recentOrders || data?.orders || [],
                    maxRevenue: data?.maxRevenue || 0,
                    rawData: data // Keep raw data for debugging
                };
                
                setRevenueData(formattedData);
            } else {
                showError(response.message || 'Failed to load revenue data');
            }
        } catch (error) {
            console.error('Revenue data error:', error);
            showError('Failed to load revenue data');
        } finally {
            setLoading(false);
        }
    };

    const handleCustomRange = () => {
        if (customStartDate && customEndDate) {
            loadRevenueData();
        } else {
            showError('Please select both start and end dates');
        }
    };

    const formatPrice = (price) => `KSh ${price?.toLocaleString() || 0}`;

    const getFilterLabel = () => {
        switch(filter) {
            case 'today': return 'Today';
            case 'week': return 'This Week';
            case 'month': return 'This Month';
            case 'custom': return 'Custom Range';
            default: return 'Today';
        }
    };

    if (loading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading revenue data...</p>
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
                    <h1>Revenue Analytics</h1>
                </div>

                {/* Filter Tabs */}
                <div className="revenue-filters-container">
                    <div className="filter-buttons">
                        <button
                            className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                            onClick={() => setFilter('today')}
                        >
                            <i className="fas fa-calendar-day"></i>
                            Today
                        </button>
                        <button
                            className={`filter-btn ${filter === 'week' ? 'active' : ''}`}
                            onClick={() => setFilter('week')}
                        >
                            <i className="fas fa-calendar-week"></i>
                            This Week
                        </button>
                        <button
                            className={`filter-btn ${filter === 'month' ? 'active' : ''}`}
                            onClick={() => setFilter('month')}
                        >
                            <i className="fas fa-calendar-alt"></i>
                            This Month
                        </button>
                        <button
                            className={`filter-btn ${filter === 'custom' ? 'active' : ''}`}
                            onClick={() => setFilter('custom')}
                        >
                            <i className="fas fa-calendar-plus"></i>
                            Custom Range
                        </button>
                    </div>

                    {filter === 'custom' && (
                        <div className="custom-date-picker">
                            <div className="date-input-group">
                                <label>Start Date</label>
                                <input
                                    type="date"
                                    value={customStartDate}
                                    onChange={(e) => setCustomStartDate(e.target.value)}
                                />
                            </div>
                            <div className="date-input-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    value={customEndDate}
                                    onChange={(e) => setCustomEndDate(e.target.value)}
                                />
                            </div>
                            <button className="apply-btn" onClick={handleCustomRange}>
                                <i className="fas fa-check"></i>
                                Apply
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Cards */}
                <div className="revenue-summary-cards">
                    <div className="summary-card total-revenue">
                        <div className="card-icon">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                        <div className="card-info">
                            <h3>Total Revenue</h3>
                            <p className="card-value">{formatPrice(revenueData?.totalRevenue)}</p>
                            <span className="card-period">{getFilterLabel()}</span>
                        </div>
                    </div>
                    
                    <div className="summary-card total-orders">
                        <div className="card-icon">
                            <i className="fas fa-shopping-cart"></i>
                        </div>
                        <div className="card-info">
                            <h3>Total Orders</h3>
                            <p className="card-value">{revenueData?.orderCount || 0}</p>
                            <span className="card-period">{getFilterLabel()}</span>
                        </div>
                    </div>
                    
                    <div className="summary-card avg-order">
                        <div className="card-icon">
                            <i className="fas fa-chart-line"></i>
                        </div>
                        <div className="card-info">
                            <h3>Average Order Value</h3>
                            <p className="card-value">
                                {formatPrice((revenueData?.totalRevenue || 0) / (revenueData?.orderCount || 1))}
                            </p>
                            <span className="card-period">{getFilterLabel()}</span>
                        </div>
                    </div>
                </div>

                {/* No data message when both revenue and orders are zero */}
                {(!revenueData || (revenueData.totalRevenue === 0 && revenueData.orderCount === 0)) && (
                    <div className="no-data-message" style={{ 
                        textAlign: 'center', 
                        padding: '3rem', 
                        background: 'white', 
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                        marginBottom: '1.5rem'
                    }}>
                        <i className="fas fa-chart-pie" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                        <h3 style={{ marginTop: '1rem', color: '#333' }}>No Revenue Data</h3>
                        <p style={{ color: '#666' }}>
                            No paid orders found for the selected period. Only orders with status PAID, COMPLETED, SUCCESS, or DELIVERED are counted in revenue.
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => setFilter('month')} className="admin-btn primary">
                                Try This Month
                            </button>
                            <button onClick={() => setFilter('week')} className="admin-btn primary">
                                Try This Week
                            </button>
                            <button onClick={() => setFilter('today')} className="admin-btn primary">
                                Try Today
                            </button>
                        </div>
                    </div>
                )}

                {/* Chart Section */}
                {revenueData?.dailyData && revenueData.dailyData.length > 0 && (
                    <div className="revenue-chart-section">
                        <h2>Daily Breakdown</h2>
                        <div className="chart-container">
                            <div className="chart-bars">
                                {revenueData.dailyData.map((day, index) => {
                                    const maxVal = revenueData.maxRevenue || Math.max(...revenueData.dailyData.map(d => d.total), 1);
                                    const heightPercent = (day.total / maxVal) * 100;
                                    return (
                                        <div key={index} className="chart-bar-item">
                                            <div className="chart-bar-wrapper">
                                                <div 
                                                    className="chart-bar"
                                                    style={{ 
                                                        height: `${Math.max(heightPercent, 4)}%`,
                                                        backgroundColor: '#CEABB1'
                                                    }}
                                                >
                                                    <span className="chart-tooltip">
                                                        {formatPrice(day.total)}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="chart-label">{day.label}</span>
                                            <span className="chart-value">{formatPrice(day.total)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Top Products Section */}
                {revenueData?.topProducts && revenueData.topProducts.length > 0 && (
                    <div className="top-products-section">
                        <h2>Top Selling Products</h2>
                        <div className="top-products-table">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Units Sold</th>
                                        <th>Revenue</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueData.topProducts.map((product, index) => (
                                        <tr key={index}>
                                            <td>
                                                <div className="product-info">
                                                    {product.image && (
                                                        <img src={product.image} alt={product.name} className="product-thumb" />
                                                    )}
                                                    <span>{product.name}</span>
                                                </div>
                                            </td>
                                            <td>{product.quantity}</td>
                                            <td>{formatPrice(product.revenue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Recent Transactions */}
                {revenueData?.recentOrders && revenueData.recentOrders.length > 0 && (
                    <div className="recent-transactions">
                        <h2>Recent Transactions</h2>
                        <div className="transactions-table">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Customer</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {revenueData.recentOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.orderNumber}</td>
                                            <td>{order.user?.name || 'Guest'}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{formatPrice(order.total)}</td>
                                            <td>
                                                <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Export Button */}
                <div className="export-section">
                    <button className="export-btn" onClick={() => {
                        console.log('Revenue data to export:', revenueData);
                        showInfo('Export functionality coming soon');
                    }}>
                        <i className="fas fa-download"></i>
                        Export Report
                    </button>
                </div>
            </main>
        </div>
    );
}

export default Revenue;