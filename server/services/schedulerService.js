/**
 * Scheduler Service
 * Handles periodic background tasks like GitHub repository sync
 */

const { syncAllRepositories } = require('./githubSyncService');

// Track sync status
let syncStatus = {
    isRunning: false,
    lastSyncTime: null,
    lastSyncStatus: null,
    lastSyncError: null,
    nextSyncTime: null,
    totalSyncs: 0,
    successfulSyncs: 0,
    failedSyncs: 0
};

// Sync interval: 24 hours / 1 day (in milliseconds)
const SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours (daily)

let syncIntervalId = null;

/**
 * Perform GitHub sync with status tracking
 */
async function performSync() {
    // Skip if already running
    if (syncStatus.isRunning) {
        console.log('⏭️  GitHub sync already running, skipping...');
        return { success: false, message: 'Sync already in progress' };
    }

    try {
        syncStatus.isRunning = true;
        syncStatus.totalSyncs++;

        console.log(`\n${'='.repeat(60)}`);
        console.log(`🔄 Starting scheduled GitHub sync (#${syncStatus.totalSyncs})`);
        console.log(`⏰ Time: ${new Date().toLocaleString()}`);
        console.log(`${'='.repeat(60)}\n`);

        // Run sync
        await syncAllRepositories();

        // Update status on success
        syncStatus.isRunning = false;
        syncStatus.lastSyncTime = new Date();
        syncStatus.lastSyncStatus = 'success';
        syncStatus.lastSyncError = null;
        syncStatus.successfulSyncs++;
        syncStatus.nextSyncTime = new Date(Date.now() + SYNC_INTERVAL);

        console.log(`\n${'='.repeat(60)}`);
        console.log('✅ Scheduled sync completed successfully!');
        console.log(`📊 Total syncs: ${syncStatus.totalSyncs} (✅ ${syncStatus.successfulSyncs} | ❌ ${syncStatus.failedSyncs})`);
        console.log(`⏰ Next sync at: ${syncStatus.nextSyncTime.toLocaleString()}`);
        console.log(`${'='.repeat(60)}\n`);

        return { success: true, message: 'Sync completed successfully' };
    } catch (error) {
        // Update status on failure
        syncStatus.isRunning = false;
        syncStatus.lastSyncTime = new Date();
        syncStatus.lastSyncStatus = 'failed';
        syncStatus.lastSyncError = error.message;
        syncStatus.failedSyncs++;
        syncStatus.nextSyncTime = new Date(Date.now() + SYNC_INTERVAL);

        console.error(`\n${'='.repeat(60)}`);
        console.error('❌ Scheduled sync failed!');
        console.error(`Error: ${error.message}`);
        console.error(`📊 Total syncs: ${syncStatus.totalSyncs} (✅ ${syncStatus.successfulSyncs} | ❌ ${syncStatus.failedSyncs})`);
        console.error(`⏰ Next sync at: ${syncStatus.nextSyncTime.toLocaleString()}`);
        console.error(`${'='.repeat(60)}\n`);

        return { success: false, message: error.message };
    }
}

/**
 * Start the scheduler
 */
function startScheduler() {
    if (syncIntervalId) {
        console.log('⚠️  Scheduler already running');
        return;
    }

    console.log('\n🚀 Starting GitHub Auto-Sync Scheduler');
    console.log(`⏰ Sync interval: Every ${SYNC_INTERVAL / 1000 / 60 / 60} hours (daily)`);
    console.log(`🔄 First sync will run immediately...\n`);

    // Run initial sync immediately
    performSync();

    // Schedule periodic syncs
    syncIntervalId = setInterval(performSync, SYNC_INTERVAL);

    console.log('✅ Scheduler started successfully!\n');
}

/**
 * Stop the scheduler
 */
function stopScheduler() {
    if (syncIntervalId) {
        clearInterval(syncIntervalId);
        syncIntervalId = null;
        console.log('🛑 Scheduler stopped');
    }
}

/**
 * Get current sync status
 */
function getSyncStatus() {
    return {
        ...syncStatus,
        isSchedulerRunning: syncIntervalId !== null,
        syncInterval: SYNC_INTERVAL,
        syncIntervalHours: SYNC_INTERVAL / 1000 / 60 / 60
    };
}

/**
 * Trigger manual sync
 */
async function triggerManualSync() {
    console.log('🔄 Manual sync triggered via API');
    return await performSync();
}

module.exports = {
    startScheduler,
    stopScheduler,
    getSyncStatus,
    triggerManualSync,
    performSync
};
