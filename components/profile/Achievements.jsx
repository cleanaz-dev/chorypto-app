"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import { Award, Bitcoin, Medal, Trophy, Star } from "lucide-react"; // Import necessary icons

// Define badge type structure (optional but good practice with TypeScript)
// type Badge = {
//   name: string;
//   icon: React.ElementType; // Lucide icons are components
//   unlocked: boolean;
// };

// Example achievement data - Ideally, this would be passed as a prop
// or fetched based on user data.
const exampleAchievements = [
  { name: "Early Adopter", icon: Award, unlocked: true },
  { name: "5 Day Streak", icon: Trophy, unlocked: true }, // Assume unlocked based on Profile
  { name: "100 Chores", icon: Medal, unlocked: true }, // Assume unlocked based on Profile > 100
  { name: "First Withdrawal", icon: Bitcoin, unlocked: true }, // Assume unlocked
  { name: "30 Day Streak", icon: Trophy, unlocked: false },
  { name: "500 Chores", icon: Medal, unlocked: false },
  { name: "Top Contributor", icon: Award, unlocked: false },
  { name: "Perfect Week", icon: Star, unlocked: false }, // Added Star icon example
];

export default function Achievements({ achievements = exampleAchievements }) {
  // If achievements prop is not provided, it defaults to exampleAchievements

  return (
    <div className="bg-gray-900 border-gray-800">
      <header className="mb-6 flex items-center gap-4">
        <div className="bg-gray-800 p-6 rounded-full">
          <ThumbsUp className="size-6 text-white" aria-hidden="true" />{" "}
        </div>
        <div>
          {" "}
          <h1 className="text-base font-semibold">Achievements</h1>
          <p className="text-gray-400 text-sm">
            Badges and rewards you've earned
          </p>
        </div>
      </header>
      <div>
        {achievements.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {achievements.map((badge, i) => (
              <div
                key={i} // Consider using a unique badge ID if available instead of index
                className={`flex flex-col items-center rounded-lg border p-4 text-center transition-opacity duration-300 ${
                  // Increased padding
                  badge.unlocked
                    ? "border-amber-900/50 bg-amber-900/10 hover:bg-amber-900/20" // Added hover effect
                    : "border-gray-800 bg-gray-950 opacity-60" // Slightly less opaque
                }`}
                title={
                  badge.unlocked
                    ? `Unlocked: ${badge.name}`
                    : `Locked: ${badge.name}`
                } // Tooltip
              >
                <badge.icon
                  className={`h-8 w-8 mb-2 ${
                    // Added margin-bottom
                    badge.unlocked ? "text-amber-500" : "text-gray-500"
                  }`}
                  aria-hidden="true" // Icon is decorative
                />
                <p className="text-xs font-semibold">{badge.name}</p>{" "}
                {/* Increased font weight */}
                <p className="mt-1 text-xs text-gray-400">
                  {badge.unlocked ? "Unlocked" : "Locked"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">
            No achievements to display.
          </p>
        )}
      </div>
    </div>
  );
}
