/**
 * EmptyState Component
 * Displayed when there's no data to show
 * 
 * Usage:
 * <EmptyState 
 *   icon="📭"
 *   title="No items found"
 *   message="Try adjusting your filters"
 *   action={{ label: "Reset Filters", onClick: handleReset }}
 * />
 */

import React from 'react';
import { motion } from 'framer-motion';
import './EmptyState.scss';

const EmptyState = ({
    icon = '📭',
    title = 'No data found',
    message = '',
    action = null,
    variant = 'default',
    className = ''
}) => {
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut'
            }
        }
    };

    const iconVariants = {
        hidden: { scale: 0, rotate: -180 },
        visible: {
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring',
                stiffness: 200,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            className={`app__empty-state app__empty-state--${variant} ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                className="app__empty-state-icon"
                variants={iconVariants}
            >
                {icon}
            </motion.div>

            <h3 className="app__empty-state-title">{title}</h3>

            {message && (
                <p className="app__empty-state-message">{message}</p>
            )}

            {action && (
                <motion.button
                    className="app__empty-state-action"
                    onClick={action.onClick}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    {action.label}
                </motion.button>
            )}
        </motion.div>
    );
};

export default EmptyState;
