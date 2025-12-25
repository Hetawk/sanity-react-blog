import React from 'react';

import {
    Link
}

from 'react-router-dom';

import {
    motion
}

from 'framer-motion';

import {
    HiArrowLeft
}

from 'react-icons/hi';

import Navbar from '../Navbar/Navbar';
import './SectionPage.scss';

/**
 * Reusable Section Page Layout Component
 * Provides consistent layout for dedicated section pages (Awards, Works, Experiences)
 * 
 * @param {string} title - Page title
 * @param {string} subtitle - Page subtitle/description
 * @param {ReactNode} children - Page content
 * @param {string} backgroundClass - Background style class
 * @param {ReactNode} filters - Optional filter components
 * @param {ReactNode} headerActions - Optional header action buttons
 */
const SectionPage=( {
        title,
        subtitle,
        children,
        backgroundClass='app__whitebg',
        filters,
        headerActions,
        showBackButton=true
    }

)=> {

    // Animation variants
    const headerVariants= {
        hidden: {
            opacity: 0, y: -30
        }

        ,
        visible: {

            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                    ease: 'easeOut'
            }
        }
    }

    ;

    const contentVariants= {
        hidden: {
            opacity: 0
        }

        ,
        visible: {

            opacity: 1,
            transition: {
                duration: 0.5,
                    delay: 0.3
            }
        }
    }

    ;

    return (<div className= {
            `section-page $ {
                backgroundClass
            }

            `
        }

        > <Navbar /> <div className="section-page__container"> {
            /* Header */
        }

        <motion.header className="section-page__header"

        variants= {
            headerVariants
        }

        initial="hidden"
        animate="visible"

        > {
            showBackButton && (<Link to="/"className="section-page__back-btn"> <HiArrowLeft /> <span>Back to Home</span> </Link>)
        }

        <div className="section-page__header-content"> <div className="section-page__titles"> <h1 className="section-page__title"> {
            title
        }

        </h1> {
            subtitle && <p className="section-page__subtitle"> {
                subtitle
            }

            </p>
        }

        </div> {
            headerActions && (<div className="section-page__header-actions"> {
                    headerActions
                }

                </div>)
        }

        </div> {
            filters && (<div className="section-page__filters"> {
                    filters
                }

                </div>)
        }

        </motion.header> {
            /* Content */
        }

        <motion.main className="section-page__content"

        variants= {
            contentVariants
        }

        initial="hidden"
        animate="visible"

        > {
            children
        }

        </motion.main> {
            /* Footer */
        }

        <footer className="section-page__footer"> <p>&copy; {
            new Date().getFullYear()
        }

        Portfolio. All rights reserved.</p> </footer> </div> </div>);
}

;

export default SectionPage;