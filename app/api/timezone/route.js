import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Timezone } from "@prisma/client";

export async function GET(req) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const timezoneEnumValues = Object.values(Timezone);


  return NextResponse.json(timezoneEnumValues);
}
