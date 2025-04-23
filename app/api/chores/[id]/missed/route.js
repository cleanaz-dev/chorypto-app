import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function POST(req, { params }) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const choreId = params.id;
    const { rescheduleDate, note } = await req.json();

    // Validate required fields
    if (!rescheduleDate || !choreId || !note) {
      return NextResponse.json(
        { error: "Reschedule date, chore ID, and note are required" },
        { status: 400 }
      );
    }

    // Get organization deadline time
    const orgSettings = await prisma.orgSettings.findFirst({
      where: {
        Organization: {
          users: {
            some: { clerkId: clerkUserId }
          }
        }
      },
      select: {
        dailyChoreDeadline: true
      }
    });

    if (!orgSettings) {
      return NextResponse.json(
        { error: "Organization settings not found" },
        { status: 404 }
      );
    }

    // Apply deadline time to selected date
    const [hours, minutes] = orgSettings.dailyChoreDeadline.split(':').map(Number);
    const newDueDate = new Date(rescheduleDate);
    newDueDate.setHours(hours, minutes, 0, 0);

    // Update chore and create log in single transaction
    const [updatedChore] = await prisma.$transaction([
      prisma.chore.update({
        where: { id: choreId },
        data: {
          dueDate: newDueDate,
          status: "Active",
          completedAt: null,
        },
      }),
      prisma.choreLog.create({
        data: {
          choreId,
          userId: clerkUserId,
          notes: note,
          completionStatus: "Missed",
        },
      })
    ]);

    return NextResponse.json({ 
      success: true,
      chore: updatedChore,
      message: "Chore rescheduled successfully" 
    });

  } catch (error) {
    console.error("Error rescheduling chore:", error);
    return NextResponse.json(
      { error: "Failed to reschedule chore" }, 
      { status: 500 }
    );
  }
}