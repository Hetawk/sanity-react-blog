import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HiArrowRight } from 'react-icons/hi';
import './ViewAllButton.scss';

/**
 * Reusable View All Button Component
 * Links to a dedicated section page
 * 
 * @param {string} to - Route path to navigate to
 * @param {string} label - Button label (default: "View All")
 * @param {number} count - Optional count to display
 * @param {string} variant - Button style variant ('primary', 'secondary', 'outline')
 */
const ViewAllButton = ({
    to,
    label = 'View All',
    count,
    variant = 'primary',
    className = ''
}) => {
    return (
        <motion.div 
            className={`view-all-btn-wrapper ${className}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
        >
            <Link 
                to={to}
                className={`view-all-btn ${variant}`}
                style={{
                    textDecoration: 'none',
                    color: variant === 'primary' ? '#FFFFFF' : 'var(--secondary-color)',
                    backgroundColor: variant === 'primary' ? '#FF4C29' : 'transparent',
                    borderColor: '#FF4C29'
                }}
            >
                <span className="view-all-btn__text">
                    {label}
                    {count !== undefined && (
                        <span className="view-all-btn__count">({count})</span>
                    )}
                </span>
                <motion.span 
                    className="view-all-btn__icon"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                >
                    <HiArrowRight />
                </motion.span>
            </Link>
        </motion.div>
    );
};

export default ViewAllButton;