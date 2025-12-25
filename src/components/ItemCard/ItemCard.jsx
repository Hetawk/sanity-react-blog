import React from 'react';
import { motion } from 'framer-motion';
import { AiFillEye } from 'react-icons/ai';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import './ItemCard.scss';

/**
 * Reusable Item Card Component
 * Used for displaying awards, works, experiences in a consistent style
 * 
 * @param {object} item - The item data to display
 * @param {string} type - Type of item ('award', 'work', 'experience')
 * @param {function} onClick - Click handler for the card
 * @param {number} index - Item index for staggered animations
 * @param {boolean} showDescription - Whether to show description preview
 */
const ItemCard = ({
    item,
    type = 'award',
    onClick,
    index = 0,
    showDescription = false,
    className = ''
}) => {
    // Animation variants
    const cardVariants = {
        hidden: {
            opacity: 0,
            y: 50,
            scale: 0.9
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.5,
                delay: index * 0.1,
                type: 'spring',
                stiffness: 100
            }
        }
    };

    // Render based on item type
    const renderAwardCard = () => (
        <>
            <div className="item-card__image-container">
                {item.imgUrl ? (
                    <img src={item.imgUrl} alt={item.title} loading="lazy" />
                ) : (
                    <div className="item-card__placeholder">
                        <span>🏆</span>
                    </div>
                )}
                <div className="item-card__overlay" onClick={onClick}>
                    <motion.div whileHover={{ scale: 1.1 }} className="item-card__view-btn">
                        <AiFillEye />
                        <span>View Details</span>
                    </motion.div>
                </div>
            </div>
            <div className="item-card__content">
                {(item.date || item.year) && (
                    <span className="item-card__badge">{item.date || item.year}</span>
                )}
                <h4 className="item-card__title">{item.title}</h4>
                {item.issuer && <p className="item-card__subtitle">{item.issuer}</p>}
                {showDescription && item.description && (
                    <div className="item-card__description">
                        <MarkdownRenderer content={item.description} maxLength={150} />
                    </div>
                )}
                {item.category && (
                    <span className="item-card__tag">{item.category}</span>
                )}
            </div>
        </>
    );

    const renderWorkCard = () => (
        <>
            <div className="item-card__image-container">
                {item.imgUrl ? (
                    <img src={item.imgUrl} alt={item.title} loading="lazy" />
                ) : (
                    <div className="item-card__placeholder work">
                        <span>💼</span>
                    </div>
                )}
                <div className="item-card__overlay" onClick={onClick}>
                    <motion.div whileHover={{ scale: 1.1 }} className="item-card__view-btn">
                        <AiFillEye />
                        <span>View Project</span>
                    </motion.div>
                </div>
            </div>
            <div className="item-card__content">
                <h4 className="item-card__title">{item.title}</h4>
                {showDescription && item.description && (
                    <div className="item-card__description">
                        <MarkdownRenderer content={item.description} maxLength={150} />
                    </div>
                )}
                {item.tags && item.tags.length > 0 && (
                    <div className="item-card__tags">
                        {(Array.isArray(item.tags) ? item.tags.slice(0, 3) : [item.tags]).map((tag, idx) => (
                            <span key={idx} className="item-card__tag">{tag}</span>
                        ))}
                        {item.tags.length > 3 && (
                            <span className="item-card__tag more">+{item.tags.length - 3}</span>
                        )}
                    </div>
                )}
            </div>
        </>
    );

    const renderExperienceCard = () => (
        <>
            <div className="item-card__image-container experience">
                {item.companyLogo || item.imgUrl ? (
                    <img src={item.companyLogo || item.imgUrl} alt={item.company} loading="lazy" />
                ) : (
                    <div className="item-card__placeholder experience">
                        <span>🏢</span>
                    </div>
                )}
                <div className="item-card__overlay" onClick={onClick}>
                    <motion.div whileHover={{ scale: 1.1 }} className="item-card__view-btn">
                        <AiFillEye />
                        <span>View Details</span>
                    </motion.div>
                </div>
            </div>
            <div className="item-card__content">
                {(item.year || item.duration) && (
                    <span className="item-card__badge">{item.year || item.duration}</span>
                )}
                <h4 className="item-card__title">{item.title || item.name || item.position}</h4>
                {item.company && <p className="item-card__subtitle">{item.company}</p>}
                {showDescription && (item.desc || item.description) && (
                    <div className="item-card__description">
                        <MarkdownRenderer content={item.desc || item.description} maxLength={150} />
                    </div>
                )}
                {item.employmentType && (
                    <span className="item-card__tag">{item.employmentType}</span>
                )}
            </div>
        </>
    );

    const renderContent = () => {
        switch (type) {
            case 'award':
                return renderAwardCard();
            case 'work':
                return renderWorkCard();
            case 'experience':
                return renderExperienceCard();
            default:
                return renderAwardCard();
        }
    };

    return (
        <motion.div
            className={`item-card ${type} ${className}`}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ y: -8 }}
            transition={{ type: 'spring', stiffness: 300 }}
        >
            {renderContent()}
        </motion.div>
    );
};

export default ItemCard;