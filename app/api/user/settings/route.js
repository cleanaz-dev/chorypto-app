import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    console.log("User settings API call data:", data);

    const {
      firstName,
      lastName,
      email,
      language = 'English',
      timezone = 'UTC',
      choreReminders = true,
      rewardNotifications = true,
      marketingEmails = false,
      payoutTime = '18:00',
      payoutFrequency = 'weekly',
      payoutCurrency = 'Bitcoin'
    } = data;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user in transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          firstName,
          lastName,
          email,
        },
      }),
      prisma.userSettings.update({
        where: { userId: user.id },
        data: {
          language,
          timezone,
          choreReminders,
          rewardNotifications,
          marketingEmails,
        },
      }),
    ]);

    // Update admin settings if creator
    if (user.role === "Creator") {
      await prisma.orgSettings.update({
        where: { organizationId: user.organizationId },
        data: {
          payoutTime,
          payoutFrequency,
          payoutCurrency,
        },
      });
    }

    return NextResponse.json(
      { message: "Settings updated successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}