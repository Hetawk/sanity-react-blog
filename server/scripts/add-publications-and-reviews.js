/**
 * Add MedDef paper (under review) and peer reviewer entries
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addData() {
    console.log('🚀 Adding publications and peer review entries...\n');

    try {
        // 1. Add the paper under review as a Publication (upsert to avoid duplicates)
        const medDefPaper = await prisma.publication.upsert({
            where: { id: 'pub-meddef-adversarial-medical-imaging-2025' },
            update: {}, // Don't update if exists
            create: {
                id: 'pub-meddef-adversarial-medical-imaging-2025',
                title: 'MedDef: Efficient Self-Attention Model for Adversarial Resilience in Medical Imaging',
                abstract: 'This paper presents MedDef, an efficient self-attention architecture with structured pruning designed for adversarial defense in medical imaging applications. The model achieves robust performance against adversarial attacks while maintaining computational efficiency through strategic pruning techniques.',
                authors: 'Enoch Kwateh Dongbo, Sijie Niu, et al.',
                venue: 'Neuroscience Informatics',
                year: 2025,
                type: 'journal',
                category: 'AI Security',
                keywords: JSON.stringify(['adversarial defense', 'medical imaging', 'self-attention', 'structured pruning', 'deep learning', 'neural networks']),
                notes: 'Under Review - Manuscript ID: NEURI-D-25-00316',
                resumeSummary: 'Efficient adversarial defense for medical imaging with structured pruning. Under review at Neuroscience Informatics.',
                isPublished: true,
                isFeatured: true,
                displayOrder: 1
            }
        });
        console.log('✅ Added MedDef paper:', medDefPaper.id);
        console.log('   Title:', medDefPaper.title);
        console.log('   Venue:', medDefPaper.venue);
        console.log('');

        // 2. Add Physica Scripta peer reviewer entry (upsert to avoid duplicates)
        const physicaScripta = await prisma.peerReview.upsert({
            where: { id: 'review-peer-review-physica-scripta' },
            update: {}, // Don't update if exists
            create: {
                id: 'review-peer-review-physica-scripta',
                title: 'Peer Reviewer - Physica Scripta',
                journalName: 'Physica Scripta',
                reviewType: 'Anonymous',
                role: 'Reviewer',
                year: 2025,
                verifiedBy: 'Web of Science',
                verified: true,
                publisher: 'IOP Publishing',
                organization: 'IOP Publishing',
                resumeSummary: 'Peer reviewer for Physica Scripta, a Web of Science indexed physics journal published by IOP Publishing.',
                isPublished: true,
                isFeatured: true,
                displayOrder: 1
            }
        });
        console.log('✅ Added Physica Scripta reviewer:', physicaScripta.id);
        console.log('   Journal:', physicaScripta.journalName);
        console.log('   Verified by:', physicaScripta.verifiedBy);
        console.log('');

        // 3. Add Knowledge-Based Systems peer reviewer entry (upsert to avoid duplicates)
        const kbs = await prisma.peerReview.upsert({
            where: { id: 'review-peer-review-knowledge-based-systems-revi' },
            update: {}, // Don't update if exists
            create: {
                id: 'review-peer-review-knowledge-based-systems-revi',
                title: 'Peer Reviewer - Knowledge-Based Systems',
                journalName: 'Knowledge-Based Systems',
                reviewType: 'Anonymous',
                role: 'Reviewer',
                year: 2025,
                verifiedBy: 'Elsevier',
                verified: true,
                publisher: 'Elsevier',
                organization: 'Elsevier',
                resumeSummary: 'Peer reviewer for Knowledge-Based Systems, a leading Elsevier journal in AI and machine learning.',
                isPublished: true,
                isFeatured: true,
                displayOrder: 2
            }
        });
        console.log('✅ Added Knowledge-Based Systems reviewer:', kbs.id);
        console.log('   Journal:', kbs.journalName);
        console.log('   Verified by:', kbs.verifiedBy);
        console.log('');

        console.log('🎉 All entries added successfully!');

        // Show summary
        const pubCount = await prisma.publication.count();
        const reviewCount = await prisma.peerReview.count();
        console.log('\n📊 Summary:');
        console.log(`   Publications: ${pubCount}`);
        console.log(`   Peer Reviews: ${reviewCount}`);

    } catch (error) {
        if (error.code === 'P2002') {
            console.log('⚠️  Entry already exists (duplicate)');
        } else {
            throw error;
        }
    }
}

addData()
    .catch(e => console.error('❌ Error:', e))
    .finally(() => prisma.$disconnect());
