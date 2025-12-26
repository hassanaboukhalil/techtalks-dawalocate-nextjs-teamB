import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * POST /api/admin/charities/approve
 * Approves a charity account
 * Only accessible to admin users
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate user
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Please log in." },
                { status: 401 }
            );
        }

        const userId = parseInt(session.user.id);

        // 2. Verify user is an admin
        const user = await db.user.findUnique({
            where: { id: userId },
            include: { userType: true },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: "User not found." },
                { status: 404 }
            );
        }

        if (user.userType.name !== "admin") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Access denied. Only admins can approve charities.",
                },
                { status: 403 }
            );
        }

        // 3. Parse and validate request body
        const body = await request.json();
        const { charityId, reason } = body;

        const validationErrors: string[] = [];

        if (!charityId || typeof charityId !== "number" || charityId <= 0) {
            validationErrors.push("Valid charity ID is required.");
        }

        // Reason is optional but if provided should be a string
        if (reason !== undefined && reason !== null && typeof reason !== "string") {
            validationErrors.push("Reason must be a string if provided.");
        }

        if (validationErrors.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed.",
                    details: validationErrors,
                },
                { status: 400 }
            );
        }

        // 4. Get charity userType
        const charityType = await db.userType.findUnique({
            where: { name: "charity" },
        });

        if (!charityType) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Charity user type not found in system.",
                },
                { status: 500 }
            );
        }

        // 5. Verify charity exists and get current status
        const charity = await db.user.findFirst({
            where: {
                id: charityId,
                userTypeId: charityType.id,
            },
            select: {
                id: true,
                name: true,
                email: true,
                city: true,
                phone: true,
                address: true,
                status: true,
                createdAt: true,
            },
        });

        if (!charity) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Charity not found.",
                },
                { status: 404 }
            );
        }

        // 6. Check if charity is already approved
        if (charity.status === "APPROVED") {
            return NextResponse.json(
                {
                    success: false,
                    error: "Charity is already approved.",
                    data: charity,
                },
                { status: 400 }
            );
        }

        // 7. Update charity status to APPROVED
        const approvedCharity = await db.user.update({
            where: { id: charityId },
            data: { status: "APPROVED" },
            select: {
                id: true,
                name: true,
                email: true,
                city: true,
                phone: true,
                address: true,
                status: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        campaigns: true,
                    },
                },
            },
        });

        // 8. Log the approval action
        console.log(`[CHARITY_APPROVED] Admin ${user.email} approved charity ${approvedCharity.email} (ID: ${charityId})`);

        // 9. Return success response
        return NextResponse.json(
            {
                success: true,
                message: `Charity "${approvedCharity.name}" has been successfully approved.`,
                data: {
                    charity: approvedCharity,
                    previousStatus: charity.status,
                    approvedBy: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                    },
                    approvedAt: approvedCharity.updatedAt,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("[ADMIN_CHARITY_APPROVE]", error);

        // Handle specific Prisma errors
        if (error instanceof Error) {
            if (error.message.includes("Record to update not found")) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Charity not found or has been deleted.",
                    },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error. Failed to approve charity.",
            },
            { status: 500 }
        );
    }
}
