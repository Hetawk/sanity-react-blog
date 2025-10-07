import React,
    {
    useState
}

from 'react';

import {
    motion,
    AnimatePresence
}

from 'framer-motion';

import {
    Navbar
}

from '../../components';

import {
    useAuth
}

from '../../context/AuthContext';
import './Dashboard.scss';

// Content type tabs
import AboutsManager from './ContentManagers/AboutsManager';
import SkillsManager from './ContentManagers/SkillsManager';
import ExperiencesManager from './ContentManagers/ExperiencesManager';
import AwardsManager from './ContentManagers/AwardsManager';
import WorksManager from './ContentManagers/WorksManager';
import ResumeManager from './ContentManagers/ResumeManager';

// Tab configuration with icons - using brand colors
const tabs=[ {
    id: 'abouts', label: 'About', icon: '👤', color: '#FF4C29'
}

,
    {
    id: 'skills', label: 'Skills', icon: '⚡', color: '#FF4C29'
}

,
    {
    id: 'works', label: 'Works', icon: '💼', color: '#8E0E00'
}

,
    {
    id: 'experiences', label: 'Experience', icon: '🎯', color: '#8E0E00'
}

,
    {
    id: 'awards', label: 'Awards', icon: '🏆', color: '#1F1C18'
}

,
    {
    id: 'resume', label: 'Resume', icon: '📄', color: '#1F1C18'
}

];

const Dashboard=()=> {
    const [password,
    setPassword]=useState('');
    const [error,
    setError]=useState('');
    const [activeTab,
    setActiveTab]=useState('abouts');

    const {
        isAuthenticated,
        login,
        logout,
        loading
    }

    =useAuth();
    const [showHelp,
    setShowHelp]=useState(false);
    const [sidebarCollapsed,
    setSidebarCollapsed]=useState(false);

    const handleLogin=(e)=> {
        e.preventDefault();

        if (login(password)) {
            setError('');
        }

        else {
            setError('Invalid password. Please check your credentials.');
        }
    }

    ;

    const handleLogout=()=> {
        logout();
    }

    ;

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    // If not authenticated, show login form
    if ( !isAuthenticated) {
        return (<div className="dashboard-login"> <h1>Dashboard Login</h1> <form onSubmit= {
                handleLogin
            }

            > <div className="form-group"> <label>Password</label> <input type="password"

            value= {
                password
            }

            onChange= {
                (e)=> setPassword(e.target.value)
            }

            placeholder="Enter dashboard password"

            /> </div> {
                error && (<p className="error"> {
                        error
                    }

                        {
                        process.env.NODE_ENV==='development'&& !process.env.REACT_APP_ADMIN_PASSWORD && (<span> - Environment variables not loaded properly</span>)
                    }

                    </p>)
            }

            <button type="submit">Login</button> <div className="login-help"> <button type="button"
            className="help-btn"

            onClick= {
                ()=> setShowHelp( !showHelp)
            }

            > {
                showHelp ? 'Hide Help' : 'Need Help?'
            }

            </button> {
                showHelp && (<div className="help-content"> <p><strong>Need Access?</strong></p> <p>Please contact the administrator:</p> <p className="admin-contact"> <strong>Enoch Kwateh Dongbo</strong><br /> <a href="mailto:ekd@ekddigital.com">ekd@ekddigital.com</a> </p> <p><strong>Current status:</strong> Environment variables are {
                        process.env.REACT_APP_ADMIN_PASSWORD ? " loaded properly."
                        : " missing or incomplete."
                    }

                    </p> </div>)
            }

            </div> </form> </div>);
    }

    // Render dashboard if authenticated
    return (<div className="dashboard-container"> <Navbar /> {
            /* Modern Header with Stats */
        }

        <motion.div className="dashboard-header-modern"

        initial= {
                {
                opacity: 0, y: -20
            }
        }

        animate= {
                {
                opacity: 1, y: 0
            }
        }

        transition= {
                {
                duration: 0.5
            }
        }

        > <div className="header-left"> <h1> <span className="gradient-text">Content Manager</span> </h1> <p className="header-subtitle">Manage your portfolio content with ease</p> </div> <div className="header-right"> <motion.button className="logout-btn-modern"

        onClick= {
            handleLogout
        }

        whileHover= {
                {
                scale: 1.05
            }
        }

        whileTap= {
                {
                scale: 0.95
            }
        }

        > <span>🚪</span> Logout </motion.button> </div> </motion.div> {
            /* Modern Tab Navigation */
        }

        <div className="dashboard-content-modern"> <motion.div className="dashboard-tabs-modern"

        initial= {
                {
                opacity: 0
            }
        }

        animate= {
                {
                opacity: 1
            }
        }

        transition= {
                {
                delay: 0.2
            }
        }

        > {
            tabs.map((tab, index)=> (<motion.button key= {
                        tab.id
                    }

                    className= {
                        `tab-btn-modern $ {
                            activeTab===tab.id ? 'active' : ''
                        }

                        `
                    }

                    onClick= {
                        ()=> setActiveTab(tab.id)
                    }

                    initial= {
                            {
                            opacity: 0, y: 20
                        }
                    }

                    animate= {
                            {
                            opacity: 1, y: 0
                        }
                    }

                    transition= {
                            {
                            delay: index * 0.05
                        }
                    }

                    whileHover= {
                            {
                            y: -3
                        }
                    }

                    whileTap= {
                            {
                            scale: 0.95
                        }
                    }

                    style= {
                            {
                            '--tab-color': tab.color
                        }
                    }

                    > <span className="tab-icon"> {
                        tab.icon
                    }

                    </span> <span className="tab-label"> {
                        tab.label
                    }

                    </span> {
                        activeTab===tab.id && (<motion.div className="tab-indicator"
                            layoutId="activeTab"

                            transition= {
                                    {
                                    type: 'spring', stiffness: 380, damping: 30
                                }
                            }

                            />)
                    }

                    </motion.button>))
        }

        </motion.div> {
            /* Tab Content with Animation */
        }

        <AnimatePresence mode="wait"> <motion.div key= {
            activeTab
        }

        className="dashboard-tab-content-modern"

        initial= {
                {
                opacity: 0, x: 20
            }
        }

        animate= {
                {
                opacity: 1, x: 0
            }
        }

        exit= {
                {
                opacity: 0, x: -20
            }
        }

        transition= {
                {
                duration: 0.3
            }
        }

        > {
            activeTab==='abouts'&& <AboutsManager />
        }

            {
            activeTab==='skills'&& <SkillsManager />
        }

            {
            activeTab==='experiences'&& <ExperiencesManager />
        }

            {
            activeTab==='awards'&& <AwardsManager />
        }

            {
            activeTab==='works'&& <WorksManager />
        }

            {
            activeTab==='resume'&& <ResumeManager />
        }

        </motion.div> </AnimatePresence> </div> </div>);
}

;

export default Dashboard;