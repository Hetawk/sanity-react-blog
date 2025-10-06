/**
 * Button Component
 * Reusable button with multiple variants
 * 
 * Usage:
 * <Button variant="primary" size="medium" onClick={handleClick}>
 *   Click Me
 * </Button>
 * <Button variant="outline" icon="🚀" loading>Loading...</Button>
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Button.scss';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    icon = null,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    onClick,
    className = ''
}) => {
    const buttonClasses = [
        'app__button',
        `app__button--${variant}`,
        `app__button--${size}`,
        fullWidth && 'app__button--full-width',
        loading && 'app__button--loading',
        className
    ].filter(Boolean).join(' ');

    return (
        <motion.button
            className={buttonClasses}
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
            whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        >
            {loading ? (
                <>
                    <span className="app__button-spinner" />
                    <span className="app__button-text">Loading...</span>
                </>
            ) : (
                <>
                    {icon && iconPosition === 'left' && (
                        <span className="app__button-icon app__button-icon--left">
                            {icon}
                        </span>
                    )}
                    <span className="app__button-text">{children}</span>
                    {icon && iconPosition === 'right' && (
                        <span className="app__button-icon app__button-icon--right">
                            {icon}
                        </span>
                    )}
                </>
            )}
        </motion.button>
    );
};

export default Button;
