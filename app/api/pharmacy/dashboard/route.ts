import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { db } from "@/lib/db";

export async function GET() {
  try {
    // 1. Authenticate the User
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // 2. Verify User is a Pharmacy
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { userType: true }
    });

    if (!user || user.userType.name !== "pharmacy") {
      return NextResponse.json({ error: "Forbidden: Pharmacy access only" }, { status: 403 });
    }

    // 3. Define Logic
    const LOW_STOCK_THRESHOLD = 10; 

    // 4. Fetch Stats using a Transaction (One DB trip is faster)
    const [totalMedicines, outOfStock, lowStock, inStock] = await db.$transaction([
      
      // A. Total medicines in this pharmacy's inventory
      db.pharmacyMedicine.count({
        where: { pharmacyId: userId }
      }),

      // B. Out of Stock (Quantity 0)
      db.pharmacyMedicine.count({
        where: { 
          pharmacyId: userId,
          quantity: 0
        }
      }),

      // C. Low Stock (Quantity 1-10)
      db.pharmacyMedicine.count({
        where: { 
          pharmacyId: userId,
          quantity: { gt: 0, lte: LOW_STOCK_THRESHOLD }
        }
      }),

      // D. In Stock (Quantity > 10)
      db.pharmacyMedicine.count({
        where: { 
          pharmacyId: userId,
          quantity: { gt: LOW_STOCK_THRESHOLD }
        }
      }),
    ]);

    // 5. Return Data
    return NextResponse.json({
      success: true,
      data: {
        total: totalMedicines,
        inStock: inStock,
        lowStock: lowStock,
        outOfStock: outOfStock
      }
    }, { status: 200 });

  } catch (error) {
    console.error("[PHARMACY_DASHBOARD_STATS]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}