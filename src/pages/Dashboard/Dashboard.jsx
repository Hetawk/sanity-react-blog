import React, { useState } from 'react';
import { Navbar } from '../../components';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.scss';

// Content type tabs
import SkillsManager from './ContentManagers/SkillsManager';
import ExperiencesManager from './ContentManagers/ExperiencesManager';
import AwardsManager from './ContentManagers/AwardsManager';
import WorksManager from './ContentManagers/WorksManager';
import ResumeManager from './ContentManagers/ResumeManager';

const Dashboard = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('skills');
    const { isAuthenticated, login, logout, loading } = useAuth();
    const [showHelp, setShowHelp] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();

        if (login(password)) {
            setError('');
        } else {
            setError('Invalid password. Please check your credentials.');
        }
    };

    const handleLogout = () => {
        logout();
    };

    if (loading) {
        return <div className="dashboard-loading">Loading...</div>;
    }

    // If not authenticated, show login form
    if (!isAuthenticated) {
        return (
            <div className="dashboard-login">
                <h1>Dashboard Login</h1>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter dashboard password"
                        />
                    </div>
                    {error && (
                        <p className="error">
                            {error}
                            {process.env.NODE_ENV === 'development' && !process.env.REACT_APP_ADMIN_PASSWORD && (
                                <span> - Environment variables not loaded properly</span>
                            )}
                        </p>
                    )}
                    <button type="submit">Login</button>

                    <div className="login-help">
                        <button
                            type="button"
                            className="help-btn"
                            onClick={() => setShowHelp(!showHelp)}
                        >
                            {showHelp ? 'Hide Help' : 'Need Help?'}
                        </button>

                        {showHelp && (
                            <div className="help-content">
                                <p><strong>Need Access?</strong></p>
                                <p>Please contact the administrator:</p>
                                <p className="admin-contact">
                                    <strong>Enoch Kwateh Dongbo</strong><br />
                                    <a href="mailto:ekd@ekddigital.com">ekd@ekddigital.com</a>
                                </p>
                                <p><strong>Current status:</strong> Environment variables are
                                    {process.env.REACT_APP_ADMIN_PASSWORD && process.env.REACT_APP_SANITY_TOKEN
                                        ? " loaded properly."
                                        : " missing or incomplete."}
                                </p>
                            </div>
                        )}
                    </div>
                </form>
            </div>
        );
    }

    // Render dashboard if authenticated
    return (
        <div className="dashboard-container">
            <Navbar />
            <div className="dashboard-header">
                <h1>Content Dashboard</h1>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            <div className="dashboard-content">
                <div className="dashboard-tabs">
                    <button
                        className={activeTab === 'skills' ? 'active' : ''}
                        onClick={() => setActiveTab('skills')}
                    >
                        Skills
                    </button>
                    <button
                        className={activeTab === 'experiences' ? 'active' : ''}
                        onClick={() => setActiveTab('experiences')}
                    >
                        Experiences
                    </button>
                    <button
                        className={activeTab === 'awards' ? 'active' : ''}
                        onClick={() => setActiveTab('awards')}
                    >
                        Awards
                    </button>
                    <button
                        className={activeTab === 'works' ? 'active' : ''}
                        onClick={() => setActiveTab('works')}
                    >
                        Works
                    </button>
                    <button
                        className={activeTab === 'resume' ? 'active' : ''}
                        onClick={() => setActiveTab('resume')}
                    >
                        Resume
                    </button>
                </div>

                <div className="dashboard-tab-content">
                    {activeTab === 'skills' && <SkillsManager />}
                    {activeTab === 'experiences' && <ExperiencesManager />}
                    {activeTab === 'awards' && <AwardsManager />}
                    {activeTab === 'works' && <WorksManager />}
                    {activeTab === 'resume' && <ResumeManager />}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
