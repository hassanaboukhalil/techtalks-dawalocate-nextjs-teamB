import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 1. Update the type definition to treat params as a Promise
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 2. Await the params object before accessing 'id'
    const { id } = await params;
    const medicineId = parseInt(id);

    if (isNaN(medicineId)) {
      return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
    }

    // 3. Get the new data
    const body = await req.json();
    const { 
      name, 
      genericName, 
      strength, 
      form, 
      synonyms, 
      imageUrl, 
      description 
    } = body;

    // 4. Update in Database
    const updatedMedicine = await db.medicine.update({
      where: {
        id: medicineId,
      },
      data: {
        name,
        genericName,
        strength,
        form,
        synonyms,
        imageUrl,
        description,
      },
    });

    return NextResponse.json(updatedMedicine);

  } catch (error) {
    console.error("Error updating medicine:", error);
    return NextResponse.json(
      { message: "Error updating medicine. It might not exist." }, 
      { status: 500 }
    );
  }
}

// ... (imports and PATCH function are above this)

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    try {
      // 1. Get the ID
      const { id } = await params;
      const medicineId = parseInt(id);
  
      if (isNaN(medicineId)) {
        return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
      }
  
      // 2. Check dependencies (Optional but recommended)
      // If a medicine is already used in a "DonationRequest" or "PharmacyMedicine",
      // you might not want to delete it. But for now, let's keep it simple.
  
      // 3. Delete from Database
      const deletedMedicine = await db.medicine.delete({
        where: {
          id: medicineId,
        },
      });
  
      return NextResponse.json(
        { message: "Medicine deleted successfully", deletedMedicine }, 
        { status: 200 }
      );
  
    } catch (error) {
      console.error("Error deleting medicine:", error);
      
      // Handle case where ID doesn't exist
      return NextResponse.json(
        { message: "Error deleting medicine. It might not exist." }, 
        { status: 500 }
      );
    }
  }