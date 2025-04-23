import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: {
      Payout: {
        select: {
          amount: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc",}
      }
    }
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const totalPayoutAmount = user.Payout.reduce((acc, payout) => acc + payout.amount, 0);
  const latestPayoutDate = user.Payout[0]?.createdAt;

  return NextResponse.json({ totalPayoutAmount, latestPayoutDate });
}