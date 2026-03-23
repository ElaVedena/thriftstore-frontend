import '../../components/css/Pagination.css';

function Pagination({ currentPage, totalPages, onPageChange }) {
    const getPageNumbers = () => {
        const delta = 2; 
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="pagination">
            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
            >
                <i className="fas fa-chevron-left"></i>
            </button>

            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    className={`pagination-btn ${page === currentPage ? 'active' : ''} ${page === '...' ? 'dots' : ''}`}
                    onClick={() => typeof page === 'number' && onPageChange(page)}
                    disabled={page === '...'}
                >
                    {page}
                </button>
            ))}

            <button
                className="pagination-btn"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
}

export default Pagination;