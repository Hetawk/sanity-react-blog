const path = require('path');
const { PrismaClient } = require(path.join(__dirname, 'server', 'node_modules', '@prisma/client'));
const prisma = new PrismaClient();

async function main() {
    const leadership = await prisma.leadership.count({ where: { type: 'leadership' } });
    const volunteer = await prisma.leadership.count({ where: { type: 'volunteer' } });
    const work = await prisma.leadership.count({ where: { type: 'work' } });
    const total = await prisma.leadership.count();

    console.log('📊 Leadership Role Type Distribution:');
    console.log(`   Leadership: ${leadership}`);
    console.log(`   Volunteer:  ${volunteer}`);
    console.log(`   Work:       ${work}`);
    console.log(`   Total:      ${total}`);

    await prisma.$disconnect();
}
main();
