import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs"; // password hashing , to match package.json

export async function GET() {
  try {
    const patients = await db.user.findMany({
      where: {
        userType: {
          name: "patient",
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        createdAt: true,
        // try to grab the profile's ID.
        // If 'healthProfile' is null, this will return null.
        healthProfile: {
            select: {
                id: true 
            }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(patients);

  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}

{/*post */}
export async function POST(req: Request) {
    try {
      const body = await req.json();
      const { name, email, password, phone, city, address } = body;
  
      // 1. Validation
      if (!name || !email || !password) {
        return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
      }
  
      // 2. Check if email exists
      const existingUser = await db.user.findUnique({
        where: { email }
      });
  
      if (existingUser) {
        return NextResponse.json({ message: "Email already exists" }, { status: 409 });
      }
  
      // 3. Find Role
      const patientRole = await db.userType.findFirst({
        where: { name: "patient" } 
      });
  
      if (!patientRole) {
        return NextResponse.json({ message: "System Error: 'patient' role not found." }, { status: 500 });
      }
  
      // 4. Hash Password
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // 5. Create User AND Select only safe fields to return
      // 5. Create User
    const newUser = await db.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword, 
          phone,
          city,
          address,
          userTypeId: patientRole.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          city: true,
          address: true,
          createdAt: true,
        }
      });
      return NextResponse.json(newUser, { status: 201 });
  
    } catch (error) {
      console.error("Error creating patient:", error);
      return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
  }