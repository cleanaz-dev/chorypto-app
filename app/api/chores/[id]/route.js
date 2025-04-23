import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";


export async function PATCH(request, { params }) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id: choreId } = params;
    const { completed, currentReward } = await request.json();

    if (completed !== true) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get chore and user with org settings
    const [chore, user] = await Promise.all([
      prisma.chore.findUnique({ where: { id: choreId } }),
      prisma.user.findUnique({
        where: { clerkId: clerkUserId },
        select: {
          id: true,
          level: true,
          xp: true,
          UserSettings: {
            select: {
              timezone: true
            }
          },
          Organization: {
            select: {
              OrgSettings: {
                select: {
                  dailyChoreDeadline: true,
                  baseXp: true,
                  scalingFactor: true,
                },
              },
            },
          },
        },
      }),
    ]);

    if (!chore) return NextResponse.json({ error: "Chore not found" }, { status: 404 });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (chore.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Convert timezone format (America_New_York -> America/New_York)
    const formattedTimezone = user.UserSettings?.timezone?.replace('_', '/') || 'America/New_York';
    const completionTime = new Date(); // UTC
    let updatedChore;

    if (chore.frequency === "Once") {
      if (chore.completed) {
        return NextResponse.json({ message: "Chore already completed" }, { status: 409 });
      }

      updatedChore = await prisma.chore.update({
        where: { id: choreId },
        data: {
          status: "Completed",
          completed: true,
          completedAt: completionTime,
        },
      });
    } else {
      // ===== DAILY COMPLETION VALIDATION =====
      if (chore.completedAt) {
        const lastCompleted = new Date(chore.completedAt);
        
        // Convert to user's local date string for comparison
        const lastCompletedDate = lastCompleted.toLocaleDateString('en-US', { timeZone: formattedTimezone });
        const currentDate = completionTime.toLocaleDateString('en-US', { timeZone: formattedTimezone });

        if (lastCompletedDate === currentDate) {
          return NextResponse.json(
            { error: "Already completed today" },
            { status: 400 }
          );
        }
      }
      // ===== END VALIDATION =====

      // Recurring chore with org deadline
      const orgDeadline = user.Organization.OrgSettings.dailyChoreDeadline || "20:00";
      const [deadlineHour, deadlineMinute] = orgDeadline.split(":").map(Number);

      // Create today's deadline in user's timezone
      const localNow = new Date(completionTime.toLocaleString('en-US', { timeZone: formattedTimezone }));
      const todaysDeadlineLocal = new Date(localNow);
      todaysDeadlineLocal.setHours(deadlineHour, deadlineMinute, 0, 0);
      
      // Convert to UTC for storage
      const todaysDeadlineUTC = new Date(todaysDeadlineLocal.toISOString());

      // Calculate next due date
      let nextDueDate = new Date(todaysDeadlineUTC);
      if (completionTime >= todaysDeadlineUTC) {
        nextDueDate.setDate(nextDueDate.getDate() + 1);
      }

      updatedChore = await prisma.chore.update({
        where: { id: choreId },
        data: {
          dueDate: nextDueDate,
          completedAt: completionTime,
          status: "Active",
        },
      });
    }

    // Create log entry
    await prisma.choreLog.create({
      data: {
        choreId: chore.id,
        userId: user.id,
        completedAt: completionTime,
        rewardApplied: currentReward,
      },
    });

    // Award XP and update level
    const XP_PER_CHORE = 100;
    const baseXp = user.Organization.OrgSettings.baseXp || 500;
    const scalingFactor = user.Organization.OrgSettings.scalingFactor || 100;

    const newXp = user.xp + XP_PER_CHORE;
    const xpForNextLevel = baseXp + user.level * scalingFactor;
    let updatedLevel = user.level;
    let updatedXp = newXp;

    if (newXp >= xpForNextLevel) {
      updatedLevel += 1;
      updatedXp = newXp - xpForNextLevel;
    }

    // Update user with new XP and level
    await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: {
        xp: updatedXp,
        level: updatedLevel,
      },
    });

    return NextResponse.json({
      message: "Chore completed",
      chore: updatedChore,
      level: updatedLevel,
      xp: updatedXp,
      xpForNextLevel,
    });
  } catch (error) {
    console.error("Error completing chore:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}