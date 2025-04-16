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
                    {error && <p className="error">{error}</p>}
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
                                <p>Use the admin password defined in your .env file. Make sure:</p>
                                <ul>
                                    <li>Your .env file contains the REACT_APP_ADMIN_PASSWORD variable</li>
                                    <li>You've restarted your development server after updating the .env file</li>
                                    <li>The SANITY_STUDIO_TOKEN is also present in your .env file</li>
                                </ul>
                                <p>If you're still having issues, contact your administrator.</p>
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
