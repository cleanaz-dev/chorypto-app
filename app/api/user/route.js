import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClerkClient } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(request) {
  try {
    const data = await request.json();


    const emailAddress = data.email;

    // Fetch users from Clerk filtered by email
    const response = await clerkClient.users.getUserList({
      emailAddress: [emailAddress],
    });


    // Check if a matching user was found
    if (response.data.length === 0) {
      return NextResponse.json(
        { error: "No matching user found in Clerk" },
        { status: 404 }
      );
    }

    const clerkUser = response.data[0]; // Get the first matching user


    // Create user in your database
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id, // Store Clerk's user ID
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        walletAddress: data.walletAddress || null,
        choreInterests: data.choreInterests || [],
        reminderTime: data.reminderTime || "morning",
        weeklyGoal: data.weeklyGoal || 10,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while creating the user." },
      { status: 500 }
    );
  }
}