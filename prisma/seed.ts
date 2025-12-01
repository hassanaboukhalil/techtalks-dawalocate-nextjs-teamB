import { db } from "../lib/db";

async function seed() {
  console.log("🌱 Starting seed...");

  await db.userType.createMany({
    data: [
      { name: "admin" },
      { name: "pharmacy" },
      { name: "charity" },
      { name: "patient" },
    ],
    skipDuplicates: true, // Important: prevents error if already exists
  });

  console.log("✅ Created user types");

  const medicines = [
    {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      strength: "500mg",
      form: "Tablet",
      description: "Pain reliever and fever reducer",
    },
    {
      name: "Paracetamol",
      genericName: "Acetaminophen",
      strength: "1000mg",
      form: "Tablet",
      description: "Pain reliever and fever reducer - Extra strength",
    },
    {
      name: "Amoxicillin",
      genericName: "Amoxicillin",
      strength: "500mg",
      form: "Capsule",
      description: "Antibiotic for bacterial infections",
    },
  ];

  for (const med of medicines) {
    const existing = await db.medicine.findFirst({
      where: {
        name: med.name,
        strength: med.strength,
        form: med.form,
      },
    });

    if (!existing) {
      await db.medicine.create({ data: med });
      console.log(`✅ Created: ${med.name} ${med.strength} ${med.form}`);
    } else {
      console.log(
        `❗  Already exists: ${med.name} ${med.strength} ${med.form}`
      );
    }
  }

  console.log("🎉 Seed completed successfully!");
}

seed()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
