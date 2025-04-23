"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
// Assuming Progress might be used later, kept import commented out
// import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Crown } from "lucide-react";
import { Award, Edit, Trophy, Star } from "lucide-react";
import Achievements from "./Achievements";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

export default function UserProfile({ data }) {
  // Destructure only the necessary props from data for this component
  const {
    firstName,
    lastName,
    email,
    createdAt,
    level,
    role,
    xp: xpCurrent,
    _count,
  } = data || {};

  const choreLogCount = _count.ChoreLog;
  const firstNameInitial = firstName?.charAt(0).toUpperCase();
  const lastNameInitial = lastName?.charAt(0).toUpperCase();
  const initials = `${firstNameInitial}${lastNameInitial}` || "U";

  // Placeholder values for level/streaks - ideally, these would come from `data`


  const xpNeeded = 200; // Example
  const xpProgress = (xpCurrent / xpNeeded) * 100; // Example calculation

  return (
    <Card className="md:col-span-2 bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>User Profile</CardTitle>
          <CardDescription className="text-gray-400">
            Your personal information
          </CardDescription>
        </div>
        {/* TODO: Implement edit functionality */}
        {/* <Button
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-white"
          aria-label="Edit profile" // Added aria-label for accessibility
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit profile</span>
        </Button> */}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-2xl font-bold">
              {initials}
            </div>
            {/* Consider making the award icon dynamic based on status/level */}
            <div className="absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-1">
              {role === "Creator" ? (
                <Crown className="size-4 text-black" />
              ) : (
                <Award className="h-4 w-4 text-black" />
              )}
            </div>
          </div>
          <div className="text-center sm:text-left">
            <div className="flex gap-4">
              <h3 className="text-xl font-bold">
                {firstName || "User"} {lastName || ""}
              </h3>
              <Badge variant="outline" className="text-amber-400">
                {role.toUpperCase()}
              </Badge>
            </div>
            <p className="text-gray-400">{email || "No email provided"}</p>
            <div className="mt-2 flex items-center justify-center space-x-2 sm:justify-start">
              {/* Level Badge */}
              <span className="flex items-center rounded-full bg-amber-900/30 px-2 py-0.5 text-xs font-medium text-amber-400">
                <Trophy className="mr-1 h-3 w-3" /> Level {level}
              </span>
              
        
            </div>
          </div>
        </div>

        <Separator className="bg-gray-800" />

        <div className="space-y-4">
          {/* Optional: Level Progress Bar */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium">Level Progress</span>
              <span className="text-xs text-gray-400">{xpCurrent}/{xpNeeded} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2 bg-gray-800" indicatorClassName="bg-amber-500" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-800 p-3">
              <div className="text-sm text-gray-400">Member Since</div>
              <div className="font-medium">
                {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
              </div>
            </div>
            <div className="rounded-lg border border-gray-800 p-3">
              <div className="text-sm text-gray-400">
                Total Chores Completed
              </div>
              <div className="font-medium">{choreLogCount}</div>
            </div>
            <div className="rounded-lg border border-gray-800 p-3">
              <div className="text-sm text-gray-400">Level</div>
              <div className="font-medium">{level} </div>
            </div>
            <div className="rounded-lg border border-gray-800 p-3">
              <div className="text-sm text-gray-400">Reward Bonus</div>
              <div className="font-medium">+0%</div>
            </div>
          </div>
        </div>
        <Achievements />
      </CardContent>
    </Card>
  );
}
