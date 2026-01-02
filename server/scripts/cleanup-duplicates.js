const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Cleaning up duplicates...\n');

    // Find all MedDef publications
    const medDefPubs = await prisma.publication.findMany({
        where: { title: { contains: 'MedDef' } }
    });
    console.log('📚 Found', medDefPubs.length, 'MedDef publications');

    // Delete the UUID-based ones (they're duplicates from running script twice)
    for (const pub of medDefPubs) {
        if (!pub.id.startsWith('pub-')) {
            await prisma.publication.delete({ where: { id: pub.id } });
            console.log('   ❌ Deleted duplicate:', pub.id);
        } else {
            console.log('   ✅ Keeping:', pub.id);
        }
    }

    // Find all peer reviews
    const allReviews = await prisma.peerReview.findMany();
    console.log('\n📝 Found', allReviews.length, 'peer reviews');

    // Delete UUID-based duplicates
    for (const review of allReviews) {
        if (!review.id.startsWith('review-')) {
            await prisma.peerReview.delete({ where: { id: review.id } });
            console.log('   ❌ Deleted duplicate:', review.journalName, '|', review.id);
        } else {
            console.log('   ✅ Keeping:', review.journalName, '|', review.id);
        }
    }

    // Final count
    const pubs = await prisma.publication.findMany();
    const reviews = await prisma.peerReview.findMany();

    console.log('\n✅ After cleanup:');
    console.log('   Publications:', pubs.length);
    pubs.forEach(p => console.log('     -', p.title.substring(0, 60)));
    console.log('   Peer Reviews:', reviews.length);
    reviews.forEach(r => console.log('     -', r.journalName));

    await prisma.$disconnect();
}

cleanup().catch(console.error);
