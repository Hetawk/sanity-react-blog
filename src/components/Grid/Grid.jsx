/**
 * Reusable Grid Component
 * DRY principle - single grid layout for all list views
 */
import React from 'react';
import { motion } from 'framer-motion';
import './Grid.scss';

const Grid = ({
    children,
    columns = 3, // 1, 2, 3, 4
    gap = 'medium', // small, medium, large
    className = '',
    variant = 'default', // default, masonry, auto-fit
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    return (
        <motion.div
            className={`app__grid app__grid--${columns}-col app__grid--gap-${gap} app__grid--${variant} ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {children}
        </motion.div>
    );
};

export default Grid;
