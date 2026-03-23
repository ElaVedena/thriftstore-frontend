import { NavLink } from 'react-router-dom';
import '../../components/css/Sidebar.css';

function Sidebar() {
    const menuItems = [
        {
            path: '/admin',
            icon: 'fas fa-chart-pie',
            label: 'Dashboard'
        },
        {
            path: '/admin/products',
            icon: 'fas fa-box',
            label: 'Products'
        },
        {
            path: '/admin/orders',
            icon: 'fas fa-shopping-cart',
            label: 'Orders'
        },
        {
            path: '/admin/users',
            icon: 'fas fa-users',
            label: 'Users'
        },
        {
            path: '/admin/revenue',
            icon: 'fas fa-chart-line',
            label: 'Revenue'
        }
    ];

    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <h2>VedaThrifts</h2>
                <p>Admin Panel</p>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => 
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                        end={item.path === '/admin'}
                    >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/" className="back-to-site">
                    <i className="fas fa-arrow-left"></i>
                    <span>Back to Site</span>
                </NavLink>
            </div>
        </aside>
    );
}

export default Sidebar;