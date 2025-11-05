import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiRefreshCw, FiGithub, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import api from '../../../api/client';
import '../Dashboard.scss';

const GithubSyncManager = () => {
    const [syncStatus, setSyncStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncMessage, setSyncMessage] = useState('');

    // Fetch sync status
    const fetchSyncStatus = async () => {
        try {
            setIsLoading(true);
            const response = await api.githubSync.getStatus();
            setSyncStatus(response);
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching sync status:', error);
            setIsLoading(false);
        }
    };

    // Trigger manual sync
    const handleManualSync = async () => {
        try {
            setIsSyncing(true);
            setSyncMessage('🔄 Syncing GitHub repositories...');

            const response = await api.githubSync.sync();

            if (response.success) {
                setSyncMessage('✅ Sync completed successfully!');
                // Refresh status after 2 seconds
                setTimeout(() => {
                    fetchSyncStatus();
                    setSyncMessage('');
                }, 2000);
            } else {
                setSyncMessage(`⚠️ ${response.message}`);
            }

            setIsSyncing(false);
        } catch (error) {
            console.error('Error syncing:', error);
            setSyncMessage(`❌ Sync failed: ${error.message}`);
            setIsSyncing(false);
        }
    };

    useEffect(() => {
        fetchSyncStatus();

        // Refresh status every 30 seconds
        const interval = setInterval(fetchSyncStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const formatDate = (dateString) => {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const formatTimeUntil = (dateString) => {
        if (!dateString) return 'N/A';
        const now = new Date();
        const target = new Date(dateString);
        const diffMs = target - now;

        if (diffMs < 0) return 'Overdue';

        const diffMins = Math.floor(diffMs / 1000 / 60);
        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''}`;

        const diffHours = Math.floor(diffMins / 60);
        const remainingMins = diffMins % 60;
        return `${diffHours}h ${remainingMins}m`;
    };

    if (isLoading) {
        return (
            <div className="content-manager">
                <div className="manager-header">
                    <h2><FiGithub /> GitHub Sync</h2>
                </div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p>Loading sync status...</p>
                </div>
            </div>
        );
    }

    const scheduler = syncStatus?.scheduler || {};
    const data = syncStatus?.data || {};

    return (
        <div className="content-manager">
            <div className="manager-header">
                <h2><FiGithub /> GitHub Sync Manager</h2>
                <button
                    className="add-btn"
                    onClick={handleManualSync}
                    disabled={isSyncing || scheduler.isRunning}
                >
                    <FiRefreshCw className={isSyncing ? 'spinning' : ''} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>

            {syncMessage && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sync-message"
                    style={{
                        padding: '1rem',
                        margin: '1rem 0',
                        backgroundColor: syncMessage.includes('✅') ? '#d4edda' :
                            syncMessage.includes('❌') ? '#f8d7da' : '#d1ecf1',
                        color: syncMessage.includes('✅') ? '#155724' :
                            syncMessage.includes('❌') ? '#721c24' : '#0c5460',
                        borderRadius: '4px'
                    }}
                >
                    {syncMessage}
                </motion.div>
            )}

            {/* Scheduler Status */}
            <div className="sync-overview">
                <div className="sync-card">
                    <h3><FiClock /> Scheduler Status</h3>
                    <div className="sync-details">
                        <div className="sync-row">
                            <span>Status:</span>
                            <strong>
                                {scheduler.isSchedulerRunning ? (
                                    <span style={{ color: '#28a745' }}>
                                        <FiCheckCircle /> Running
                                    </span>
                                ) : (
                                    <span style={{ color: '#dc3545' }}>
                                        <FiAlertCircle /> Stopped
                                    </span>
                                )}
                            </strong>
                        </div>
                        <div className="sync-row">
                            <span>Sync Interval:</span>
                            <strong>{scheduler.syncIntervalMinutes} minutes (1 hour)</strong>
                        </div>
                        <div className="sync-row">
                            <span>Currently Syncing:</span>
                            <strong>{scheduler.isRunning ? 'Yes' : 'No'}</strong>
                        </div>
                    </div>
                </div>

                <div className="sync-card">
                    <h3>Last Sync</h3>
                    <div className="sync-details">
                        <div className="sync-row">
                            <span>Time:</span>
                            <strong>{formatDate(scheduler.lastSyncTime)}</strong>
                        </div>
                        <div className="sync-row">
                            <span>Status:</span>
                            <strong style={{
                                color: scheduler.lastSyncStatus === 'success' ? '#28a745' : '#dc3545'
                            }}>
                                {scheduler.lastSyncStatus === 'success' ? '✅ Success' : '❌ Failed'}
                            </strong>
                        </div>
                        {scheduler.lastSyncError && (
                            <div className="sync-row">
                                <span>Error:</span>
                                <strong style={{ color: '#dc3545' }}>{scheduler.lastSyncError}</strong>
                            </div>
                        )}
                    </div>
                </div>

                <div className="sync-card">
                    <h3>Next Sync</h3>
                    <div className="sync-details">
                        <div className="sync-row">
                            <span>Scheduled At:</span>
                            <strong>{formatDate(scheduler.nextSyncTime)}</strong>
                        </div>
                        <div className="sync-row">
                            <span>Time Until:</span>
                            <strong>{formatTimeUntil(scheduler.nextSyncTime)}</strong>
                        </div>
                    </div>
                </div>

                <div className="sync-card">
                    <h3>Statistics</h3>
                    <div className="sync-details">
                        <div className="sync-row">
                            <span>Total Syncs:</span>
                            <strong>{scheduler.totalSyncs}</strong>
                        </div>
                        <div className="sync-row">
                            <span>Successful:</span>
                            <strong style={{ color: '#28a745' }}>{scheduler.successfulSyncs}</strong>
                        </div>
                        <div className="sync-row">
                            <span>Failed:</span>
                            <strong style={{ color: '#dc3545' }}>{scheduler.failedSyncs}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {/* Repository Statistics */}
            <div className="sync-overview" style={{ marginTop: '2rem' }}>
                <div className="sync-card">
                    <h3>Repository Stats</h3>
                    <div className="sync-details">
                        <div className="sync-row">
                            <span>Total Repos:</span>
                            <strong>{data.total || 0}</strong>
                        </div>
                        <div className="sync-row">
                            <span>Total Stars:</span>
                            <strong>⭐ {data.totalStars || 0}</strong>
                        </div>
                        <div className="sync-row">
                            <span>Total Forks:</span>
                            <strong>🍴 {data.totalForks || 0}</strong>
                        </div>
                    </div>
                </div>

                <div className="sync-card">
                    <h3>Top Languages</h3>
                    <div className="sync-details">
                        {data.topLanguages?.slice(0, 5).map((lang, index) => (
                            <div key={index} className="sync-row">
                                <span>{lang.language}:</span>
                                <strong>{lang.count} repos</strong>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Synced Projects */}
            <div style={{ marginTop: '2rem' }}>
                <h3>Recently Synced Repositories</h3>
                <div className="items-list">
                    {data.recentlySynced?.slice(0, 5).map((repo, index) => (
                        <motion.div
                            key={index}
                            className="item-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <h4>{repo.title}</h4>
                            <div className="item-meta">
                                <span>⭐ {repo.githubStars}</span>
                                <span>🍴 {repo.githubForks}</span>
                                <span>{repo.isPrivateRepo ? '🔒 Private' : '🌐 Public'}</span>
                            </div>
                            {repo.githubUrl && (
                                <a
                                    href={repo.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.9rem', color: '#0366d6' }}
                                >
                                    View on GitHub →
                                </a>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .sync-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1rem;
                    margin-top: 1rem;
                }
                
                .sync-card {
                    background: white;
                    border: 1px solid #e1e4e8;
                    border-radius: 6px;
                    padding: 1rem;
                }
                
                .sync-card h3 {
                    font-size: 1rem;
                    margin-bottom: 1rem;
                    color: #24292e;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .sync-details {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .sync-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.9rem;
                }
                
                .sync-row span {
                    color: #586069;
                }
                
                .spinning {
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}} />
        </div>
    );
};

export default GithubSyncManager;
