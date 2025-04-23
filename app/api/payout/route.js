import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { sendTestnetTransaction } from "@/lib/walletService";
import { isToday, isAfter, addDays } from "date-fns";


export async function POST(req) {
  const { userId: clerkUserId } = await auth();
  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch user and organization (keeping your exact query structure)
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: {
        id: true,
        Wallet: {
          where: {
            userId: user.id,
            network: "testnet", // Updated this field
          },
          select: {
            address:true
          }
        },
      },
      include: {
        Organization: {
          select: {
            id: true,
            OrgSettings: {
              select: {
                payoutCurrency: true,
                payoutFrequency: true,
                payoutGraceDays: true,
                onTimeBonusSats: true,
                nextPayOutDate: true // Added this field
              }
            }
          }
        },
      },
    });

    if (!user || !user.Organization || !user.Wallet?.[0]?.address) {
      return NextResponse.json(
        { error: "User, organization, or wallet not found" },
        { status: 404 }
      );
    }

    const walletAddress = user.Wallet[0].address;


    // Fetch unpaid ChoreLog entries (unchanged)
    const unpaidChoreLogs = await prisma.choreLog.findMany({
      where: {
        userId: user.id,
        paid: false,
      },
      select: {
        id: true,
        rewardApplied: true,
      },
    });

    const earnedRewards = unpaidChoreLogs.reduce(
      (sum, log) => sum + log.rewardApplied,
      0
    );

    if (earnedRewards === 0) {
      return NextResponse.json(
        { error: "No unpaid rewards to payout" },
        { status: 400 }
      );
    }

   // Grace period logic
   const orgSettings = user.Organization.OrgSettings;
   const payoutDate = new Date(orgSettings.nextPayOutDate);
   const graceEnd = addDays(payoutDate, orgSettings.payoutGraceDays || 2);
   const now = new Date();

   const isOnTime = isToday(payoutDate);
   const isGracePeriod = !isOnTime && isAfter(graceEnd, now);
   const isOutsideWindow = !isOnTime && !isGracePeriod;

   if (isOutsideWindow) {
     return NextResponse.json(
       { error: "Payout window has closed" },
       { status: 400 }
     );
   }

   // Calculate bonus
   const bonus = isOnTime ? orgSettings.onTimeBonusSats || 0 : 0;
   const totalAmount = earnedRewards + bonus;

   // Process transaction
   const response = await sendTestnetTransaction(
     user.Organization.id,
     clerkUserId,
     totalAmount,
   );

   // Create Payout record
   const payout = await prisma.payout.create({
     data: {
       organizationId: user.Organization.id,
       userId: user.id,
       amount: earnedRewards,
       bonusAmount: bonus,
       coin: orgSettings.payoutCurrency,
       walletAddress: walletAddress,
       status: "Completed",
       transactionId: response.data,
       payoutDate: now,
       isOnTimePayout: isOnTime,
       isGraceClaim: isGracePeriod,
       choreLogs: {
         connect: unpaidChoreLogs.map((log) => ({ id: log.id })),
       },
     },
   });

   // Update ChoreLog entries
   await prisma.choreLog.updateMany({
     where: {
       id: { in: unpaidChoreLogs.map((log) => log.id) },
     },
     data: {
       paid: true,
       paidAt: now,
     },
   });

   return NextResponse.json({ 
     success: true, 
     payout,
     meta: {
       wasOnTime: isOnTime,
       wasGracePeriod: isGracePeriod,
       bonusApplied: bonus
     }
   });

 } catch (error) {
   console.error("Error in payout API:", error);
   return NextResponse.json(
     { error: error.message || "Internal server error" },
     { status: 500 }
   );
 }
}