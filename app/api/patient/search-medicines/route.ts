// app/api/patient/search-medicines/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InventoryStatus } from "@/lib/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const medicine = searchParams.get("medicine")?.trim();
    const city = searchParams.get("city")?.trim();
    const pharmacyName = searchParams.get("name")?.trim();

    if (!medicine) {
      return NextResponse.json(
        { success: false, error: "Medicine name is required" },
        { status: 400 }
      );
    }

    const statusFilter: InventoryStatus[] = [InventoryStatus.IN_STOCK, InventoryStatus.LOW];

    // 1️⃣ Find medicines
    const medicines = await db.medicine.findMany({
      where: {
        OR: [
          { name: { contains: medicine, mode: "insensitive" } },
          { genericName: { contains: medicine, mode: "insensitive" } },
          { synonyms: { contains: medicine, mode: "insensitive" } },
        ],
      },
      select: { id: true },
    });

    if (!medicines.length) {
      return NextResponse.json({ success: true, data: { results: [], total: 0 } });
    }

    const medicineIds = medicines.map((m) => m.id);

    // 2️⃣ Find pharmacies with matching medicines
    const pharmacies = await db.user.findMany({
      where: {
        userType: { name: "pharmacy" },
        status: "APPROVED",
        ...(city ? { city: { equals: city, mode: "insensitive" } } : {}),
        ...(pharmacyName ? { name: { contains: pharmacyName, mode: "insensitive" } } : {}),
        pharmacyMedicines: {
          some: { medicineId: { in: medicineIds }, status: { in: statusFilter } },
        },
      },
      select: {
        id: true,
        name: true,
        city: true,
        phone: true,
        hasDelivery: true,
        pharmacyMedicines: {
          where: { medicineId: { in: medicineIds }, status: { in: statusFilter } },
          select: {
            id: true,
            medicine: { select: { id: true, name: true } },
            status: true,
            quantity: true,
            expiresAt: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { results: pharmacies, total: pharmacies.length },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
