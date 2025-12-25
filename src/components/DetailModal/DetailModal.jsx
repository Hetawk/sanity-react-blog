import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoExpand, IoDownload, IoShareSocial } from 'react-icons/io5';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import MarkdownRenderer from '../MarkdownRenderer/MarkdownRenderer';
import './DetailModal.scss';

/**
 * Reusable Detail Modal Component
 * Used for viewing items in a larger, detailed view
 * 
 * @param {boolean} isOpen - Whether the modal is open
 * @param {function} onClose - Function to close the modal
 * @param {object} item - The item to display
 * @param {string} type - Type of item ('award', 'work', 'experience')
 * @param {function} onPrevious - Navigate to previous item (optional)
 * @param {function} onNext - Navigate to next item (optional)
 * @param {boolean} hasPrevious - Whether there's a previous item
 * @param {boolean} hasNext - Whether there's a next item
 */
const DetailModal = ({
    isOpen,
    onClose,
    item,
    type = 'award',
    onPrevious,
    onNext,
    hasPrevious = false,
    hasNext = false,
    renderCustomContent
}) => {
    // Handle keyboard navigation
    const handleKeyDown = React.useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) onPrevious();
        if (e.key === 'ArrowRight' && hasNext && onNext) onNext();
    }, [onClose, hasPrevious, hasNext, onPrevious, onNext]);

    // Manage body scroll lock - this runs even when modal is closed
    React.useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                // Restore scroll position
                const scrollY = document.body.style.top;
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, parseInt(scrollY || '0') * -1);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, handleKeyDown]);

    if (!isOpen || !item) return null;

    // Backdrop animation
    const backdropVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1 }
    };

    // Modal animation
    const modalVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 50
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 50,
            transition: {
                duration: 0.2
            }
        }
    };

    // Image animation
    const imageVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { delay: 0.1, duration: 0.3 }
        }
    };

    // Content animation
    const contentVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { delay: 0.2, duration: 0.3 }
        }
    };

    // Handle image download
    const handleDownload = () => {
        if (item.imgUrl) {
            const link = document.createElement('a');
            link.href = item.imgUrl;
            link.download = item.title || 'download';
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    // Handle share
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: item.description || item.title,
                    url: window.location.href
                });
            } catch (error) {
                console.log('Share failed:', error);
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
        }
    };

    // Render award-specific content
    const renderAwardContent = () => (
        <div className="detail-modal__content-body">
            {item.issuer && (
                <div className="detail-modal__meta-item">
                    <span className="label">Issued by</span>
                    <span className="value">{item.issuer}</span>
                </div>
            )}
            {(item.date || item.year) && (
                <div className="detail-modal__meta-item">
                    <span className="label">Date</span>
                    <span className="value">{item.date || item.year}</span>
                </div>
            )}
            {item.category && (
                <div className="detail-modal__meta-item">
                    <span className="label">Category</span>
                    <span className="value">{item.category}</span>
                </div>
            )}
            {item.level && (
                <div className="detail-modal__meta-item">
                    <span className="label">Level</span>
                    <span className="value">{item.level}</span>
                </div>
            )}
            {item.description && (
                <div className="detail-modal__description">
                    <h4>Description</h4>
                    <MarkdownRenderer content={item.description} />
                </div>
            )}
            {item.criteria && (
                <div className="detail-modal__description">
                    <h4>Award Criteria</h4>
                    <MarkdownRenderer content={item.criteria} />
                </div>
            )}
            {item.significance && (
                <div className="detail-modal__description">
                    <h4>Significance</h4>
                    <MarkdownRenderer content={item.significance} />
                </div>
            )}
            {item.link && (
                <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-modal__verify-link"
                >
                    Verify Award
                </a>
            )}
        </div>
    );

    // Render work-specific content
    const renderWorkContent = () => (
        <div className="detail-modal__content-body">
            {item.tags && item.tags.length > 0 && (
                <div className="detail-modal__tags">
                    {(Array.isArray(item.tags) ? item.tags : [item.tags]).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                    ))}
                </div>
            )}
            {item.description && (
                <div className="detail-modal__description">
                    <h4>About this Project</h4>
                    <MarkdownRenderer content={item.description} />
                </div>
            )}
            {item.role && (
                <div className="detail-modal__meta-item">
                    <span className="label">My Role</span>
                    <span className="value">{item.role}</span>
                </div>
            )}
            {item.duration && (
                <div className="detail-modal__meta-item">
                    <span className="label">Duration</span>
                    <span className="value">{item.duration}</span>
                </div>
            )}
            {item.impact && (
                <div className="detail-modal__description">
                    <h4>Impact</h4>
                    <MarkdownRenderer content={item.impact} />
                </div>
            )}
            <div className="detail-modal__links">
                {item.projectLink && (
                    <a href={item.projectLink} target="_blank" rel="noopener noreferrer" className="btn-primary">
                        View Project
                    </a>
                )}
                {item.codeLink && (
                    <a href={item.codeLink} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                        View Code
                    </a>
                )}
            </div>
        </div>
    );

    // Render experience-specific content
    const renderExperienceContent = () => (
        <div className="detail-modal__content-body">
            {item.company && (
                <div className="detail-modal__meta-item">
                    <span className="label">Company</span>
                    <span className="value">{item.company}</span>
                </div>
            )}
            {item.position && (
                <div className="detail-modal__meta-item">
                    <span className="label">Position</span>
                    <span className="value">{item.position}</span>
                </div>
            )}
            {item.duration && (
                <div className="detail-modal__meta-item">
                    <span className="label">Duration</span>
                    <span className="value">{item.duration}</span>
                </div>
            )}
            {item.location && (
                <div className="detail-modal__meta-item">
                    <span className="label">Location</span>
                    <span className="value">{item.location}</span>
                </div>
            )}
            {(item.desc || item.description) && (
                <div className="detail-modal__description">
                    <h4>Description</h4>
                    <MarkdownRenderer content={item.desc || item.description} />
                </div>
            )}
            {item.achievements && item.achievements.length > 0 && (
                <div className="detail-modal__achievements">
                    <h4>Key Achievements</h4>
                    <ul>
                        {(Array.isArray(item.achievements) ? item.achievements : JSON.parse(item.achievements || '[]')).map((achievement, index) => (
                            <li key={index}>{achievement}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    // Render content based on type
    const renderContent = () => {
        if (renderCustomContent) return renderCustomContent(item);

        switch (type) {
            case 'award':
                return renderAwardContent();
            case 'work':
                return renderWorkContent();
            case 'experience':
                return renderExperienceContent();
            default:
                return renderAwardContent();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="detail-modal__backdrop"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className={`detail-modal ${type}`}
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button className="detail-modal__close" onClick={onClose} aria-label="Close">
                            <IoClose />
                        </button>

                        {/* Navigation buttons */}
                        {(hasPrevious || hasNext) && (
                            <>
                                <button
                                    className={`detail-modal__nav detail-modal__nav--prev ${!hasPrevious ? 'disabled' : ''}`}
                                    onClick={onPrevious}
                                    disabled={!hasPrevious}
                                    aria-label="Previous"
                                >
                                    <HiChevronLeft />
                                </button>
                                <button
                                    className={`detail-modal__nav detail-modal__nav--next ${!hasNext ? 'disabled' : ''}`}
                                    onClick={onNext}
                                    disabled={!hasNext}
                                    aria-label="Next"
                                >
                                    <HiChevronRight />
                                </button>
                            </>
                        )}

                        {/* Content */}
                        <div className="detail-modal__container">
                            {/* Image section */}
                            {item.imgUrl && (
                                <motion.div
                                    className="detail-modal__image-section"
                                    variants={imageVariants}
                                >
                                    <img
                                        src={item.imgUrl}
                                        alt={item.title || 'Detail'}
                                        className="detail-modal__image"
                                    />
                                    <div className="detail-modal__image-actions">
                                        <button onClick={() => window.open(item.imgUrl, '_blank')} title="View Full Size">
                                            <IoExpand />
                                        </button>
                                        <button onClick={handleDownload} title="Download">
                                            <IoDownload />
                                        </button>
                                        <button onClick={handleShare} title="Share">
                                            <IoShareSocial />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Content section */}
                            <motion.div
                                className="detail-modal__content-section"
                                variants={contentVariants}
                            >
                                <h2 className="detail-modal__title">{item.title || item.name}</h2>
                                {renderContent()}
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DetailModal;
