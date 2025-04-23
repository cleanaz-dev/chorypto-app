"use client";

import { useUser } from "@clerk/nextjs";
import UserProfile from "./UserProfile"; 
import Wallet from "./Wallet";         


export default function ProfilePage({ data, orgWalletBalance, userIdSatoshiBalance, role }) {
  const { user } = useUser(); 

  // Derive organization safely
  const organization = data.Organization || null;

  // You might want to fetch achievements dynamically here or pass them down
  // const userAchievements = fetchUserAchievements(user?.id); // Example fetch function

  if (!data) {
    // Handle loading state or error if data isn't available yet
    return <div>Loading profile...</div>; // Or a more sophisticated loading indicator
  }


  return (
 
    <div className="px-0.5 md:px-4 space-y-6 mt-4 md:mt-0 pb-4"> 
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-400">View and manage your profile</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        {/* User Profile Component */}
        <UserProfile data={data} />

        {/* Wallet Component */}
        <Wallet
          userWalletData={data?.Wallet} 
          organization={organization}
          orgWalletBalance={orgWalletBalance}
          userIdSatoshiBalance={userIdSatoshiBalance}
          userId={user?.id}
          role={role}  // Pass role to Wallet component for different view permissions. 
        />
      </div>
    </div>
  );
}