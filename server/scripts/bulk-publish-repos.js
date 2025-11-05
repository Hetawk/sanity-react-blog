/**
 * Bulk Publish Public GitHub Repos
 * 
 * This script publishes all unpublished GitHub repos that are:
 * - Public (not private)
 * - Not archived
 * - From GitHub sync
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function bulkPublishRepos() {
    console.log('🔄 Bulk publishing public, non-archived GitHub repos...\n');

    try {
        // Find all unpublished works that are public and not archived
        const unpublishedPublicRepos = await prisma.work.findMany({
            where: {
                isPublished: false,
                isGithubProject: true,
                isPrivateRepo: false,
                isArchived: false
            },
            select: {
                id: true,
                title: true,
                githubUrl: true
            }
        });

        console.log(`Found ${unpublishedPublicRepos.length} unpublished public repos:\n`);

        if (unpublishedPublicRepos.length > 0) {
            unpublishedPublicRepos.forEach((repo, index) => {
                console.log(`   ${index + 1}. ${repo.title}`);
            });

            console.log('\n📝 Publishing...\n');

            // Update them to published
            const result = await prisma.work.updateMany({
                where: {
                    isPublished: false,
                    isGithubProject: true,
                    isPrivateRepo: false,
                    isArchived: false
                },
                data: {
                    isPublished: true,
                    isDraft: false,
                    publishedAt: new Date()
                }
            });

            console.log(`✅ Published ${result.count} repos\n`);

            // Show updated counts
            const total = await prisma.work.count();
            const published = await prisma.work.count({ where: { isPublished: true } });
            const unpublished = await prisma.work.count({ where: { isPublished: false } });

            console.log('📊 Updated counts:');
            console.log(`   Total works: ${total}`);
            console.log(`   Published: ${published}`);
            console.log(`   Unpublished: ${unpublished}\n`);

            console.log('✨ Done! Refresh your frontend to see all published repos.\n');
        } else {
            console.log('ℹ️  No unpublished public repos to update\n');
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

bulkPublishRepos();
