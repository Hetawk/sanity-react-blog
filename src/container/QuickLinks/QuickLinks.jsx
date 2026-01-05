import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    HiAcademicCap,
    HiCode,
    HiOfficeBuilding,
    HiDocumentText,
    HiStar,
    HiExternalLink,
    HiUserGroup,
    HiArrowRight,
    HiLockClosed
} from 'react-icons/hi';
import {
    FaGithub,
    FaLinkedin,
    FaOrcid,
    FaGraduationCap,
    FaFlask,
    FaBriefcase,
    FaAward
} from 'react-icons/fa';

import { AppWrap, MotionWrap } from '../../wrapper';
import './QuickLinks.scss';

// Using brand color throughout
const BRAND_COLOR = '#FF4C29';

const linkCategories = [
    {
        id: 'research',
        title: 'Research & Academic Work',
        subtitle: 'Publications, peer reviews & scholarly contributions',
        icon: <FaFlask />,
        links: [
            {
                name: 'ORCID Profile',
                url: 'https://orcid.org/0009-0005-5213-9834',
                description: 'Full scholarly record & peer reviews',
                icon: <FaOrcid />
            },
            {
                name: 'Publications & Reviews',
                url: '/#publications',
                description: 'Papers, articles & reviewer contributions',
                icon: <HiDocumentText />,
                isInternal: true
            },
            {
                name: 'Academic Journey',
                url: '/journey',
                description: 'Education & research timeline',
                icon: <FaGraduationCap />,
                isInternal: true
            }
        ]
    },
    {
        id: 'professional',
        title: 'Experience & Leadership',
        subtitle: 'Work, volunteer & community service',
        icon: <FaBriefcase />,
        links: [
            {
                name: 'Professional Journey',
                url: '/#expertise',
                description: 'Overview of all roles & positions',
                icon: <HiUserGroup />,
                isInternal: true
            },
            {
                name: 'Detailed Experiences',
                url: '/experiences',
                description: 'Full work & leadership history',
                icon: <FaBriefcase />,
                isInternal: true
            },
            {
                name: 'EKD Digital',
                url: 'https://www.ekddigital.com',
                description: 'Founder & technology ventures',
                icon: <HiOfficeBuilding />
            },
            {
                name: 'LinkedIn',
                url: 'https://www.linkedin.com/in/hetawk',
                description: 'Professional network',
                icon: <FaLinkedin />
            }
        ]
    },
    {
        id: 'technical',
        title: 'Technical Projects',
        subtitle: 'Skills, code & open-source contributions',
        icon: <HiCode />,
        links: [
            {
                name: 'Portfolio Projects',
                url: '/#work',
                description: 'Featured coding projects & demos',
                icon: <HiCode />,
                isInternal: true
            },
            {
                name: 'GitHub',
                url: 'https://github.com/Hetawk',
                description: 'Open-source contributions',
                icon: <FaGithub />,
                isPrivate: true
            }
        ]
    },
    {
        id: 'achievements',
        title: 'Awards & Recognition',
        subtitle: 'Scholarships, honors & certifications',
        icon: <FaAward />,
        links: [
            {
                name: 'Awards & Certifications',
                url: '/awards',
                description: 'Full gallery with documentation',
                icon: <HiStar />,
                isInternal: true
            },
            {
                name: 'Featured Honors',
                url: '/#award',
                description: 'Highlighted recognitions',
                icon: <HiAcademicCap />,
                isInternal: true
            }
        ]
    }
];
// Link component that handles both internal and external links
const LinkItem = ({ link, variants }) => {
    const linkProps = link.isInternal
        ? {}
        : { target: '_blank', rel: 'noopener noreferrer' };

    const Component = link.isInternal ? Link : 'a';
    const href = link.isInternal ? { to: link.url } : { href: link.url };

    return (
        <motion.div variants={variants}>
            <Component
                {...href}
                {...linkProps}
                className="link__item"
                style={{ display: 'flex' }}
            >
                <motion.div
                    className="link__item-inner"
                    whileHover={{
                        x: 8,
                        backgroundColor: `${BRAND_COLOR}15`
                    }}
                    whileTap={{ scale: 0.98 }}
                >
                    <div className="link__icon" style={{ color: BRAND_COLOR }}>
                        {link.icon}
                    </div>
                    <div className="link__content">
                        <span className="link__name">
                            {link.name}
                            {link.isPrivate && (
                                <span className="link__private" title="Some repos may be private">
                                    <HiLockClosed />
                                </span>
                            )}
                        </span>
                        <span className="link__description">{link.description}</span>
                    </div>
                    {!link.isInternal && <HiExternalLink className="link__external" />}
                    {link.isInternal && <HiArrowRight className="link__external" />}
                </motion.div>
            </Component>
        </motion.div>
    );
};

const QuickLinks = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const categoryVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: 'easeOut'
            }
        }
    };

    const linkVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.4
            }
        }
    };

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="quicklinks__header"
            >
                <h2 className="head-text">
                    <span>Quick</span> Links & <span>Resources</span>
                </h2>
                <p className="p-text quicklinks__subtitle">
                    Easily navigate to my research, projects, achievements, and professional work
                </p>
            </motion.div>

            <motion.div
                className="quicklinks__categories"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
            >
                {linkCategories.map((category) => (
                    <motion.div
                        key={category.id}
                        className="quicklinks__category"
                        variants={categoryVariants}
                        whileHover={{
                            y: -8,
                            boxShadow: `0 20px 40px ${BRAND_COLOR}25`
                        }}
                    >
                        <div
                            className="category__header"
                            style={{ '--category-color': BRAND_COLOR }}
                        >
                            <div className="category__icon">
                                {category.icon}
                            </div>
                            <div className="category__title-group">
                                <h3 className="category__title">{category.title}</h3>
                                <p className="category__subtitle">{category.subtitle}</p>
                            </div>
                        </div>

                        <motion.div
                            className="category__links"
                            variants={containerVariants}
                        >
                            {category.links.map((link, index) => (
                                <LinkItem
                                    key={index}
                                    link={link}
                                    variants={linkVariants}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                ))}
            </motion.div>

            <motion.div
                className="quicklinks__footer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                viewport={{ once: true }}
            >
                <Link to="/links" className="quicklinks__view-all">
                    <span>View Complete Resources Directory</span>
                    <HiArrowRight />
                </Link>
                <p className="p-text">
                    For collaboration or academic inquiries, reach out at{' '}
                    <a href="mailto:ekd@ekddigital.com">ekd@ekddigital.com</a>
                </p>
            </motion.div>
        </>
    );
};

export default AppWrap(
    MotionWrap(QuickLinks, 'app__quicklinks'),
    'links',
    'app__primarybg'
);
