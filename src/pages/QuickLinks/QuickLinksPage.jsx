import React from 'react';

import {
    motion
}

    from 'framer-motion';

import {
    Link
}

    from 'react-router-dom';

import {
    HiAcademicCap,
    HiCode,
    HiOfficeBuilding,
    HiDocumentText,
    HiStar,
    HiGlobe,
    HiExternalLink,
    HiArrowLeft,
    HiArrowRight,
    HiUserGroup,
    HiInformationCircle,
    HiLockClosed
}

    from 'react-icons/hi';

import {
    FaGithub,
    FaLinkedin,
    FaOrcid,
    FaGraduationCap,
    FaFlask,
    FaBriefcase,
    FaAward
}

    from 'react-icons/fa';

import {
    Navbar
}

    from '../../components';
import './QuickLinksPage.scss';

const linkCategories = [{

    id: 'research',
    title: 'Research & Academic Work',
    icon: <FaFlask />,
    content: 'My research journey spans applied machine learning, natural language processing, and human-computer interaction. I am actively contributing to the academic community not just through publications, but also as a peer reviewer for academic journals, helping to maintain the quality and rigor of scholarly work in my field.',
    links: [{
        name: 'ORCID Research Profile',
        url: 'https://orcid.org/0009-0005-5213-9834',
        description: 'My complete scholarly record including co-authored publications and peer review contributions for academic journals.',
        icon: <FaOrcid />
    }

        ,
    {
        name: 'Publications & Peer Reviews',
        url: '/#publications',
        description: 'Research papers, conference proceedings, peer review activities, and education history fetched directly from ORCID.',
        icon: <HiDocumentText />,
        isInternal: true
    }

        ,
    {
        name: 'Academic Journey',
        url: '/journey',
        description: 'A timeline of my educational background, from foundational studies to graduate research.',
        icon: <FaGraduationCap />,
        isInternal: true
    }

    ]
}

    ,
{

    id: 'experience',
    title: 'Professional Experience & Leadership',
    icon: <FaBriefcase />,
    content: 'My professional journey encompasses software engineering roles, entrepreneurship, community leadership, and volunteer service. From leading development teams to organizing community initiatives, each experience has shaped my approach to problem-solving and collaboration. I believe in giving back through volunteer work and mentoring the next generation of technologists.',
    links: [{
        name: 'Professional Overview',
        url: '/#expertise',
        description: 'A summary of my professional roles including work experience, volunteer positions, and leadership responsibilities.',
        icon: <HiUserGroup />,
        isInternal: true
    }

        ,
    {
        name: 'Detailed Experience Gallery',
        url: '/experiences',
        description: 'In-depth information about each engagement, including responsibilities and achievements.',
        icon: <FaBriefcase />,
        isInternal: true
    }

        ,
    {
        name: 'LinkedIn Profile',
        url: 'https://www.linkedin.com/in/hetawk',
        description: 'Connect with me professionally. View endorsements, recommendations, and career updates.',
        icon: <FaLinkedin />
    }

    ]
}

    ,
{

    id: 'technical',
    title: 'Technical Projects & Code',
    icon: <HiCode />,
    content: 'With expertise spanning full-stack development, machine learning, and cloud architecture, I build solutions that bridge research and real-world applications. My projects range from AI-powered tools to enterprise software systems. I\'m passionate about open-source development and believe in sharing knowledge with the developer community.',
    links: [{
        name: 'Portfolio Projects',
        url: '/#work',
        description: 'Featured projects showcasing machine learning, web development, and software engineering.',
        icon: <HiCode />,
        isInternal: true
    }

        ,
    {
        name: 'GitHub (Personal)',
        url: 'https://github.com/Hetawk',
        description: 'My personal GitHub featuring open-source contributions and experimental projects.',
        icon: <FaGithub />,
        isPrivate: true,
        privateNote: 'Some repositories may be private'
    }

        ,
    {
        name: 'GitHub (EKD Digital)',
        url: 'https://github.com/ekddigital',
        description: 'Organization repositories for EKD Digital projects and company standards.',
        icon: <FaGithub />,
        isPrivate: true,
        privateNote: 'Client projects are private'
    }

    ]
}

    ,
{

    id: 'achievements',
    title: 'Awards, Honors & Certifications',
    icon: <FaAward />,
    content: 'Throughout my academic and professional journey, I have been honored with scholarships, awards, and certifications that reflect my commitment to excellence. These recognitions span academic achievement, technical certifications from industry leaders, and community service awards.',
    links: [{
        name: 'Awards & Certifications Gallery',
        url: '/awards',
        description: 'Complete gallery with supporting documentation for all awards and certifications.',
        icon: <HiStar />,
        isInternal: true
    }

        ,
    {
        name: 'Featured Honors',
        url: '/#award',
        description: 'Highlighted recognitions showcasing notable scholarships and achievements.',
        icon: <HiAcademicCap />,
        isInternal: true
    }

    ]
}

    ,
{

    id: 'ventures',
    title: 'Entrepreneurship & Ventures',
    icon: <HiOfficeBuilding />,
    content: 'As the founder of EKD Digital, I lead a technology company focused on delivering innovative software solutions. Our work spans web development, AI integration, and digital transformation for clients worldwide. Building EKD Digital has been a journey of learning, growth, and creating meaningful impact through technology.',
    links: [{
        name: 'EKD Digital Website',
        url: 'https://www.ekddigital.com',
        description: 'Explore our services in custom software development, AI solutions, and digital transformation.',
        icon: <HiGlobe />
    }

        ,
    {
        name: 'About EKD Digital',
        url: 'https://www.ekddigital.com/about',
        description: 'Learn about our mission, vision, and commitment to excellence.',
        icon: <HiOfficeBuilding />
    }

        ,
    {
        name: 'Meet the Team',
        url: 'https://www.ekddigital.com/about/team',
        description: 'Get to know the talented individuals driving innovation at EKD Digital.',
        icon: <HiUserGroup />
    }

    ]
}

];

const QuickLinksPage = () => {
    const fadeIn = {
        hidden: {
            opacity: 0, y: 20
        }

        ,
        visible: {
            opacity: 1, y: 0
        }
    }

        ;

    return (<> <Navbar /> <div className="quicklinks-page"> {
        /* Hero/Header Section */
    }

        <header className="page-header"> <div className="header-content"> <Link to="/" className="back-link"> <HiArrowLeft /> <span>Back to Portfolio</span> </Link> <motion.div className="header-text"

            initial={
                {
                    opacity: 0, y: 30
                }
            }

            animate={
                {
                    opacity: 1, y: 0
                }
            }

            transition={
                {
                    duration: 0.6
                }
            }

        > <h1>Resources & Quick Links</h1> <p className="lead"> Welcome ! Whether you're a potential collaborator, academic supervisor, or recruiter,
            this page provides easy access to my research, professional experience, technical work,
            and achievements. Feel free to explore and reach out if you'd like to connect.
            </p> </motion.div> </div> </header> {
            /* Notice about private repositories */
        }

        <motion.div className="notice-banner"

            initial={
                {
                    opacity: 0
                }
            }

            animate={
                {
                    opacity: 1
                }
            }

            transition={
                {
                    delay: 0.3
                }
            }

        > <HiInformationCircle className="notice-icon" /> <p> <strong>Note:</strong> Some GitHub repositories linked on this page may be private or contain proprietary code. If you encounter a 404 error, it means that particular repository is not publicly accessible. Please <a href="mailto:ekd@ekddigital.com">contact me</a> if you'd like to discuss specific projects.
            </p> </motion.div> {
            /* Main Content - Blog Style */
        }

        <main className="page-content"> {
            linkCategories.map((category, categoryIndex) => (<motion.article key={
                category.id
            }

                className="content-section"
                initial="hidden"
                whileInView="visible"

                viewport={
                    {
                        once: true, margin: "-50px"
                    }
                }

                variants={
                    fadeIn
                }

                transition={
                    {
                        delay: categoryIndex * 0.1
                    }
                }

            > <div className="section-header"> <span className="section-icon"> {
                category.icon
            }

            </span> <h2> {
                category.title
            }

                    </h2> </div> <div className="section-body"> <p className="section-content"> {
                        category.content
                    }

                    </p> <div className="links-list"> {
                        category.links.map((link, linkIndex) => {
                            const LinkWrapper = link.isInternal ? Link : 'a';

                            const linkProps = link.isInternal ? {
                                to: link.url
                            }

                                : {
                                    href: link.url, target: '_blank', rel: 'noopener noreferrer'
                                }

                                ;

                            return (<motion.div key={
                                linkIndex
                            }

                                className="link-item"

                                initial={
                                    {
                                        opacity: 0, x: -10
                                    }
                                }

                                whileInView={
                                    {
                                        opacity: 1, x: 0
                                    }
                                }

                                viewport={
                                    {
                                        once: true
                                    }
                                }

                                transition={
                                    {
                                        delay: linkIndex * 0.05
                                    }
                                }

                            > <LinkWrapper {
                                ...linkProps
                            }

                                className="link-anchor"> <span className="link-icon"> {
                                    link.icon
                                }

                                    </span> <div className="link-details"> <span className="link-name"> {
                                        link.name
                                    }

                                        {
                                            link.isPrivate && (<span className="private-badge"> <HiLockClosed /> <span className="private-tooltip"> {
                                                link.privateNote
                                            }

                                            </span> </span>)
                                        }

                                    </span> <span className="link-description"> {
                                        link.description
                                    }

                                        </span> </div> <span className="link-arrow"> {
                                            link.isInternal ? <HiArrowRight /> : <HiExternalLink />
                                        }

                                    </span> </LinkWrapper> </motion.div>);
                        }

                        )
                    }

                    </div> </div> </motion.article>))
        }

        </main> {
            /* Footer CTA */
        }

        <footer className="page-footer"> <motion.div className="footer-content"

            initial={
                {
                    opacity: 0
                }
            }

            whileInView={
                {
                    opacity: 1
                }
            }

            viewport={
                {
                    once: true
                }
            }

        > <h3>Interested in Collaboration?</h3> <p> Whether you're exploring research opportunities, considering me for a PhD position,
            or looking to collaborate on innovative projects, I'd love to hear from you.
            </p> <div className="footer-actions"> <a href="mailto:ekd@ekddigital.com" className="btn btn-primary"> Get in Touch </a> <Link to="/#contact" className="btn btn-secondary"> Contact Form </Link> </div> </motion.div> </footer> </div> </>);
}

    ;

export default QuickLinksPage;