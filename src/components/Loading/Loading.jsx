/**
 * Loading Component
 * Reusable loading states with multiple variants
 * 
 * Variants:
 * - spinner: Animated spinner (default)
 * - skeleton: Content placeholder skeletons
 * - pulse: Pulsing placeholder
 * - dots: Three animated dots
 * - overlay: Full-page loading overlay
 * 
 * Usage:
 * <Loading variant="spinner" size="medium" />
 * <Loading variant="skeleton" count={3} />
 * <Loading variant="overlay" message="Loading content..." />
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Loading.scss';

const Loading = ({
    variant = 'spinner',
    size = 'medium',
    count = 1,
    message = '',
    overlay = false,
    className = ''
}) => {
    // Spinner variants
    const spinnerVariants = {
        spinner: {
            rotate: 360,
            transition: {
                duration: 1,
                repeat: Infinity,
                ease: 'linear'
            }
        }
    };

    // Pulse variants
    const pulseVariants = {
        pulse: {
            opacity: [0.5, 1, 0.5],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    // Dots variants
    const dotsContainerVariants = {
        start: {
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const dotVariants = {
        start: {
            y: [0, -10, 0],
            transition: {
                duration: 0.6,
                repeat: Infinity,
                ease: 'easeInOut'
            }
        }
    };

    // Render spinner
    const renderSpinner = () => (
        <motion.div
            className={`app__loading-spinner app__loading-spinner--${size}`}
            variants={spinnerVariants}
            animate="spinner"
        />
    );

    // Render skeleton
    const renderSkeleton = () => (
        <div className="app__loading-skeleton">
            {[...Array(count)].map((_, index) => (
                <motion.div
                    key={index}
                    className="app__loading-skeleton-item"
                    variants={pulseVariants}
                    animate="pulse"
                    style={{ animationDelay: `${index * 0.2}s` }}
                >
                    <div className="skeleton-image" />
                    <div className="skeleton-content">
                        <div className="skeleton-title" />
                        <div className="skeleton-text" />
                        <div className="skeleton-text" />
                    </div>
                </motion.div>
            ))}
        </div>
    );

    // Render pulse
    const renderPulse = () => (
        <motion.div
            className={`app__loading-pulse app__loading-pulse--${size}`}
            variants={pulseVariants}
            animate="pulse"
        />
    );

    // Render dots
    const renderDots = () => (
        <motion.div
            className="app__loading-dots"
            variants={dotsContainerVariants}
            animate="start"
        >
            {[0, 1, 2].map((index) => (
                <motion.span
                    key={index}
                    className="app__loading-dot"
                    variants={dotVariants}
                />
            ))}
        </motion.div>
    );

    // Main content based on variant
    const renderContent = () => {
        switch (variant) {
            case 'skeleton':
                return renderSkeleton();
            case 'pulse':
                return renderPulse();
            case 'dots':
                return renderDots();
            default:
                return renderSpinner();
        }
    };

    // Overlay wrapper
    if (overlay || variant === 'overlay') {
        return (
            <div className={`app__loading-overlay ${className}`}>
                <div className="app__loading-overlay-content">
                    {renderSpinner()}
                    {message && <p className="app__loading-message">{message}</p>}
                </div>
            </div>
        );
    }

    // Regular loading
    return (
        <div className={`app__loading app__loading--${variant} ${className}`}>
            {renderContent()}
            {message && <p className="app__loading-message">{message}</p>}
        </div>
    );
};

export default Loading;
