/**
 * GitHub Repository Auto-Sync Service
 * 
 * This service automatically syncs GitHub repositories to the portfolio database:
 * - Fetches all repos from both GitHub accounts
 * - Analyzes project structure and tech stack
 * - Auto-generates descriptions for repos without README
 * - Sets default GitHub placeholder images
 * - Updates existing projects with latest GitHub data
 * - Supports pagination for large repo lists
 * - Can run on schedule or on-demand
 */

const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: './.env' });

const prisma = new PrismaClient();

// Default GitHub project image (can be updated via dashboard)
const DEFAULT_GITHUB_IMAGE = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';

// Lazy-load Octokit (ES Module)
let Octokit;
let octokitEkd;
let octokitHetawk;

async function initializeOctokit() {
    if (!Octokit) {
        const octokitModule = await import('@octokit/rest');
        Octokit = octokitModule.Octokit;

        // Initialize GitHub clients for both accounts
        octokitEkd = new Octokit({
            auth: process.env.EKDDIGITAL_TOKEN
        });

        octokitHetawk = new Octokit({
            auth: process.env.HETAWK_TOKEN
        });
    }
    return { octokitEkd, octokitHetawk };
}

/**
 * Analyze project structure to determine type and category
 */
function analyzeProjectStructure(tree, languages, readme) {
    const files = tree.map(item => item.path);
    const analysis = {
        projectCategory: 'Unknown',
        projectSubCategory: 'Unknown',
        frameworks: [],
        languages: [],
        uiLibraries: [],
        databases: [],
        testingTools: [],
        buildTools: [],
        deploymentTools: [],
        hasTests: false,
        hasDocs: false,
        hasCI: false,
        hasDocker: false,
        complexity: 'Medium',
        insights: []
    };

    // Detect project type from files
    const hasPackageJson = files.some(f => f === 'package.json');
    const hasRequirementsTxt = files.some(f => f === 'requirements.txt');
    const hasPomXml = files.some(f => f === 'pom.xml');
    const hasCargoToml = files.some(f => f === 'Cargo.toml');
    const hasGoMod = files.some(f => f === 'go.mod');

    // Frontend indicators
    const hasReact = files.some(f => f.includes('react') || f.includes('jsx'));
    const hasVue = files.some(f => f.includes('vue'));
    const hasAngular = files.some(f => f.includes('angular'));
    const hasNextJs = files.some(f => f.includes('next.config'));
    const hasVite = files.some(f => f.includes('vite.config'));
    const hasTailwind = files.some(f => f.includes('tailwind.config'));

    // Backend indicators
    const hasExpress = hasPackageJson && files.some(f => f.includes('express'));
    const hasDjango = hasRequirementsTxt && files.some(f => f.includes('django'));
    const hasFlask = hasRequirementsTxt && files.some(f => f.includes('flask'));
    const hasSpring = hasPomXml;
    const hasNodeServer = files.some(f => f.includes('server.js') || f.includes('app.js'));

    // Mobile indicators
    const hasReactNative = files.some(f => f.includes('react-native'));
    const hasFlutter = files.some(f => f.includes('pubspec.yaml'));
    const hasSwift = files.some(f => f.endsWith('.swift'));
    const hasKotlin = files.some(f => f.endsWith('.kt'));

    // Database indicators
    const hasMongoDB = files.some(f => f.includes('mongo'));
    const hasPostgres = files.some(f => f.includes('postgres'));
    const hasMySQL = files.some(f => f.includes('mysql'));
    const hasPrisma = files.some(f => f.includes('prisma'));

    // DevOps indicators
    analysis.hasDocker = files.some(f => f === 'Dockerfile' || f === 'docker-compose.yml');
    analysis.hasCI = files.some(f => f.includes('.github/workflows') || f.includes('.gitlab-ci'));
    analysis.hasTests = files.some(f => f.includes('test') || f.includes('spec'));
    analysis.hasDocs = files.some(f => f.includes('docs/') || f === 'README.md');

    // Determine project category
    if (hasReact || hasVue || hasAngular || hasNextJs) {
        analysis.projectCategory = 'Web Application';
        if (hasNodeServer || hasExpress) {
            analysis.projectSubCategory = 'Full-Stack';
        } else {
            analysis.projectSubCategory = 'Frontend';
        }
    } else if (hasExpress || hasDjango || hasFlask || hasSpring || hasNodeServer) {
        analysis.projectCategory = 'Web Application';
        analysis.projectSubCategory = 'Backend';
    } else if (hasReactNative || hasFlutter || hasSwift || hasKotlin) {
        analysis.projectCategory = 'Mobile Application';
        analysis.projectSubCategory = hasReactNative ? 'Cross-Platform' : 'Native';
    } else if (hasPomXml) {
        analysis.projectCategory = 'Java Application';
        analysis.projectSubCategory = 'Enterprise';
    } else if (hasRequirementsTxt) {
        analysis.projectCategory = 'Python Application';
        if (files.some(f => f.includes('ml') || f.includes('data') || f.includes('model'))) {
            analysis.projectSubCategory = 'Data Science/ML';
        } else {
            analysis.projectSubCategory = 'Script/Tool';
        }
    } else if (hasCargoToml) {
        analysis.projectCategory = 'Rust Application';
    } else if (hasGoMod) {
        analysis.projectCategory = 'Go Application';
    }

    // Extract frameworks
    if (hasReact) analysis.frameworks.push('React');
    if (hasVue) analysis.frameworks.push('Vue.js');
    if (hasAngular) analysis.frameworks.push('Angular');
    if (hasNextJs) analysis.frameworks.push('Next.js');
    if (hasExpress) analysis.frameworks.push('Express.js');
    if (hasDjango) analysis.frameworks.push('Django');
    if (hasFlask) analysis.frameworks.push('Flask');
    if (hasSpring) analysis.frameworks.push('Spring Boot');
    if (hasReactNative) analysis.frameworks.push('React Native');
    if (hasFlutter) analysis.frameworks.push('Flutter');

    // Extract UI libraries
    if (hasTailwind) analysis.uiLibraries.push('Tailwind CSS');
    if (files.some(f => f.includes('mui') || f.includes('material-ui'))) {
        analysis.uiLibraries.push('Material-UI');
    }
    if (files.some(f => f.includes('bootstrap'))) {
        analysis.uiLibraries.push('Bootstrap');
    }

    // Extract databases
    if (hasMongoDB) analysis.databases.push('MongoDB');
    if (hasPostgres) analysis.databases.push('PostgreSQL');
    if (hasMySQL) analysis.databases.push('MySQL');
    if (hasPrisma) analysis.databases.push('Prisma ORM');

    // Extract testing tools
    if (files.some(f => f.includes('jest'))) analysis.testingTools.push('Jest');
    if (files.some(f => f.includes('cypress'))) analysis.testingTools.push('Cypress');
    if (files.some(f => f.includes('pytest'))) analysis.testingTools.push('Pytest');
    if (files.some(f => f.includes('junit'))) analysis.testingTools.push('JUnit');

    // Extract build tools
    if (hasVite) analysis.buildTools.push('Vite');
    if (files.some(f => f.includes('webpack'))) analysis.buildTools.push('Webpack');
    if (files.some(f => f.includes('rollup'))) analysis.buildTools.push('Rollup');
    if (hasPomXml) analysis.buildTools.push('Maven');

    // Extract deployment tools
    if (analysis.hasDocker) analysis.deploymentTools.push('Docker');
    if (files.some(f => f.includes('kubernetes') || f.includes('k8s'))) {
        analysis.deploymentTools.push('Kubernetes');
    }
    if (files.some(f => f.includes('vercel'))) analysis.deploymentTools.push('Vercel');
    if (files.some(f => f.includes('netlify'))) analysis.deploymentTools.push('Netlify');

    // Extract languages from GitHub API
    if (languages) {
        analysis.languages = Object.keys(languages);
    }

    // Determine complexity
    const fileCount = tree.length;
    if (fileCount < 20) {
        analysis.complexity = 'Simple';
    } else if (fileCount < 100) {
        analysis.complexity = 'Medium';
    } else if (fileCount < 300) {
        analysis.complexity = 'Complex';
    } else {
        analysis.complexity = 'Very Complex';
    }

    // Generate insights
    if (analysis.hasTests && analysis.hasCI) {
        analysis.insights.push('Well-tested with continuous integration');
    }
    if (analysis.hasDocker) {
        analysis.insights.push('Containerized for easy deployment');
    }
    if (analysis.frameworks.length > 2) {
        analysis.insights.push('Multi-technology stack project');
    }
    if (analysis.projectSubCategory === 'Full-Stack') {
        analysis.insights.push('Full-stack application with frontend and backend');
    }

    return analysis;
}

/**
 * Generate description for repos without README
 */
function generateDescription(repo, analysis) {
    let desc = '';

    if (repo.description) {
        desc = repo.description;
    } else {
        // Auto-generate based on analysis
        desc = `${analysis.projectCategory}`;
        if (analysis.projectSubCategory !== 'Unknown') {
            desc += ` - ${analysis.projectSubCategory}`;
        }
        if (analysis.frameworks.length > 0) {
            desc += ` built with ${analysis.frameworks.join(', ')}`;
        }
        if (analysis.languages.length > 0) {
            desc += `. Technologies: ${analysis.languages.slice(0, 3).join(', ')}`;
        }
        if (analysis.hasTests) {
            desc += '. Includes automated tests.';
        }
    }

    return desc;
}

/**
 * Create slug from repo name
 */
function createSlug(name, owner) {
    return `${owner}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

/**
 * Fetch detailed repo information
 */
async function fetchRepoDetails(octokit, owner, repo) {
    try {
        // Get repository info
        const { data: repoData } = await octokit.repos.get({
            owner,
            repo
        });

        // Get languages
        const { data: languages } = await octokit.repos.listLanguages({
            owner,
            repo
        });

        // Get tree (file structure)
        let tree = [];
        try {
            const { data: treeData } = await octokit.git.getTree({
                owner,
                repo,
                tree_sha: repoData.default_branch,
                recursive: 1
            });
            tree = treeData.tree;
        } catch (error) {
            console.log(`Could not fetch tree for ${owner}/${repo}: ${error.message}`);
        }

        // Get README
        let readme = null;
        let readmePreview = null;
        try {
            const { data: readmeData } = await octokit.repos.getReadme({
                owner,
                repo
            });
            const content = Buffer.from(readmeData.content, 'base64').toString('utf-8');
            readme = content;
            readmePreview = content.substring(0, 1000);
        } catch (error) {
            console.log(`No README found for ${owner}/${repo}`);
        }

        // Get contributors
        let contributors = [];
        try {
            const { data: contributorsData } = await octokit.repos.listContributors({
                owner,
                repo,
                per_page: 10
            });
            contributors = contributorsData.map(c => ({
                login: c.login,
                contributions: c.contributions,
                avatar_url: c.avatar_url
            }));
        } catch (error) {
            console.log(`Could not fetch contributors for ${owner}/${repo}`);
        }

        // Analyze project
        const analysis = analyzeProjectStructure(tree, languages, readme);

        return {
            repoData,
            languages,
            tree,
            readme,
            readmePreview,
            contributors,
            analysis
        };
    } catch (error) {
        console.error(`Error fetching details for ${owner}/${repo}:`, error.message);
        return null;
    }
}

/**
 * Sync single repository to database
 */
async function syncRepository(octokit, owner, repo, accountName) {
    console.log(`\n🔄 Syncing: ${owner}/${repo.name}`);

    const details = await fetchRepoDetails(octokit, owner, repo.name);
    if (!details) {
        console.log(`❌ Failed to fetch details for ${repo.name}`);
        return null;
    }

    const { repoData, languages, tree, readme, readmePreview, contributors, analysis } = details;

    // Prepare data for database
    const workData = {
        title: repoData.name.replace(/-/g, ' ').replace(/_/g, ' '),
        description: generateDescription(repoData, analysis),
        projectLink: repoData.homepage || null,
        codeLink: repoData.html_url,
        imgUrl: DEFAULT_GITHUB_IMAGE, // Default image, can be updated via dashboard
        tags: JSON.stringify(repoData.topics || []),

        // Content Management
        isPublished: false, // Start as draft, admin can publish
        isDraft: true,
        isFeatured: false,
        displayOrder: 0,

        // Enhanced Metadata
        category: analysis.projectCategory,
        techStack: JSON.stringify([
            ...analysis.frameworks,
            ...analysis.languages.slice(0, 5)
        ]),
        duration: null, // Can be manually updated
        role: contributors.length > 1 ? 'Contributor' : 'Owner',

        // SEO & Discovery
        slug: createSlug(repoData.name, owner),
        metaTitle: `${repoData.name} - ${analysis.projectCategory}`,
        metaDesc: generateDescription(repoData, analysis),
        keywords: JSON.stringify([
            ...analysis.frameworks,
            ...analysis.languages,
            analysis.projectCategory
        ].filter(Boolean)),

        // Engagement
        views: 0,
        likes: 0,

        // GitHub Integration
        githubUrl: repoData.html_url,
        githubOwner: owner,
        githubRepo: repoData.name,
        isPrivateRepo: repoData.private,
        isGithubProject: true,

        // Repository Metrics
        githubStars: repoData.stargazers_count,
        githubForks: repoData.forks_count,
        githubWatchers: repoData.watchers_count,
        githubIssues: repoData.open_issues_count,

        // Project Analysis
        projectCategory: analysis.projectCategory,
        projectSubCategory: analysis.projectSubCategory,
        totalFiles: tree.filter(item => item.type === 'blob').length,
        totalFolders: tree.filter(item => item.type === 'tree').length,
        maxDepth: Math.max(...tree.map(item => item.path.split('/').length)),

        // Technology Stack
        languages: JSON.stringify(analysis.languages),
        frameworks: JSON.stringify(analysis.frameworks),
        uiLibraries: JSON.stringify(analysis.uiLibraries),
        databases: JSON.stringify(analysis.databases),
        testingTools: JSON.stringify(analysis.testingTools),
        buildTools: JSON.stringify(analysis.buildTools),
        deploymentTools: JSON.stringify(analysis.deploymentTools),

        // Project Features
        hasTests: analysis.hasTests,
        hasDocs: analysis.hasDocs,
        hasCI: analysis.hasCI,
        hasDocker: analysis.hasDocker,

        // Project Structure
        topLevelFolders: JSON.stringify(
            [...new Set(tree
                .filter(item => item.type === 'tree' && !item.path.includes('/'))
                .map(item => item.path))]
        ),
        keyFiles: JSON.stringify(
            tree
                .filter(item =>
                    ['package.json', 'requirements.txt', 'pom.xml', 'Dockerfile', 'README.md', 'LICENSE'].includes(item.path)
                )
                .map(item => item.path)
        ),

        // Insights & Analysis
        insights: JSON.stringify(analysis.insights),
        complexity: analysis.complexity,
        codeQuality: null, // Can be manually assessed

        // Content
        readmePreview: readmePreview,
        fullReadme: readme,

        // Licensing
        license: repoData.license?.name || null,
        licenseUrl: repoData.license?.url || null,

        // Project Timeline
        githubCreatedAt: new Date(repoData.created_at),
        githubUpdatedAt: new Date(repoData.updated_at),
        lastPushedAt: repoData.pushed_at ? new Date(repoData.pushed_at) : null,

        // Repository Status
        isArchived: repoData.archived,
        isTemplate: repoData.is_template,
        defaultBranch: repoData.default_branch,

        // Collaboration
        contributors: JSON.stringify(contributors),
        topics: JSON.stringify(repoData.topics || []),

        // External Links
        homepage: repoData.homepage,
        documentation: null, // Can be manually added
    };

    // Upsert (update if exists, create if not)
    try {
        const work = await prisma.work.upsert({
            where: { slug: workData.slug },
            update: {
                ...workData,
                updatedAt: new Date()
            },
            create: workData
        });

        console.log(`✅ Synced: ${work.title} (${work.isPrivateRepo ? 'Private' : 'Public'})`);
        return work;
    } catch (error) {
        console.error(`❌ Error syncing ${repo.name}:`, error.message);
        return null;
    }
}

/**
 * Fetch all repositories with pagination
 */
async function fetchAllRepositories(octokit, username, perPage = 30) {
    let page = 1;
    let allRepos = [];
    let hasMore = true;

    while (hasMore) {
        try {
            const { data: repos } = await octokit.repos.listForUser({
                username,
                per_page: perPage,
                page,
                sort: 'updated',
                direction: 'desc'
            });

            if (repos.length === 0) {
                hasMore = false;
            } else {
                allRepos = [...allRepos, ...repos];
                console.log(`📄 Fetched page ${page} for ${username} (${repos.length} repos)`);
                page++;
            }
        } catch (error) {
            console.error(`Error fetching repos for ${username}:`, error.message);
            hasMore = false;
        }
    }

    return allRepos;
}

/**
 * Main sync function
 */
async function syncAllRepositories() {
    console.log('🚀 Starting GitHub Repository Auto-Sync...\n');

    // Initialize Octokit (lazy load ES Module)
    await initializeOctokit();

    const startTime = Date.now();
    let totalSynced = 0;
    let totalFailed = 0;

    try {
        // Fetch repos from EKD Digital account
        console.log('📦 Fetching repositories from EKD Digital...');
        const ekdRepos = await fetchAllRepositories(octokitEkd, 'ekddigital');
        console.log(`Found ${ekdRepos.length} repositories\n`);

        // Sync EKD Digital repos
        for (const repo of ekdRepos) {
            const result = await syncRepository(octokitEkd, 'ekddigital', repo, 'EKD Digital');
            if (result) totalSynced++;
            else totalFailed++;

            // Rate limiting: wait 1 second between repos
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Fetch repos from Hetawk account
        console.log('\n📦 Fetching repositories from Hetawk...');
        const hetawkRepos = await fetchAllRepositories(octokitHetawk, 'Hetawk');
        console.log(`Found ${hetawkRepos.length} repositories\n`);

        // Sync Hetawk repos
        for (const repo of hetawkRepos) {
            const result = await syncRepository(octokitHetawk, 'Hetawk', repo, 'Hetawk');
            if (result) totalSynced++;
            else totalFailed++;

            // Rate limiting: wait 1 second between repos
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);

        console.log('\n' + '='.repeat(60));
        console.log('✨ GitHub Sync Complete!');
        console.log('='.repeat(60));
        console.log(`Total Repositories: ${ekdRepos.length + hetawkRepos.length}`);
        console.log(`Successfully Synced: ${totalSynced}`);
        console.log(`Failed: ${totalFailed}`);
        console.log(`Duration: ${duration} seconds`);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('❌ Sync failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

// Run if called directly
if (require.main === module) {
    syncAllRepositories();
}

module.exports = { syncAllRepositories, syncRepository };
