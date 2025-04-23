// api/chores/logs/route.js
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // First get the user with their role
        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            select: { 
                id: true,
                role: true,
                organizationId: true // Include organizationId if needed
            }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found in database" }, { status: 404 });
        }

        const isCreator = user.role === 'Creator';
        const userId = user.id;

        // Base where clause
        let whereClause = {};

        if (!isCreator) {
            whereClause.userId = userId;
        }
        
        const logs = await prisma.choreLog.findMany({
            where: whereClause,
            include: {
                chore: {
                    select: {
                        name: true,
                        frequency: true
                    }
                },
                user: {
                    select: {
                        email: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' },
        });

        console.log("logs: ", logs);

        return NextResponse.json(logs)

    } catch (error) {
        console.error("Error fetching chore logs:", error);
        return NextResponse.json({ error: "Failed to fetch chore logs" }, { status: 500 });
    }
}
