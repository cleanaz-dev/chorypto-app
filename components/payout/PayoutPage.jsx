"use client";

import EarnedCard from "./EarnedCard";
import PayoutHistoryCard from "./PayoutHistoryCard";
import PayoutInformationCard from "./PayoutInformationCard";

export default function PayoutPage() {
  
  return (
    <div className="px-0.5 md:px-4 space-y-6 pb-6">
      <div className="px-2 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold">Payout</h1>
        <p className="text-gray-400 text-sm md:text-base">Review and manage your payouts</p>
      </div>
      
      <main className="flex flex-col gap-4">
        {/* Payout Information Card - full width on all screens */}
        <div className="w-full">
          <PayoutInformationCard />
        </div>
        
        {/* Bottom section - flex column on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 min-w-0"> {/* Added min-w-0 to prevent squishing */}
            <EarnedCard />
          </div>
          <div className="flex-1 min-w-0">
            <PayoutHistoryCard />
          </div>
        </div>
      </main>
    </div>
  );
}