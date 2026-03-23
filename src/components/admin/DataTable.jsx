import { useState } from 'react';
import '../../components/css/DataTable.css';

function DataTable({ 
    columns = [], 
    data = [], 
    onEdit, 
    onDelete, 
    onView,
    actions = true,
    isLoading = false,
    emptyMessage = "No data available"
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Safety check for data
    const safeData = Array.isArray(data) ? data : [];
    
    // Safety check for columns
    const safeColumns = Array.isArray(columns) ? columns : [];

    // Filter data based on search
    const filteredData = safeData.filter(item => {
        if (!searchTerm || !item) return true;
        
        try {
            return Object.values(item).some(value =>
                value && String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        } catch (error) {
            console.error('Error filtering data:', error);
            return true;
        }
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="data-table-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading data...</p>
            </div>
        );
    }

    // Empty state
    if (safeData.length === 0) {
        return (
            <div className="data-table-empty">
                <i className="fas fa-database"></i>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-container">
            <div className="table-header">
                <div className="search-box">
                    <i className="fas fa-search"></i>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                            className="clear-search"
                            onClick={() => setSearchTerm('')}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    )}
                </div>
                <div className="table-info">
                    Showing {filteredData.length} of {safeData.length} entries
                </div>
            </div>

            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            {safeColumns.map(col => (
                                <th key={col.key || col.field}>{col.label || col.key}</th>
                            ))}
                            {actions && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentItems.length > 0 ? (
                            currentItems.map((item, index) => (
                                <tr key={item.id || index}>
                                    {safeColumns.map(col => (
                                        <td key={col.key || col.field}>
                                            {col.render ? 
                                                col.render(item[col.key] || item[col.field], item) : 
                                                item[col.key] || item[col.field] || '-'}
                                        </td>
                                    ))}
                                    {actions && (
                                        <td className="actions">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(item)}
                                                    className="action-btn view"
                                                    title="View"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="action-btn edit"
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="action-btn delete"
                                                    title="Delete"
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td 
                                    colSpan={safeColumns.length + (actions ? 1 : 0)} 
                                    className="no-results"
                                >
                                    <i className="fas fa-search"></i>
                                    <p>No matching records found</p>
                                    {searchTerm && (
                                        <button 
                                            className="clear-search-btn"
                                            onClick={() => setSearchTerm('')}
                                        >
                                            Clear Search
                                        </button>
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="table-pagination">
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                    >
                        <i className="fas fa-chevron-left"></i>
                        Previous
                    </button>
                    
                    <div className="page-numbers">
                        {[...Array(totalPages)].map((_, i) => {
                            const pageNum = i + 1;
                            // Show current page, first, last, and pages around current
                            if (
                                pageNum === 1 ||
                                pageNum === totalPages ||
                                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            } else if (
                                pageNum === currentPage - 2 ||
                                pageNum === currentPage + 2
                            ) {
                                return <span key={pageNum} className="page-dots">...</span>;
                            }
                            return null;
                        })}
                    </div>
                    
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
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

export default DataTable;