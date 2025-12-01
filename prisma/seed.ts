import { PrismaClient } from "@prisma/client";
// import * as bcrypt from "bcryptjs"; // You'll need to install this

const prisma = new PrismaClient();

async function main() {
  // Create user types
  const userTypes = await Promise.all([
    prisma.userType.upsert({
      where: { name: "admin" },
      update: {},
      create: { name: "admin" },
    }),
    prisma.userType.upsert({
      where: { name: "patient" },
      update: {},
      create: { name: "patient" },
    }),
    prisma.userType.upsert({
      where: { name: "pharmacy" },
      update: {},
      create: { name: "pharmacy" },
    }),
    prisma.userType.upsert({
      where: { name: "charity" },
      update: {},
      create: { name: "charity" },
    }),
  ]);

  console.log("Seeded user types:", userTypes);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
