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
    const [showCustomPicker, setShowCustomPicker] = useState(false);
    const [rawResponse, setRawResponse] = useState(null);
    const [orderCount, setOrderCount] = useState(0);
    const { showError, showInfo } = useNotification();

    useEffect(() => {
        loadRevenueData();
    }, [filter]);

    // Also load orders count separately for debugging
    useEffect(() => {
        loadOrdersCount();
    }, []);

    const loadOrdersCount = async () => {
        try {
            const response = await adminService.getOrders();
            console.log('Total orders response:', response);
            if (response.success) {
                const orders = response.data?.content || response.data || [];
                setOrderCount(orders.length);
                console.log('Total orders in system:', orders.length);
            }
        } catch (error) {
            console.error('Error loading orders count:', error);
        }
    };

    const loadRevenueData = async () => {
        setLoading(true);
        try {
            let response;
            if (filter === 'custom' && customStartDate && customEndDate) {
                response = await adminService.getRevenueStatsByDateRange(customStartDate, customEndDate);
            } else {
                response = await adminService.getRevenueStats(filter);
            }
            
            console.log('Revenue response (raw):', response);
            setRawResponse(response);
            
            if (response.success) {
                // Handle different response structures
                let data = response.data;
                
                // Log the actual data structure
                console.log('Data structure:', data);
                console.log('Data keys:', data ? Object.keys(data) : 'null');
                
                // If data is wrapped in a data property
                if (data && data.data) {
                    console.log('Data is wrapped in data.data');
                    data = data.data;
                }
                
                // If the response has a success flag
                if (data && data.success !== undefined) {
                    console.log('Data has success flag');
                    data = data.data || data;
                }
                
                // Check if we have the expected fields
                console.log('Final data object:', data);
                console.log('totalRevenue:', data?.totalRevenue);
                console.log('orderCount:', data?.orderCount);
                console.log('totalOrders:', data?.totalOrders);
                console.log('ordersCount:', data?.ordersCount);
                
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
                
                console.log('Formatted revenue data:', formattedData);
                console.log('Revenue amount:', formattedData.totalRevenue);
                console.log('Order count:', formattedData.orderCount);
                
                setRevenueData(formattedData);
                
                if (formattedData.totalRevenue === 0 && formattedData.orderCount === 0) {
                    showInfo('No revenue data found for the selected period. Total orders in system: ' + orderCount);
                }
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
                    <p>Track your sales and revenue performance</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                        <button 
                            onClick={loadOrdersCount} 
                            className="admin-btn secondary"
                        >
                            <i className="fas fa-sync"></i>
                            Refresh Orders Count ({orderCount})
                        </button>
                        <button 
                            onClick={() => {
                                console.log('Raw response:', rawResponse);
                                alert('Check console for raw response data');
                            }} 
                            className="admin-btn secondary"
                        >
                            <i className="fas fa-bug"></i>
                            Debug Data
                        </button>
                    </div>
                </div>

                {/* Debug Info - Show raw data */}
                {rawResponse && (
                    <div className="debug-panel" style={{ 
                        background: '#f8f9fa', 
                        padding: '1rem', 
                        borderRadius: '4px', 
                        marginBottom: '1rem',
                        border: '1px solid #dee2e6',
                        maxHeight: '200px',
                        overflow: 'auto'
                    }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Debug Information:</h4>
                        <div style={{ fontSize: '0.75rem', color: '#666' }}>
                            <div><strong>Total Orders in System:</strong> {orderCount}</div>
                            <div><strong>Filter:</strong> {getFilterLabel()}</div>
                            <div><strong>Revenue Data:</strong> {revenueData ? 'Loaded' : 'Empty'}</div>
                            {revenueData && (
                                <>
                                    <div><strong>Revenue Amount:</strong> {formatPrice(revenueData.totalRevenue)}</div>
                                    <div><strong>Order Count (filtered):</strong> {revenueData.orderCount}</div>
                                    <div><strong>Daily Data Points:</strong> {revenueData.dailyData?.length || 0}</div>
                                    <div><strong>Recent Orders:</strong> {revenueData.recentOrders?.length || 0}</div>
                                </>
                            )}
                            <div><strong>Raw Response Keys:</strong> {rawResponse.data ? Object.keys(rawResponse.data).join(', ') : 'No data'}</div>
                        </div>
                    </div>
                )}

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
                            {orderCount > 0 
                                ? `There are ${orderCount} orders in the system but no revenue data for the selected period. Try changing the filter or checking the backend.`
                                : 'No orders found in the system. Orders need to be PAID to show in revenue.'
                            }
                        </p>
                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <button onClick={() => setFilter('month')} className="admin-btn primary">
                                Try This Month
                            </button>
                            <button onClick={() => setFilter('week')} className="admin-btn primary">
                                Try This Week
                            </button>
                            <button onClick={() => setFilter('all')} className="admin-btn primary">
                                Try All Time
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