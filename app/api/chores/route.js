// api/chores/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay, addDays, setHours, setMinutes, isBefore } from 'date-fns';

export async function GET(request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true, organizationId: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUserId = user.id;

    const whereClause = {
       OR: [
         { creatorId: currentUserId },
         { userId: currentUserId },
       ],
       NOT: {
         status: { in: ['Archived', 'Deleted'] }
       },
       OR: [
          { frequency: { not: 'Once' } },
          { frequency: 'Once', completedAt: null }
       ]
    };

    const chores = await prisma.chore.findMany({
       where: whereClause,
       include: {
         User: { select: { email: true } },
       },
       orderBy: {
         dueDate: 'asc',
         createdAt: 'desc'
       }
     });

    if (!chores || chores.length === 0) {
      return NextResponse.json([]);
    }

    const now = new Date();
    const todayStart = startOfDay(now);

    const safeParseDate = (dateString) => {
      if (!dateString) return null;
      try {
        const date = parseISO(dateString);
        return isNaN(date.getTime()) ? null : date;
      } catch (e) { return null; }
    };

    const processedChores = chores.map((chore) => {
      let isCurrentlyPending = false;
      const parsedDueDate = safeParseDate(chore.dueDate);

      switch (chore.frequency) {
        case "Once":
          isCurrentlyPending = chore.completedAt === null && chore.status !== 'Completed';
          break;
        case "Daily":
          isCurrentlyPending = parsedDueDate ? startOfDay(parsedDueDate).getTime() <= todayStart.getTime() : true;
          break;
        default:
          isCurrentlyPending = false;
      }

      return {
        ...chore,
        lastCompletedAt: undefined,
        isCurrentlyPending: isCurrentlyPending,
      };
    });

    return NextResponse.json(processedChores);

  } catch (error) {
    console.error("Error fetching chores:", error);
    return NextResponse.json({ error: "Failed to fetch chores" }, { status: 500 });
  }
}

export async function POST(request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const creator = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { 
        id: true, 
        role: true, 
        organizationId: true,
        Organization: {
          select: {
            OrgSettings: {
              select: {
                dailyChoreDeadline: true,
              }
            }
          }
        }
      }
    });

    if (!creator) {
      return NextResponse.json({ error: "Creator user not found" }, { status: 404 });
    }

    if (creator.role !== "Creator") {
      return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    const data = await request.json();
    if (!data.name || !data.reward) {
      return NextResponse.json({ error: "Missing required fields: name and reward" }, { status: 400 });
    }

    const { name, reward, frequency = "Once", assigneeEmail, dueDate, start } = data;
    const dailyChoreDeadline = creator.Organization.OrgSettings.dailyChoreDeadline; // e.g. "20:00"

    let assigneeId = null;
    if (assigneeEmail) {
      const assignee = await prisma.user.findUnique({
        where: { email: assigneeEmail },
        select: { id: true, organizationId: true }
      });
      if (!assignee) {
        return NextResponse.json({ error: "Assignee not found" }, { status: 404 });
      }
      if (creator.organizationId && assignee.organizationId !== creator.organizationId) {
        return NextResponse.json({ error: "Assignee not in your organization" }, { status: 403 });
      }
      assigneeId = assignee.id;
    }

    const responsibleUserId = assigneeId || creator.id;

    let finalDueDate = dueDate ? new Date(dueDate) : null;

    if (frequency === "Daily" && start) {
      const now = new Date();
      const [hours, minutes] = dailyChoreDeadline.split(':').map(Number);
      
      // Create today's deadline in UTC
      let todayDeadline = setMinutes(setHours(startOfDay(now), hours), minutes);
      
      if (start === "tomorrow") {
        // Set to same deadline time tomorrow
        finalDueDate = addDays(todayDeadline, 1);
      } else {
        // If current time is past deadline, move to tomorrow
        finalDueDate = isBefore(now, todayDeadline) ? todayDeadline : addDays(todayDeadline, 1);
      }
    }

    const chore = await prisma.chore.create({
      data: {
        name,
        reward: parseInt(reward) || 0,
        frequency,
        creatorId: creator.id,
        assigneeId: assigneeId,
        userId: responsibleUserId,
        dueDate: finalDueDate,
      },
      include: {
        User: { select: { email: true } },
      },
    });

    return NextResponse.json(chore, { status: 201 });

  } catch (error) {
    console.error("Error adding chore:", error);
    return NextResponse.json({ error: error.message || "Failed to add chore" }, { status: 400 });
  }
}