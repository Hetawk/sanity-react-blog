#!/usr/bin/env node

/**
 * GitHub Repository Sync CLI
 * 
 * This CLI tool syncs GitHub repositories to the database.
 * It's the official way to manually trigger GitHub sync from the command line.
 * 
 * Usage:
 *   cd server && node cli/sync-github.js
 *   OR
 *   cd server && npm run sync:github
 */

require('dotenv').config();
const { syncAllRepositories } = require('../services/githubSyncService');

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   🔄 GitHub Repository Auto-Sync CLI                           ║
║                                                                ║
║   Syncing repositories from:                                   ║
║   • EKD Digital (ekddigital)                                   ║
║   • Hetawk (Hetawk)                                            ║
║                                                                ║
║   Features:                                                    ║
║   ✓ Fetch all public & private repos                           ║
║   ✓ Analyze project structure & tech stack                     ║
║   ✓ Auto-generate descriptions                                 ║
║   ✓ Set default GitHub placeholder images                      ║
║   ✓ Create as drafts (publish via dashboard)                   ║
║   ✓ Update existing projects with latest data                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);

// Verify tokens are set
if (!process.env.EKDDIGITAL_TOKEN || !process.env.HETAWK_TOKEN) {
    console.error('❌ Error: GitHub tokens not found in .env');
    console.error('   Please ensure EKDDIGITAL_TOKEN and HETAWK_TOKEN are set in server/.env');
    process.exit(1);
}

// Run sync
syncAllRepositories()
    .then(() => {
        console.log('\n✅ Sync completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Start the backend server: npm start');
        console.log('   2. Visit dashboard to review synced projects');
        console.log('   3. Update project images and descriptions as needed');
        console.log('   4. Publish projects you want to showcase');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Sync failed:', error.message);
        console.error('\nStack trace:', error.stack);
        process.exit(1);
    });
