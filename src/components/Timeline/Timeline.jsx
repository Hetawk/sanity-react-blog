/**
 * Timeline Component
 * Displays items in chronological order
 * 
 * Usage:
 * <Timeline items={timelineItems} variant="vertical" />
 * 
 * Item structure:
 * {
 *   date: '2023',
 *   title: 'Position Title',
 *   subtitle: 'Company Name',
 *   description: 'Job description',
 *   tags: ['tag1', 'tag2'],
 *   icon: '🎯',
 *   image: 'logo.png'
 * }
 */

import React from 'react';
import { motion } from 'framer-motion';
import './Timeline.scss';

const Timeline = ({
    items = [],
    variant = 'vertical',
    className = ''
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: {
            opacity: 0,
            x: variant === 'vertical' ? -20 : 0,
            y: variant === 'horizontal' ? 20 : 0
        },
        visible: {
            opacity: 1,
            x: 0,
            y: 0,
            transition: {
                duration: 0.5,
                ease: 'easeOut'
            }
        }
    };

    const dotVariants = {
        hidden: { scale: 0 },
        visible: {
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 200,
                damping: 15
            }
        }
    };

    return (
        <motion.div
            className={`app__timeline app__timeline--${variant} ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {items.map((item, index) => (
                <motion.div
                    key={index}
                    className="app__timeline-item"
                    variants={itemVariants}
                >
                    {/* Timeline line & dot */}
                    <div className="app__timeline-marker">
                        <motion.div
                            className="app__timeline-dot"
                            variants={dotVariants}
                        >
                            {item.icon && (
                                <span className="timeline-icon">{item.icon}</span>
                            )}
                        </motion.div>
                        {index < items.length - 1 && (
                            <div className="app__timeline-line" />
                        )}
                    </div>

                    {/* Content */}
                    <div className="app__timeline-content">
                        <div className="app__timeline-date">{item.date}</div>

                        {item.image && (
                            <div className="app__timeline-image">
                                <img src={item.image} alt={item.title} />
                            </div>
                        )}

                        <h3 className="app__timeline-title">{item.title}</h3>

                        {item.subtitle && (
                            <h4 className="app__timeline-subtitle">{item.subtitle}</h4>
                        )}

                        {item.description && (
                            <p className="app__timeline-description">{item.description}</p>
                        )}

                        {item.achievements && item.achievements.length > 0 && (
                            <ul className="app__timeline-achievements">
                                {item.achievements.map((achievement, i) => (
                                    <li key={i}>{achievement}</li>
                                ))}
                            </ul>
                        )}

                        {item.tags && item.tags.length > 0 && (
                            <div className="app__timeline-tags">
                                {item.tags.map((tag, i) => (
                                    <span key={i} className="timeline-tag">{tag}</span>
                                ))}
                            </div>
                        )}

                        {item.link && (
                            <a
                                href={item.link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="app__timeline-link"
                            >
                                {item.link.label || 'Learn More'} →
                            </a>
                        )}
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default Timeline;
