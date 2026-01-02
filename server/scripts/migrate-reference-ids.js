/**
 * Migration Script: Reference IDs to UUIDs
 * 
 * This script migrates existing Reference records from slug-based IDs to proper UUIDs.
 * The old slug-style ID is preserved in the new `slug` field.
 * 
 * Usage: node scripts/migrate-reference-ids.js
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

/**
 * Generate a slug from a name
 * @param {string} name - The name to slugify
 * @returns {string} The slug
 */
function generateSlug(name) {
    return 'ref-' + name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

async function migrateReferenceIds() {
    console.log('🚀 Starting Reference ID migration...\n');

    try {
        // Get all references (using backticks to escape reserved word)
        const references = await prisma.$queryRaw`SELECT * FROM \`references\``;

        console.log(`📋 Found ${references.length} references to migrate\n`);

        if (references.length === 0) {
            console.log('✅ No references to migrate.');
            return;
        }

        // Check if any already have UUID format
        const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

        for (const ref of references) {
            const oldId = ref.id;
            const isAlreadyUuid = uuidPattern.test(oldId);

            if (isAlreadyUuid) {
                console.log(`⏭️  Skipping ${ref.name} - already has UUID: ${oldId}`);

                // Still need to add slug if missing
                if (!ref.slug) {
                    const slug = generateSlug(ref.name);
                    await prisma.$executeRaw`UPDATE \`references\` SET slug = ${slug} WHERE id = ${oldId}`;
                    console.log(`   Added slug: ${slug}`);
                }
                continue;
            }

            // Generate new UUID and use old ID as slug
            const newId = uuidv4();
            const slug = oldId; // Old ID becomes the slug

            console.log(`🔄 Migrating: ${ref.name}`);
            console.log(`   Old ID (now slug): ${oldId}`);
            console.log(`   New UUID: ${newId}`);

            // Update the record with new UUID and slug
            // We need to use raw SQL because Prisma doesn't allow changing primary keys directly
            await prisma.$executeRaw`
                UPDATE \`references\` 
                SET id = ${newId}, slug = ${slug}
                WHERE id = ${oldId}
            `;

            console.log(`   ✅ Migrated successfully\n`);
        }

        console.log('\n🎉 Migration completed successfully!');

        // Verify the migration
        console.log('\n📊 Verification:');
        const updatedRefs = await prisma.reference.findMany({
            select: { id: true, slug: true, name: true },
            take: 5,
        });

        console.log('Sample migrated references:');
        updatedRefs.forEach(ref => {
            console.log(`  - ${ref.name}: id=${ref.id.substring(0, 8)}..., slug=${ref.slug}`);
        });

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
migrateReferenceIds()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error:', error);
        process.exit(1);
    });
