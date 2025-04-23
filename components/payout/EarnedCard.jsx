"use client";
import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { useUser } from "@clerk/nextjs";
import {
  Clock,
  CheckCircle2,
  Bitcoin,
  Zap,
  Calendar,
  Coins,
  PiggyBank
} from "lucide-react";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { usePayout } from "@/lib/context/PayoutContext";
import { isToday, differenceInDays, differenceInHours, formatDistanceToNow } from "date-fns";

export default function EarnedCard() {
  const { earnedRewards, payoutInformation, nonPaidChoreLogs } = usePayout();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [timeUntilPayout, setTimeUntilPayout] = useState("");

  const { OrgSettings: { nextPayOutDate, onTimeBonusSats, payoutGraceDays } = {} } = payoutInformation || {};

  useEffect(() => {
    if (!nextPayOutDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const payoutDate = new Date(nextPayOutDate);
      const days = differenceInDays(payoutDate, now);
      const hours = differenceInHours(payoutDate, now) % 24;

      if (days > 0) {
        setTimeUntilPayout(`Payout in ${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`);
      } else {
        setTimeUntilPayout(`Payout in ${hours} hour${hours !== 1 ? 's' : ''}`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 3600000); // Update every hour

    return () => clearInterval(interval);
  }, [nextPayOutDate]);

  const handlePayout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          earnedRewards,
          userId: user.id,
          walletAddress: payoutInformation?.walletAddress,
        }),
      });
      if (!response.ok) {
        throw new Error("Payout failed");
      }
      // Handle successful payout
    } catch (error) {
      console.error("Payout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const isPayoutToday = isToday(new Date(nextPayOutDate));
  const onTimeBonus = onTimeBonusSats || 0;

  return (
    <Card className="bg-gray-900  border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          Earned Rewards
        </CardTitle>
        <CardDescription>
          Your current rewards balance and payout information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Earned Balance
            </span>
            <Badge variant={earnedRewards > 0 ? "success" : "secondary"}>
              {earnedRewards > 0 ? "Available" : "No balance"}
            </Badge>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{earnedRewards}</span>
            <span className="text-sm text-gray-500 mb-1">SATS</span>
          </div>
        </div>

        {/* Chores Progress */}
        <div className="space-y-2">
          <div className="flex-col text-sm">
            <p className="font-medium text-gray-500">Chores Completed</p>
            <p className="text-3xl font-bold">{nonPaidChoreLogs}</p>
          </div>
        </div>

        {/* Payout Information */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-3 text-sm border border-blue-400 p-2 rounded-lg bg-blue-400/10">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-blue-300">
              Next payout:{" "}
              {new Date(nextPayOutDate).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm border border-yellow-400 p-2 rounded-lg bg-yellow-400/10">
            <Zap className="h-4 w-4 text-yellow-400" />
            <span className="text-yellow-300">
              Frequency:{" "}
              {payoutInformation?.OrgSettings?.payoutFrequency || "Weekly"}
            </span>
          </div>

          <div className="flex items-center gap-3 text-sm border border-rose-400 p-2 rounded-lg bg-rose-400/10">
            <PiggyBank className="h-4 w-4 text-rose-400" />
            <span className="text-rose-300">
              On Time Bonus:{" "}
              +{onTimeBonus} SATS
            </span>
          </div>
        </div>

        {/* Payout Button */}
        <Button
          onClick={handlePayout}
          disabled={earnedRewards === 0 || loading || !isPayoutToday}
          className="w-full mt-4 gap-2"
          size="lg"
        >
          {!isPayoutToday ? (
            timeUntilPayout || "Calculating..."
          ) : (
            <div className="flex items-center gap-2">
              {loading ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              {loading ? "Processing..." : "Request Payout"}
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
