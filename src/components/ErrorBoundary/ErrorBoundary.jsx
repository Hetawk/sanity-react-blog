/**
 * ErrorBoundary Component
 * Catches React errors and displays fallback UI
 * 
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */

import React from 'react';
import { motion } from 'framer-motion';
import './ErrorBoundary.scss';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error,
            errorInfo
        });

        // Log error to error reporting service
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // You can also send to error reporting service like Sentry
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const { fallback } = this.props;

            // Custom fallback UI
            if (fallback) {
                return fallback;
            }

            // Default error UI
            return (
                <motion.div
                    className="app__error-boundary"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="app__error-boundary-content">
                        <motion.div
                            className="app__error-boundary-icon"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                        >
                            ⚠️
                        </motion.div>

                        <h2 className="app__error-boundary-title">
                            Oops! Something went wrong
                        </h2>

                        <p className="app__error-boundary-message">
                            We're sorry for the inconvenience. An unexpected error has occurred.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <details className="app__error-boundary-details">
                                <summary>Error Details</summary>
                                <div className="error-stack">
                                    <strong>{this.state.error.toString()}</strong>
                                    <pre>{this.state.errorInfo?.componentStack}</pre>
                                </div>
                            </details>
                        )}

                        <div className="app__error-boundary-actions">
                            <motion.button
                                className="app__error-boundary-button app__error-boundary-button--primary"
                                onClick={this.handleReset}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Try Again
                            </motion.button>

                            <motion.button
                                className="app__error-boundary-button app__error-boundary-button--secondary"
                                onClick={this.handleReload}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Reload Page
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
