const { PrismaClient } = require('./backend_api/node_modules/@prisma/client');
const prisma = new PrismaClient();

async function publishProjects() {
    console.log('🚀 Publishing projects...\n');

    // Publish projects with 50+ files (quality projects)
    const result = await prisma.work.updateMany({
        where: {
            isGithubProject: true,
            totalFiles: { gte: 50 }
        },
        data: {
            isPublished: true,
            isDraft: false
        }
    });

    console.log(`✅ Published ${result.count} projects\n`);

    // Show what was published
    const published = await prisma.work.findMany({
        where: { isPublished: true },
        select: {
            title: true,
            totalFiles: true,
            complexity: true,
            category: true
        },
        orderBy: { totalFiles: 'desc' }
    });

    console.log(`📚 ${published.length} Projects Now Visible:\n`);
    published.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title}`);
        console.log(`   └─ ${p.totalFiles} files | ${p.complexity} | ${p.category}\n`);
    });

    await prisma.$disconnect();

    console.log('🎉 Done! Refresh your browser at http://localhost:3000\n');
}

publishProjects().catch(console.error);
