/**
 * Reusable Filter Bar Component
 * DRY principle - single filter component for all filtered lists
 */
import React from 'react';
import { motion } from 'framer-motion';
import './FilterBar.scss';

const FilterBar = ({
    filters = [],
    activeFilter,
    onFilterChange,
    showSearch = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
    sortOptions = [],
    sortValue,
    onSortChange,
    className = '',
}) => {
    return (
        <div className={`app__filter-bar ${className}`}>
            {/* Search */}
            {showSearch && (
                <div className="app__filter-search">
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => onSearchChange?.(e.target.value)}
                        className="app__filter-search-input"
                    />
                    <span className="app__filter-search-icon">🔍</span>
                </div>
            )}

            {/* Filter Buttons */}
            {filters.length > 0 && (
                <div className="app__filter-buttons">
                    {filters.map((filter, index) => (
                        <motion.button
                            key={index}
                            className={`app__filter-button ${activeFilter === filter.value ? 'active' : ''
                                }`}
                            onClick={() => onFilterChange?.(filter.value)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {filter.icon && <span className="filter-icon">{filter.icon}</span>}
                            {filter.label}
                            {filter.count !== undefined && (
                                <span className="filter-count">{filter.count}</span>
                            )}
                        </motion.button>
                    ))}
                </div>
            )}

            {/* Sort Dropdown */}
            {sortOptions.length > 0 && (
                <div className="app__filter-sort">
                    <label htmlFor="sort-select">Sort by:</label>
                    <select
                        id="sort-select"
                        value={sortValue}
                        onChange={(e) => onSortChange?.(e.target.value)}
                        className="app__filter-sort-select"
                    >
                        {sortOptions.map((option, index) => (
                            <option key={index} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
