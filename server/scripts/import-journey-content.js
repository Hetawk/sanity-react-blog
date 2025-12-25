/**
 * Import Journey Content from other_professional-summary.md
 * 
 * Run this script after running prisma migrate to populate the journey_sections table
 * Usage: node scripts/import-journey-content.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Journey sections data based on other_professional-summary.md (CORRECTED VERSION)
const journeySections = [
  {
    partNumber: 1,
    title: "Academic Foundation",
    subtitle: "Messiah Mission Institute, Liberia",
    organization: "Messiah Mission Institute",
    location: "Liberia",
    duration: "7th Grade – 12th Grade",
    category: "Education",
    icon: "🎓",
    role: "Class President (Consecutive Terms) | Valedictorian",
    summary: "My journey of blending academic excellence with leadership began in high school at the Messiah Mission Institute in Liberia—serving as class president from 7th grade through 12th grade and graduating as valedictorian.",
    content: `My journey of blending academic excellence with leadership began in high school at the **Messiah Mission Institute** in Liberia. From an early age, I was a passionate and brilliant scholar with a competitive spirit. I would say in my heart that no one would top me in my class—and by God's grace, that conviction became reality semester after semester.

The Messiah Mission Institute had a unique program: the student with the highest grades in each semester would serve as class president for that term. In Liberia, there are six semesters that make up a school year. By the grace of God, **I served as class president from 7th grade all the way through 12th grade**—from junior high straight through to senior high.

When I graduated, I had the honor of serving as the **valedictorian** for my graduating class. I also received a grade promotion during my early years, advancing a grade level due to academic performance.

### Key Foundation
These formative years at Messiah Mission Institute shaped the foundation of who I am today—instilling in me the discipline, drive, and dedication that would carry me through university and beyond.`
  },
  {
    partNumber: 2,
    title: "University Years in China",
    subtitle: "Bachelor's & Master's in Computer Science & Technology",
    organization: "Zhejiang Sci-Tech University (Bachelor's) → University of Jinan (Master's)",
    location: "Hangzhou & Jinan, China",
    duration: "2019 – 2026",
    category: "Education",
    icon: "🎓",
    summary: "From Bachelor's at Zhejiang Sci-Tech University in Hangzhou to Master's at University of Jinan—a journey of academic excellence, helping others, and personal growth.",
    content: `### Academic Journey

**Bachelor of Engineering in Computer Science and Technology**  
Zhejiang Sci-Tech University (ZSTU), Hangzhou, China | 2019 – 2023

**Master of Engineering in Computer Science and Technology**  
University of Jinan, Jinan, China | 2023 – 2026 (Expected)

### Balancing Brilliance with Humility

Amid my many church activities and leadership responsibilities, there was a season when I faced challenges with my academic supervisor. He was a strong teacher with an excellent reputation, and initially, he was worried that I would not perform well academically—he saw a student constantly engaged in activities outside the laboratory.

What my supervisor did not yet know was that I was not just a passionate leader in the church—**I was also an excellent student**.

### A Gift for Helping Others

Most days, I found myself helping friends in need of assistance—formatting documents, finding research content, explaining complex concepts. What always amazed me was the diversity of these requests: I would find myself working on mechanical engineering projects, business analysis papers, international economics and trade assignments, even medical research—all while studying computer science.

The only answer I could find was this: **the desire to help opens a door of grace**. When you take the time to look at someone's work with genuine intent to assist, God grants you understanding.

### The Turning Point: Thesis Proposal Defense

Everything changed when we conducted our thesis proposal defenses. **My proposal was the best among all the international students**—recommended as a model for others to follow. From that moment, my supervisor's perception of me transformed completely. He became proud of me, speaking highly of me to his colleagues.

### Research Focus: Adversarial Machine Learning

My graduate research centers on **adversarial machine learning**—specifically developing defense mechanisms that protect AI systems from malicious attacks. My flagship research project, **MedDef**, introduces a Defense-Aware Attention Mechanism (DAAM) that maintains high diagnostic accuracy while defending against attacks.

**Research Under Review:**
- MedDef manuscript currently under review at **Elsevier's Knowledge-Based Systems** and **Neurocomputing**

**Published Work (Co-Author):**
- "A robust deep learning model for fish image classification," *Engineering Research Express*, published 2025. [DOI Link](https://iopscience.iop.org/article/10.1088/2631-8695/add648) (266+ downloads)

### Academic Service

**Peer Review** (verified on [ORCID](https://orcid.org/0009-0005-5213-9834)):
- **Reviewer**, Knowledge-Based Systems (Elsevier, ISSN 0950-7051), 2025
- **Reviewer**, Physica Scripta (Clarivate, ISSN 1402-4896), 2025`
  },
  {
    partNumber: 3,
    title: "Church Leadership in Jinan",
    subtitle: "Jinan International Christian Fellowship (JICF)",
    organization: "Jinan International Christian Fellowship",
    location: "Jinan, China",
    duration: "2023 – Present",
    category: "Church",
    icon: "⛪",
    role: "Sunday Service Coordinator (LOC Chair) & Multiple Ministry Roles",
    summary: "From reviving a dormant campus Bible study to serving as the Sunday Service Coordinator—the primary student leader responsible for operational management of the entire fellowship.",
    content: `### The Journey Begins

When I first arrived in Jinan in 2023, I immediately began searching for a local Christian fellowship. After two weeks, I connected with the **Jinan International Christian Fellowship (JICF)** through a Congolese friend.

Upon arriving, I discovered that the Bible study group on our campus had become dormant. Without waiting for official approval, **I took the initiative to revive the Bible study**. Initially, we were only three people. But as time went on, more people joined, and the group began to flourish again.

### Multiple Ministry Roles

**Campus Bible Study Coordinator** (2023-2024)  
Led the revival and growth of the campus Bible study ministry.

**Worship Ministry Member & Prayer Ministry Vice Coordinator** (2023-2024)  
Served in music ministry while also helping coordinate corporate prayer.

**Sunday Service Coordinator (LOC Chair)** (May 2024-Present)  
As the Local Organizing Committee Chair, I serve as the **primary student leader responsible for operational management** of the entire fellowship. I work alongside the Senior Pastor and Elders to ensure seamless execution of all church activities.

### A Calling I Initially Resisted

My journey into this leadership role was neither planned nor initially welcomed. I prepared my excuses carefully: "I'm too busy with my Master's degree." But when the leadership approached me, I watched as no one else stepped forward.

They presented what I now call "the temporary arrangement trap." Despite wanting to say no, I accepted. What I didn't anticipate was how this "temporary" assignment would become **one of the most transformative experiences of my life**.

### Key Responsibilities
- Service coordination and flow management
- Cross-cultural liaison between international fellowship and Chinese hosts
- National-level representation at fellowship leaders' meetings
- Event planning for Welcome Services, Christmas, Easter celebrations
- Pastor's Representative for Campuses for Christ Ministry`
  },
  {
    partNumber: 4,
    title: "International Christian Festivals Leadership",
    subtitle: "Northern Prayer Ministry Leader",
    organization: "International Christian Festivals (ICF) – China",
    location: "Northern China",
    duration: "2025 – 2026",
    category: "Leadership",
    icon: "🙏",
    role: "Northern Prayer Ministry Leader",
    summary: "Called to lead the Northern Prayer Ministry responsible for coordinating prayer activities across fellowships in northern China.",
    content: `### Background

The International Christian Fellowship in China is organized regionally, with different ministries serving different geographical areas. The **Northern Prayer Ministry** is responsible for coordinating prayer activities across fellowships in northern China.

### The Call

During my term serving as the **Assistant Leader for the Northern Prayer Ministry** (2024-2025), I perceived in my spirit that I would be called upon to lead the ministry myself. Unlike my experience with the LOC position, this time I was ready. I did not plan to say no—I knew within my spirit that God wanted me to help.

Interestingly, before the official call came, I was also invited to serve the Liberian Student Community as Secretary for the National Leadership. However, because I did not sense in my spirit that these were roles God was calling me to, **I declined after careful consideration**.

### The Official Appointment

When the outgoing Northern Prayer Ministry Leader officially proposed that I take her place, she offered to give me time to pray. However, I already knew the answer was yes—there was no need to delay. After a brief formality of "praying over it," I confirmed my acceptance. My name was submitted to the Executive Board, I was interviewed, and **I received an official appointment letter**.

### Building the Team

I formed a leadership board for the Northern Prayer Ministry, calling two additional members to serve alongside me: a Secretary and a Vice Coordinator. We are currently serving together, learning and working with people from different backgrounds as we serve the various fellowships in northern China.`
  },
  {
    partNumber: 5,
    title: "Student Union Leadership",
    subtitle: "Liberian Student Union in China (LSUIC)",
    organization: "Liberian Student Union in China (LSUIC) & Jinan Union of Liberian Students (JULS)",
    location: "China",
    duration: "2023 – 2025",
    category: "Leadership",
    icon: "🤝",
    role: "Vice Chair (Academic Excellence), Chaplain General, Election Commissioner Chair",
    summary: "Leadership extended to the academic community through various roles in the Liberian Student Union at both national and city levels.",
    content: `### Role 1: Vice Chair, Academic Excellence Committee

**Organization:** Liberian Student Union in China (LSUIC)  
**Duration:** 2023 – 2024

During the 2023-2024 academic year, I served as the Vice Chair for the Academic Excellence Committee. In this role, I worked alongside the Chair to create academic programs for Liberian students across China.

**Key Activities:**
- Organized a Winter Debate competition for Liberian students
- Developed promotional materials using Photoshop and graphic design tools
- Coordinated academic support initiatives

This role pushed me to develop skills I had not previously explored in depth, particularly in **graphic design and program coordination**.

---

### Role 2: Chaplain General, Jinan Union of Liberian Students

**Organization:** Jinan Union of Liberian Students (JULS)  
**Duration:** 2024 – 2025

For the 2024-2025 leadership term, I served as the **Chaplain General** for my city chapter.

**Responsibilities:**
- Led prayers and devotions at student union gatherings
- Provided spiritual guidance to the Liberian student community in Jinan
- Served as the technical person on the team, handling computer-related issues

---

### Role 3: Election Commissioner Chair

**Organization:** Jinan Union of Liberian Students (JULS)  
**Duration:** 2025

At the end of our term, I was appointed as the **Election Commissioner Chair** for the city—organizing the election process to bring in new leadership.

**Key Achievements:**
- Built and integrated an online voting system into my existing website infrastructure
- Configured time-bound voting with automatic cutoff
- Implemented voter registration verification
- Coordinated with the national election commissioner`
  },
  {
    partNumber: 6,
    title: "Fishers of Men (FOM) Organization",
    subtitle: "Spiritual Foundation & Fellowship",
    organization: "Fishers of Men (FOM)",
    location: "Originally Nanjing, China",
    duration: "2019 – Present",
    category: "Ministry",
    icon: "🙏",
    role: "Leader",
    websiteUrl: "https://fomjesus.org",
    summary: "Of all the roles I hold, the Fishers of Men (FOM) organization represents the source of my spiritual strength—the community that helped build my spiritual life during challenging early years in China.",
    content: `Of all the roles I hold, the **Fishers of Men (FOM)** organization represents the source of my spiritual strength.

When I first came to China in 2019, life was challenging. FOM was the community that helped build my spiritual life during those difficult early years. The leaders and teammates impacted me profoundly, and this Christian organization has shaped me in ways I cannot fully articulate.

### How I Became Leader

Over time, **without any formal appointment, the members simply began calling me their leader**. We meet for Bible study on Sundays and Wednesdays, and hold prayer sessions on Saturdays. Though I am no longer physically present with them consistently, those on the ground continue to meet regularly, and I join them for Bible study and prayer when possible.

### Monthly Prayer and Fasting

One of FOM's most powerful practices is a **monthly prayer and fasting period**—the last seven days of every month before the month ends. These times of consecration have been transformative spiritual experiences, helping us grow and witness God's power in unimaginable ways.

FOM remains my spiritual anchor, reminding me that all my leadership and achievements flow from a foundation of prayer, community, and dependence on God.

### Website
Visit our ministry at [fomjesus.org](https://fomjesus.org)`
  },
  {
    partNumber: 7,
    title: "Technical Expertise & Entrepreneurship",
    subtitle: "A.N.D. GROUP OF COMPANIES LLC & EKD Digital",
    organization: "A.N.D. GROUP OF COMPANIES LLC",
    location: "Liberia",
    duration: "August 2025 – Present",
    category: "Entrepreneurship",
    icon: "💻",
    role: "Founder & Chief Executive Officer",
    websiteUrl: "https://ekddigital.com",
    summary: "In August 2025, I took a leap of faith and registered my own company in Liberia—a technology company serving both commercial clients and kingdom purposes.",
    content: `### Founding A.N.D. GROUP OF COMPANIES LLC

**Founder & Chief Executive Officer**  
A.N.D. GROUP OF COMPANIES LLC | Liberia  
**Registered:** August 19, 2025  
**Business Registration No.:** 053881378 | **TIN:** 502203616

In August 2025, I took a leap of faith and registered my own company in Liberia. The vision was simple but ambitious: to build a technology company that serves both commercial clients and kingdom purposes, creating employment opportunities for talented individuals who share my values.

### The Journey to Company Formation

The seed for this company was planted during my undergraduate years. I spent countless hours helping friends with their projects—not just in computer science, but across disciplines. Each project I tackled expanded my capabilities.

When I entered my Master's program, my confidence had grown. With the emergence of powerful AI coding assistants, I realized that my years of hands-on experience had prepared me to leverage these tools effectively. As I often say: _"With AI, I only need to think mainly of the logic. Now, I am not afraid of any programming language because AI is there."_

### Team Building: Employing Friends as Co-Workers

One of my greatest joys has been **hiring friends as team members**. I have always believed in lifting others as I climb, and building a company allowed me to create opportunities for talented individuals in my network.

---

## EKD Digital: Technology for the Kingdom

**Website:** [ekddigital.com](https://www.ekddigital.com)

EKD Digital is a subsidiary of A.N.D. GROUP OF COMPANIES LLC, founded on biblical principles with a mission to glorify God through ethical technology.

### The KINGDOM Values

Our core values spell out **KINGDOM**, guiding every decision we make:

- **K**nowledge — Continuous learning and sharing expertise
- **I**ntegrity — Ethical practices in all operations
- **N**obility — Treating all with dignity and respect
- **G**overnance — Structured, responsible leadership
- **D**ominion — Excellence and mastery in our craft
- **O**ptimization — Efficiency in processes and solutions
- **M**ission — Purpose-driven work for God's glory

### Technical Portfolio

Throughout my academic and professional journey, I have built **94+ projects** spanning artificial intelligence, web development, mobile applications, DevOps, and scientific computing.`
  }
];

async function importJourneyContent() {
  console.log('🚀 Starting journey content import...\n');
  
  try {
    // Check if table exists and clear existing data
    const existingCount = await prisma.journeySection.count();
    if (existingCount > 0) {
      console.log(`📦 Found ${existingCount} existing sections. Clearing...`);
      await prisma.journeySection.deleteMany({});
      console.log('✅ Existing sections cleared.\n');
    }
    
    // Import new sections
    console.log(`📝 Importing ${journeySections.length} journey sections...\n`);
    
    for (const section of journeySections) {
      const created = await prisma.journeySection.create({
        data: {
          ...section,
          displayOrder: section.partNumber,
          isPublished: true,
          isFeatured: section.partNumber <= 3 // Feature first 3 sections
        }
      });
      
      console.log(`  ✅ Part ${section.partNumber}: ${section.title}`);
    }
    
    console.log('\n🎉 Successfully imported all journey sections!');
    console.log(`   Total sections: ${journeySections.length}`);
    
    // Verify import
    const finalCount = await prisma.journeySection.count();
    console.log(`   Verified in database: ${finalCount} sections`);
    
  } catch (error) {
    console.error('❌ Error importing journey content:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
importJourneyContent()
  .then(() => {
    console.log('\n✨ Import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Import failed:', error);
    process.exit(1);
  });
