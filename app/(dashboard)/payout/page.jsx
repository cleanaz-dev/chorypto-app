import PayoutPage from "@/components/payout/PayoutPage";
import { auth } from "@clerk/nextjs/server";
import {
  getPayoutInformationByUserId,
  getEarnedRewardsByUserId,
  getPayoutHistoryByUserId,
  getNonPaidChoreLogsByUserId,
} from "@/lib/actions";
import { PayoutProvider } from "@/lib/context/PayoutContext";

export default async function page() {
  const { userId } = await auth();
  const payoutInformation = await getPayoutInformationByUserId(userId);
  const earnedRewards = await getEarnedRewardsByUserId(userId);
  const payoutHistory = await getPayoutHistoryByUserId(userId);
  const nonPaidChoreLogs = await getNonPaidChoreLogsByUserId(userId);
  // console.log("payoutInformation", payoutInformation);
  // console.log("earnedRewards", earnedRewards);
  // console.log("payoutHistory", payoutHistory);
  // console.log("nonPaidChoreLogs", nonPaidChoreLogs);

  const payoutData = {
    payoutInformation,
    earnedRewards,
    payoutHistory,
    nonPaidChoreLogs,
  };

 
  return (
    <div>
      <PayoutProvider data={payoutData}>
        <PayoutPage />
      </PayoutProvider>
    </div>
  );
}
