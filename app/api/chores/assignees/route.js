//api/chores/assignees/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.organizationId) {
      return NextResponse.json(
        { error: "User is not in an organization" }, 
        { status: 400 }
      );
    }

    const members = await prisma.user.findMany({
      where: {
        organizationId: user.organizationId,
        // NOT: { clerkId: clerkUserId } // (Optional) exclude current user
      },
      select: { 
        id: true, 
        firstName: true, 
        lastName: true, 
        email: true 
      },
      // Optional pagination:
      // skip: 0,
      // take: 10,
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}