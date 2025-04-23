import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function POST(req, { params }) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const choreId = params.id;
  console.log("Chore Id:", choreId);

  try {
    // Find the chore and make sure it belongs to the user
    const chore = await prisma.chore.findFirst({
      where: {
        id: choreId,
        User: {
          clerkId: clerkUserId,
        },
      },
    });

    if (!chore) {
      return NextResponse.json({ error: "Chore not found" }, { status: 404 });
    }

    const updatedChore = await prisma.chore.update({
      where: { id: choreId },
      data: { status: "Archived" },
    });

    return NextResponse.json({ message: "Chore Archived", chore: updatedChore });
  } catch (error) {
    console.error("Error archiving chore:", error);
    return NextResponse.json({ error: error.message || "Failed to archive chore" }, { status: 500 });
  }
}
