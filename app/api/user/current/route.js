//api/user/current/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
 
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user data
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch organization data (adjust based on your schema)
    const organization = await prisma.organization.findFirst({
      where: { creatorId: user.id }, // Or use members array if applicable
    });

    // Fetch chores
    const chores = await prisma.chore.findMany({
      where: {
        OR: [
          { creatorId: user.id }, // Chores created by the user
          { assigneeId: user.id }, // Chores assigned to the user
        ],
      },
    });

    // Categorize chores
    const active = chores.filter((c) => !c.completed && c.frequency === "Once");
    const completed = chores.filter((c) => c.completed);
    const recurring = chores.filter((c) => !c.completed && c.frequency !== "Once");

    return NextResponse.json({
      user,
      organization,
      chores: { active, completed, recurring },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}