import { NextResponse } from "next/server";
import { db } from "@/lib/db"; // Assumed based on your 'lib/db.ts' file shown in the explorer

export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { 
        name, genericName, strength, form, synonyms, imageUrl, description 
      } = body;
  
      if (!name) {
        return NextResponse.json({ message: "Medicine name is required" }, { status: 400 });
      }
  
      // --- NEW LOGIC START ---
      // Check if a medicine with this exact name already exists (case-insensitive)
      const existingMedicine = await db.medicine.findFirst({
        where: {
          name: {
            equals: name,
            mode: 'insensitive', // This ensures "Panadol" and "panadol" are treated as the same
          },
        },
      });
  
      if (existingMedicine) {
        return NextResponse.json(
          { message: "This medicine already exists in the database." }, 
          { status: 409 } // 409 Conflict
        );
      }
      // --- NEW LOGIC END ---
  
      const newMedicine = await db.medicine.create({
        data: {
          name, genericName, strength, form, synonyms, imageUrl, description,
        },
      });
  
      return NextResponse.json(newMedicine, { status: 201 });
  
    } catch (error) {
      console.error("Error creating medicine:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }

// ... existing POST function ...

export async function GET(req: Request) {
    try {
      const medicines = await db.medicine.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(medicines);
    } catch (error) {
      return NextResponse.json({ message: "Error fetching medicines" }, { status: 500 });
    }
  }