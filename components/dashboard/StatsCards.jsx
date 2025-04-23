"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bitcoin, TrendingUp, Award, CheckSquare } from "lucide-react";
import { formatSatsWithCommas } from "@/lib/utils";
import { useDashboard } from "@/lib/context/DashboardContext";

export const StatsCards = () => {
  const { stats, user } = useDashboard();
  const [btcPrice, setBtcPrice] = useState(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(true);
  const [priceError, setPriceError] = useState(null);
  const [userPayoutData, setUserPayoutData] = useState(null);
  

  // Fetch user payout data
  useEffect(() => {
    const fetchUserPayoutData = async () => {
      try {
        const response = await fetch("/api/payout/user");
        if (!response.ok) throw new Error("Failed to fetch payout data");
        const data = await response.json();
        setUserPayoutData(data);
      } catch (error) {
        console.error("Error fetching payout data:", error);
      }
    };
    fetchUserPayoutData();
  }, []);

  // Fetch BTC price
  useEffect(() => {
    const fetchBtcPrice = async () => {
      setIsLoadingPrice(true);
      setPriceError(null);
      try {
        const response = await fetch(
          "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
        );
        if (!response.ok) throw new Error(`API error (${response.status})`);
        const data = await response.json();
        setBtcPrice(data.bitcoin?.usd || null);
      } catch (err) {
        console.error("Error fetching BTC price:", err);
        setPriceError(err.message);
      } finally {
        setIsLoadingPrice(false);
      }
    };
    fetchBtcPrice();
  }, []);

  // Calculate values
  const totalChores = stats?.choreLogs.length || 0;
  const totalRewards = stats?.totalRewards || 0;
  const totalPayoutAmount = userPayoutData?.totalPayoutAmount || 0;
  const latestPayoutDate = userPayoutData?.latestPayoutDate || new Date();

  const usdValue = btcPrice ? (totalRewards / 100_000_000) * btcPrice : null;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Earned Card */}
      <Card className="bg-gray-900 border-gray-800 hover:border-amber-300 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-300 underline decoration-amber-500">
            Total Earned
          </CardTitle>
          <Bitcoin className="size-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">
            {formatSatsWithCommas(totalRewards)} SATS
          </div>
          <div className="text-xs text-gray-400 h-4 mt-1">
            {priceError ? (
              <span className="text-red-500/80">~ $ -.-- (Price Error)</span>
            ) : usdValue !== null ? (
              <span>~ ${usdValue.toFixed(2)} USD</span>
            ) : (
              <span>~ $ -.--</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chores Completed Card */}
      <Card className="bg-gray-900 border-gray-800 hover:border-green-300/80 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-300 underline decoration-emerald-500">
            Chores Completed
          </CardTitle>
          <CheckSquare className="size-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-emerald-500 font-bold">
            {totalChores}
          </div>
          <p className="text-xs text-gray-400">
            {user.role === "Creator" ? "By team" : "By you"}
          </p>
        </CardContent>
      </Card>

      {/* Total Payout Card */}
      <Card className="bg-gray-900 border-gray-800 hover:border-emerald-300/80 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-300 underline decoration-fuchsia-500">
            Total Payout
          </CardTitle>
          <TrendingUp className="size-4 text-fuchsia-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-fuchsia-500 font-bold">
            {formatSatsWithCommas(totalPayoutAmount)} SATS
          </div>
          <p className="text-xs text-gray-400">
            Last payout: {new Date(latestPayoutDate).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Level Card */}
      <Card className="bg-gray-900 border-gray-800 hover:border-sky-300/80 transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-300 underline decoration-sky-400">
            Level
          </CardTitle>
          <Award className="size-4 text-sky-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl text-sky-400 font-bold">
            Level {user.level}
          </div>
          <p className="text-xs text-gray-400">
            {user.xp} total xp
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
