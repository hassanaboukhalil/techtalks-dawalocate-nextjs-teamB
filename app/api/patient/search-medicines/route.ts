import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { InventoryStatus } from "@/lib/generated/prisma/client";

/**
 * GET /api/patient/search-medicines
 * 
 * Search for pharmacies that have a specific medicine in stock
 * 
 * Query Parameters:
 * - medicine (required): Medicine name to search for (searches both name and genericName)
 * - city (optional): Filter pharmacies by city
 * - name (optional): Filter pharmacies by name
 * - status (optional): Filter by inventory status (IN_STOCK, LOW, OUT) - defaults to IN_STOCK,LOW
 * - includeOutOfStock (optional): Include out of stock items (default: false)
 * 
 * Returns:
 * - List of pharmacies with matching medicines and their inventory details
 */
export async function GET(req: NextRequest) {
  try {
    // Extract and validate query parameters
    const { searchParams } = new URL(req.url);
    const medicine = searchParams.get("medicine");
    const city = searchParams.get("city");
    const pharmacyName = searchParams.get("name");
    const statusParam = searchParams.get("status");
    const includeOutOfStock = searchParams.get("includeOutOfStock") === "true";

    // Validate required parameters
    if (!medicine || medicine.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Medicine name is required",
          message: "Please provide a medicine name to search for"
        },
        { status: 400 }
      );
    }

    // Parse status filter
    let statusFilter: InventoryStatus[] = [InventoryStatus.IN_STOCK, InventoryStatus.LOW];
    
    if (statusParam) {
      const requestedStatuses = statusParam.split(",").map(s => s.trim().toUpperCase());
      const validStatuses = requestedStatuses.filter(s => 
        Object.values(InventoryStatus).includes(s as InventoryStatus)
      ) as InventoryStatus[];
      
      if (validStatuses.length > 0) {
        statusFilter = validStatuses;
      }
    } else if (includeOutOfStock) {
      statusFilter = [InventoryStatus.IN_STOCK, InventoryStatus.LOW, InventoryStatus.OUT];
    }

    // Build the search query
    const medicineSearchTerm = medicine.trim();
    
    // Find all medicines matching the search term (search in name, genericName, and synonyms)
    const matchingMedicines = await db.medicine.findMany({
      where: {
        OR: [
          {
            name: {
              contains: medicineSearchTerm,
              mode: "insensitive"
            }
          },
          {
            genericName: {
              contains: medicineSearchTerm,
              mode: "insensitive"
            }
          },
          {
            synonyms: {
              contains: medicineSearchTerm,
              mode: "insensitive"
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        genericName: true,
        strength: true,
        form: true,
        description: true,
        imageUrl: true
      }
    });

    if (matchingMedicines.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          medicines: [],
          pharmacies: [],
          total: 0,
          message: "No medicines found matching your search"
        }
      });
    }

    const medicineIds = matchingMedicines.map(m => m.id);
    // Build pharmacy filter conditions
    const pharmacyWhereConditions: any = {
      userType: {
        name: "pharmacy"
      },
      status: "APPROVED" // Only show approved pharmacies
    };

    if (city && city.trim() !== "") {
      pharmacyWhereConditions.city = {
        contains: city.trim(),
        mode: "insensitive"
      };
    }

    if (pharmacyName && pharmacyName.trim() !== "") {
      pharmacyWhereConditions.name = {
        contains: pharmacyName.trim(),
        mode: "insensitive"
      };
    }

    // Find pharmacies with the matching medicines in their inventory
    const pharmaciesWithMedicine = await db.user.findMany({
      where: {
        ...pharmacyWhereConditions,
        pharmacyMedicines: {
          some: {
            medicineId: {
              in: medicineIds
            },
            status: {
              in: statusFilter
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        city: true,
        openingHours: true,
        hasDelivery: true,
        pharmacyMedicines: {
          where: {
            medicineId: {
              in: medicineIds
            },
            status: {
              in: statusFilter
            }
          },
          select: {
            id: true,
            status: true,
            quantity: true,
            expiresAt: true,
            updatedAt: true,
            medicine: {
              select: {
                id: true,
                name: true,
                genericName: true,
                strength: true,
                form: true,
                description: true,
                imageUrl: true
              }
            }
          },
          orderBy: {
            updatedAt: "desc"
          }
        }
      },
      orderBy: [
        {
          city: "asc"
        },
        {
          name: "asc"
        }
      ]
    });

    // Transform the data for better client consumption
    const results = pharmaciesWithMedicine.map(pharmacy => ({
      pharmacy: {
        id: pharmacy.id,
        name: pharmacy.name,
        email: pharmacy.email,
        phone: pharmacy.phone,
        address: pharmacy.address,
        city: pharmacy.city,
        openingHours: pharmacy.openingHours,
        hasDelivery: pharmacy.hasDelivery
      },
      medicines: pharmacy.pharmacyMedicines.map(pm => ({
        inventoryId: pm.id,
        medicine: pm.medicine,
        availability: {
          status: pm.status,
          quantity: pm.quantity,
          expiresAt: pm.expiresAt,
          lastUpdated: pm.updatedAt
        }
      }))
    }));

    // Group results by city for easier navigation
    const resultsByCity = results.reduce((acc, result) => {
      const city = result.pharmacy.city || "Unknown";
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(result);
      return acc;
    }, {} as Record<string, typeof results>);

    return NextResponse.json({
      success: true,
      data: {
        searchTerm: medicineSearchTerm,
        matchingMedicines: matchingMedicines,
        results: results,
        resultsByCity: resultsByCity,
        total: results.length,
        filters: {
          city: city || null,
          pharmacyName: pharmacyName || null,
          status: statusFilter
        },
        message: results.length > 0 
          ? `Found ${results.length} ${results.length === 1 ? 'pharmacy' : 'pharmacies'} with the requested medicine`
          : "No pharmacies found with the requested medicine in your area"
      }
    });

  } catch (error) {
    console.error("Error searching for medicines:", error);
    
    // Provide helpful error messages
    let errorMessage = "An error occurred while searching for medicines";
    
    if (error instanceof Error) {
      // Don't expose internal errors to client in production
      if (process.env.NODE_ENV === "development") {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === "development" ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Example usage:
 * 
 * 1. Basic search:
 *    GET /api/patient/search-medicines?medicine=Paracetamol
 * 
 * 2. Search with city filter:
 *    GET /api/patient/search-medicines?medicine=Paracetamol&city=Beirut
 * 
 * 3. Search with pharmacy name:
 *    GET /api/patient/search-medicines?medicine=Aspirin&name=Central
 * 
 * 4. Search with specific status:
 *    GET /api/patient/search-medicines?medicine=Insulin&status=IN_STOCK
 * 
 * 5. Include out of stock:
 *    GET /api/patient/search-medicines?medicine=Amoxicillin&includeOutOfStock=true
 * 
 * 6. Combined filters:
 *    GET /api/patient/search-medicines?medicine=Metformin&city=Tripoli&status=IN_STOCK,LOW
 */

