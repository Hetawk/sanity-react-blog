/**
 * Badge Component
 * Small status indicator or label
 * 
 * Usage:
 * <Badge variant="success">Active</Badge>
 * <Badge variant="warning" icon="⚠️">Pending</Badge>
 * <Badge variant="primary" dot>New</Badge>
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Badge.scss';

const Badge = ({
    children,
    variant = 'default',
    size = 'medium',
    icon = null,
    dot = false,
    className = ''
}) => {
    return (
        <motion.span
            className={`app__badge app__badge--${variant} app__badge--${size} ${className}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
            {dot && <span className="app__badge-dot" />}
            {icon && <span className="app__badge-icon">{icon}</span>}
            <span className="app__badge-text">{children}</span>
        </motion.span>
    );
};

export default Badge;
