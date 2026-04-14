import { useState, useEffect } from 'react';
import { adminService } from '../../../services/adminService';
import Sidebar from '../../../components/admin/Sidebar';
import DataTable from '../../../components/admin/DataTable';
import '../Admin.css';

function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0
    });

    // Add class to body to hide global header and footer
    useEffect(() => {
        document.body.classList.add('admin-page');
        return () => {
            document.body.classList.remove('admin-page');
        };
    }, []);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await adminService.getUsers();
            console.log('User response:', response); 
            
            if (response && response.success !== false) {
                 if (response.content) {
                    setUsers(response.content);
                    setPagination({
                        totalElements: response.totalElements || 0,
                        totalPages: response.totalPages || 0,
                        size: response.size || 10,
                        number: response.number || 0
                    });
                } 
                else if (response.data) {
                    setUsers(response.data.content || response.data);
                }
                else if (Array.isArray(response)) {
                    setUsers(response);
                }
                else {
                    setUsers([]);
                }
            } else {
                console.error('Failed to load users:', response?.message);
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to load users:', error);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (user, newRole) => {
        try {
            const response = await adminService.updateUserRole(user.id, newRole);
            if (response && response.success) {
                setUsers(prevUsers => 
                    prevUsers.map(u => 
                        u.id === user.id 
                            ? { ...u, role: newRole.toUpperCase() } 
                            : u
                    )
                );
            }
        } catch (error) {
            console.error('Failed to update user role:', error);
        }
    };

    const handleToggleStatus = async (user) => {
        const action = user.isActive === true ? 'suspend' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            try {
                const response = await adminService.toggleUserStatus(user.id);
                if (response && response.success) {
                    setUsers(prevUsers => 
                        prevUsers.map(u => 
                            u.id === user.id 
                                ? { ...u, isActive: !u.isActive } 
                                : u
                        )
                    );
                }
            } catch (error) {
                console.error('Failed to toggle user status:', error);
            }
        }
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-KE', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatPrice = (price) => {
        if (price === undefined || price === null) return 'KSh 0';
        return `KSh ${Number(price).toLocaleString()}`;
    };

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (value, user) => (
                <div className="user-info">
                    {user.profileImage && (
                        <img 
                            src={user.profileImage} 
                            alt={user.name} 
                            className="user-avatar"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '8px' }}
                        />
                    )}
                    <span>{value || '-'}</span>
                </div>
            )
        },
        {
            key: 'email',
            label: 'Email',
            render: (value) => value || '-'
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (value) => value || '-'
        },
        {
            key: 'role',
            label: 'Role',
            render: (role, user) => (
                <select
                    value={role ? role.toLowerCase() : 'user'}
                    onChange={(e) => handleRoleChange(user, e.target.value)}
                    className={`role-select role-${role ? role.toLowerCase() : 'user'}`}
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
            )
        },
        {
            key: 'orderCount',
            label: 'Orders',
            render: (value) => value || 0
        },
        {
            key: 'totalSpent',
            label: 'Total Spent',
            render: (value, user) => {
                if (value !== undefined) return formatPrice(value);
                return formatPrice(0);
            }
        },
        {
            key: 'createdAt',
            label: 'Joined',
            render: (date) => formatDate(date)
        },
        {
            key: 'isActive',
            label: 'Status',
            render: (isActive, user) => {
                const status = isActive === true ? 'active' : 'inactive';
                return (
                    <div className="status-control">
                        <span className={`status-badge ${status}`}>
                            {status}
                        </span>
                        <button
                            onClick={() => handleToggleStatus(user)}
                            className={`status-toggle ${status}`}
                            title={isActive ? 'Suspend User' : 'Activate User'}
                        >
                            <i className={`fas fa-${isActive ? 'ban' : 'check-circle'}`}></i>
                        </button>
                    </div>
                );
            }
        }
    ];

    if (loading) {
        return (
            <div className="admin-layout">
                <Sidebar />
                <main className="admin-main">
                    <div className="admin-loading">
                        <i className="fas fa-spinner fa-spin"></i>
                        <p>Loading users...</p>
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
                    <h1>User Management</h1>
                    <div className="user-stats">
                        <span className="stat-badge">
                            Total Users: {pagination.totalElements}
                        </span>
                    </div>
                </div>

                {users.length === 0 ? (
                    <div className="empty-state">
                        <i className="fas fa-users"></i>
                        <p>No users found</p>
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={users}
                        actions={false}
                    />
                )}
            </main>
        </div>
    );
}

export default UserManagement;