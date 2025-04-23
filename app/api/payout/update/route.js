import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { isToday, nextDay, addDays, getDay, format } from "date-fns";

export async function PATCH(req) {
  const data = await req.json();

  // 1. Authentication
  if (data.key !== process.env.PAYOUT_UPDATE_KEY) {
    console.log('[Payout] ❌ Invalid key provided');
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }

  try {
    console.log('[Payout] 🔍 Fetching organization settings...');
    const settings = await prisma.orgSettings.findMany({
      select: {
        id: true,
        payoutDay: true,
        payoutFrequency: true,
        nextPayOutDate: true,
      },
    });

    const dayMap = {
      Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3,
      Thursday: 4, Friday: 5, Saturday: 6
    };

    const updates = [];
    const today = new Date();

    console.log(`[Payout] 📅 Today is: ${format(today, 'yyyy-MM-dd EEEE')}`);

    for (const setting of settings) {
      console.log(`\n[Payout] 🔄 Processing org ${setting.id}`);
      console.log(`- Configured payout day: ${setting.payoutDay}`);
      console.log(`- Frequency: ${setting.payoutFrequency}`);
      
      const currentDate = new Date(setting.nextPayOutDate);
      const targetDayIndex = dayMap[setting.payoutDay];
      const currentDay = getDay(currentDate);

      console.log(`- Current payout date: ${format(currentDate, 'yyyy-MM-dd EEEE')}`);
      console.log(`- Current day index: ${currentDay}`);
      console.log(`- Target day index: ${targetDayIndex} (${setting.payoutDay})`);

      // 1. Check for day misalignment
      if (currentDay !== targetDayIndex) {
        console.log('⚠️ Dates misaligned - correcting...');
        const alignedDate = nextDay(currentDate, targetDayIndex);
        
        console.log(`- New aligned date: ${format(alignedDate, 'yyyy-MM-dd EEEE')}`);
        
        updates.push(
          prisma.orgSettings.update({
            where: { id: setting.id },
            data: { nextPayOutDate: alignedDate },
          })
        );
        continue;
      }

      // 2. Only process if today is the correct payout day
      if (isToday(currentDate)) {
        console.log('✅ Today is payout day - updating...');
        
        const daysToAdd = {
          Daily: 1,
          Weekly: 7,
          Biweekly: 14
        }[setting.payoutFrequency] || 0;
        
        const newDate = addDays(currentDate, daysToAdd);
        console.log(`- New payout date: ${format(newDate, 'yyyy-MM-dd EEEE')}`);

        updates.push(
          prisma.orgSettings.update({
            where: { id: setting.id },
            data: { nextPayOutDate: newDate },
          })
        );
      } else {
        console.log('⏭️ Not payout day today, skipping');
      }
    }

    if (updates.length > 0) {
      console.log(`\n[Payout] ✨ Executing ${updates.length} updates...`);
      await Promise.all(updates);
      console.log('[Payout] ✅ Updates completed successfully');
    } else {
      console.log('[Payout] 🔄 No updates needed');
    }

    return NextResponse.json({
      success: true,
      updatedCount: updates.length
    });

  } catch (error) {
    console.error('[Payout] ❌ Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}