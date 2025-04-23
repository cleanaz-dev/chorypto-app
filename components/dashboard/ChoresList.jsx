// components/dashboard/ChoresList.jsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { User } from "lucide-react";

export const ChoresList = ({ title, description, chores, isToday = false }) => {
 
  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-amber-300  transition-all duration-500">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription className="text-gray-400">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-44 md:h-72 overflow-y-auto md:px-4">
          <ul className="space-y-4 ">
            {chores.length === 0 ? (
              <p className="text-gray-400">No chores found</p>
            ) : (
              chores.map((chore, index) => (
                <li
                  key={chore.id}
                  className="flex items-center justify-between rounded-lg border border-gray-800 px-3 py-2 hover:border-amber-300 transition-all duration-300"
                >
                  <div className="">
                    <p className="font-medium">{chore.name}</p>
                    <div className="flex items-center text-xs text-gray-400">
                      <Clock className="mr-1 h-3 w-3" />
                      {isToday 
                        ? new Date(chore.dueDate).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : new Date(chore.completedAt).toLocaleString()}
                    </div>
                    <div className="">
                      <span className="text-xs text-gray-400 flex items-center">
                        <User className="mr-1 size-3" /> {chore.User.email}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-amber-500 items-start">
                    {chore.reward} SATS
                  </div>
                </li>
              ))
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
