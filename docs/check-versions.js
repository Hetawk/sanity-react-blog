const { execSync } = require('child_process');
const fs = require('fs');

// Read package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const dependencies = packageJson.dependencies;

console.log('Checking latest versions for all backend dependencies...\n');

async function checkVersions() {
    for (const [package, currentVersion] of Object.entries(dependencies)) {
        try {
            const latestVersion = execSync(`npm view ${package} version`, { encoding: 'utf8' }).trim();
            console.log(`${package}:`);
            console.log(`  Current: ${currentVersion}`);
            console.log(`  Latest:  ^${latestVersion}`);
            console.log('');
        } catch (error) {
            console.log(`${package}: Error checking version - might be deprecated`);
            console.log('');
        }
    }
}

checkVersions();