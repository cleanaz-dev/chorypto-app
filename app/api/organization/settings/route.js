//api/organization/settings/route.js

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
      select: { 
        Organization: {
          select: {
            OrgSettings: {
              select: {
                dailyChoreDeadline: true,
                dailyChoreWindow: true,
                chorePenalty: true,
              }
            }
          }
        }
      }
  })
  return NextResponse.json(user.Organization.OrgSettings);
}