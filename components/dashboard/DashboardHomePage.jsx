"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { ChoresList } from "@/components/dashboard/ChoresList";
import { Button } from "../ui/button";
import AdminCenter from "./AdminCenter";
import { useDashboard } from "@/lib/context/DashboardContext";
import { ChartArea } from "lucide-react";

export default function DashboardHomepage() {
  const { isLoaded, user } = useUser();
  const [isRewards, setIsRewards] = useState(false);
  const [userPayoutData, setUserPayoutData] = useState(null);
  
  // Get all data from context
  const { 
    user: contextUser, 
    organization, 
    stats, 
    upcomingChores, 
    recentActivity, 
    satoshiBalance, 
    totalPayout 
  } = useDashboard();

  useEffect(() => {
    const fetchUserPayoutData = async () => {
      if (!user) return;
      const response = await fetch(`/api/payout/${user.id}`);
      if (!response.ok) throw new Error("Failed to fetch user payout data");
      const data = await response.json();
      setUserPayoutData(data);
    }
    fetchUserPayoutData();
  }, [user]);

  if (!isLoaded) return <p className="text-gray-400">Loading...</p>;
  if (!user) return <p className="text-gray-400">Please sign in</p>;

  const firstName = contextUser?.firstName || "";

  return (
    <div className="px-0.5 md:px-4 space-y-6 mt-4 md:mt-0 pb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-400">
            Welcome back <span className="font-bold">{firstName}</span>!
          </p>
        </div>
          <div>
            <Button
              size="sm"
              className="bg-amber-400 font-bold hover:scale-105 transition-all duration-200"
              onClick={() => setIsRewards(true)}
            >
              <ChartArea /> Available Soon!
            </Button>
          </div>
      </div>

      {/* Admin Center (now gets its own data via useDashboard) */}
      {contextUser.role === "Creator" && (
        <AdminCenter />
      )}

      {/* Stats Cards */}
      <StatsCards />

      {/* Chores lists */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChoresList
          title="Upcoming Chores"
          description="Tasks scheduled for today"
          chores={upcomingChores}
          isToday={true}
        />
        <ChoresList
          title={contextUser.role === "Creator" ? "Recent Team Activity" : "Recent Activity"}
          description={
            contextUser.role === "Creator"
              ? "Latest completed team chores"
              : "Your latest completed chores"
          }
          chores={recentActivity}
        />
      </div>
    </div>
  );
}