const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const WISHES = [
  {
    title: "Help with school books",
    description: "I need help purchasing textbooks for the upcoming semester. Any support would be greatly appreciated.",
    category: "education",
    occasionType: "anytime_alms"
  },
  {
    title: "Birthday dinner experience",
    description: "I'd love to celebrate my birthday with a nice dinner out. Looking for someone to help make it special.",
    category: "experiences",
    occasionType: "birthday"
  },
  {
    title: "Grocery essentials for the month",
    description: "Going through a tough patch financially. Help with basic groceries would mean the world to me.",
    category: "basic_needs",
    occasionType: "anytime_alms"
  }
];

async function main() {
  const password = await bcrypt.hash("password123", 10);

  for (let i = 1; i <= 10; i++) {
    const emailName = `test${i}`;
    const email = `${emailName}@gmail.com`;

    // Upsert so the script is safe to re-run
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `Test User ${i}`,
        passwordHash: password,
        status: "active"
      }
    });

    // Only add wishes if this user has none yet
    const existing = await prisma.wish.count({ where: { userId: user.id } });
    if (existing === 0) {
      for (const wish of WISHES) {
        await prisma.wish.create({
          data: {
            userId: user.id,
            title: `[${emailName}] ${wish.title}`,
            description: wish.description,
            category: wish.category,
            occasionType: wish.occasionType,
            visibility: "public",
            status: "open"
          }
        });
      }
    }

    console.log(`✓ ${email} — wishes ready`);
  }

  console.log("\nDone. 10 users seeded.");
  console.log("Login with any test email, password: password123");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
