/**
 * PageLoader Component
 * Full-page loading state with animated logo and progress
 * Used as fallback for lazy-loaded routes
 */

import React from 'react';
import { motion } from 'framer-motion';
import './PageLoader.scss';

const PageLoader = ({ message = 'Loading...' }) => {
    return (
        <div className="page-loader">
            <div className="page-loader__content">
                {/* Animated Logo/Brand Mark */}
                <motion.div
                    className="page-loader__logo"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.div
                        className="logo-circle"
                        animate={{
                            rotate: 360,
                            borderColor: ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#4CAF50']
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                            borderColor: { duration: 4, repeat: Infinity, ease: 'easeInOut' }
                        }}
                    />
                    <motion.span
                        className="logo-text"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        EKD
                    </motion.span>
                </motion.div>

                {/* Loading Dots */}
                <motion.div
                    className="page-loader__dots"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.span
                            key={i}
                            className="dot"
                            animate={{
                                y: [0, -8, 0],
                                opacity: [0.4, 1, 0.4]
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.15,
                                ease: 'easeInOut'
                            }}
                        />
                    ))}
                </motion.div>

                {/* Message */}
                <motion.p
                    className="page-loader__message"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    {message}
                </motion.p>

                {/* Progress Bar */}
                <motion.div
                    className="page-loader__progress"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <motion.div
                        className="progress-bar"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default PageLoader;
