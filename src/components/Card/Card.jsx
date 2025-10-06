/**
 * Reusable Card Component
 * Follows DRY principle - single card component for all content types
 */
import React from 'react';
import { motion } from 'framer-motion';
import './Card.scss';

const Card = ({
    image,
    title,
    subtitle,
    description,
    tags = [],
    badge,
    link,
    onLike,
    likes,
    featured,
    onClick,
    className = '',
    variant = 'default', // default, compact, featured, minimal
    children,
    footer,
    actions,
}) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
        hover: {
            y: -5,
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            transition: { duration: 0.3 },
        },
    };

    return (
        <motion.div
            className={`app__card app__card--${variant} ${className} ${featured ? 'app__card--featured' : ''}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            onClick={onClick}
        >
            {/* Featured Badge */}
            {featured && (
                <div className="app__card-badge app__card-badge--featured">
                    ⭐ Featured
                </div>
            )}

            {/* Custom Badge */}
            {badge && (
                <div className={`app__card-badge app__card-badge--${badge.type || 'default'}`}>
                    {badge.text}
                </div>
            )}

            {/* Image */}
            {image && (
                <div className="app__card-image">
                    <img src={image} alt={title} loading="lazy" />
                    {link && (
                        <div className="app__card-overlay">
                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="app__card-link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                View Project →
                            </a>
                        </div>
                    )}
                </div>
            )}

            {/* Content */}
            <div className="app__card-content">
                {/* Title */}
                {title && (
                    <h3 className="app__card-title">
                        {title}
                    </h3>
                )}

                {/* Subtitle */}
                {subtitle && (
                    <p className="app__card-subtitle">{subtitle}</p>
                )}

                {/* Description */}
                {description && (
                    <p className="app__card-description">{description}</p>
                )}

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="app__card-tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="app__card-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* Children (custom content) */}
                {children}
            </div>

            {/* Footer */}
            {(footer || likes !== undefined || actions) && (
                <div className="app__card-footer">
                    {/* Like Button */}
                    {likes !== undefined && (
                        <button
                            className="app__card-like"
                            onClick={(e) => {
                                e.stopPropagation();
                                onLike?.();
                            }}
                        >
                            ❤️ {likes}
                        </button>
                    )}

                    {/* Custom Footer */}
                    {footer}

                    {/* Actions */}
                    {actions && (
                        <div className="app__card-actions">
                            {actions}
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};

export default Card;
