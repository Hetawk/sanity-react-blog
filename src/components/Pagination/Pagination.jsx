import React from 'react';
import './Pagination.scss';

/**
 * Reusable Pagination Component
 * Supports:
 * - Page size selection (15, 30, 50, 100)
 * - Previous/Next navigation
 * - Page number display
 * - Jump to first/last page
 */
const Pagination = ({
    currentPage,
    totalItems,
    pageSize,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [15, 30, 50, 100]
}) => {
    const totalPages = Math.ceil(totalItems / pageSize);
    const startItem = (currentPage - 1) * pageSize + 1;
    const endItem = Math.min(currentPage * pageSize, totalItems);

    const handlePrevious = () => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    };

    const handleFirst = () => {
        if (currentPage !== 1) {
            onPageChange(1);
        }
    };

    const handleLast = () => {
        if (currentPage !== totalPages) {
            onPageChange(totalPages);
        }
    };

    const handlePageSizeChange = (e) => {
        const newPageSize = parseInt(e.target.value);
        onPageSizeChange(newPageSize);
        // Reset to page 1 when changing page size
        onPageChange(1);
    };

    if (totalItems === 0) {
        return null;
    }

    return (
        <div className="pagination-container">
            <div className="pagination-info">
                <span className="pagination-text">
                    Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> items
                </span>
            </div>

            <div className="pagination-controls">
                {/* Page Size Selector */}
                <div className="page-size-selector">
                    <label htmlFor="pageSize">Items per page:</label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                        className="page-size-select"
                    >
                        {pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>

                {/* Navigation Buttons */}
                <div className="pagination-buttons">
                    <button
                        onClick={handleFirst}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        title="First page"
                    >
                        ⟪
                    </button>
                    <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="pagination-btn"
                        title="Previous page"
                    >
                        ‹ Previous
                    </button>

                    <span className="page-indicator">
                        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>

                    <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        title="Next page"
                    >
                        Next ›
                    </button>
                    <button
                        onClick={handleLast}
                        disabled={currentPage === totalPages}
                        className="pagination-btn"
                        title="Last page"
                    >
                        ⟫
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
