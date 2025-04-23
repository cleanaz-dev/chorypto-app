"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import AddChoreDialog from "./AddChoreDialog";
import ChoresCard from "./ChoresCard";
import ChoreLogDisplay from "./ChoreLogDisplay";

export default function ChoresPage({ chores = [], role, updatedChores = [] }) {
  const [filter, setFilter] = useState("All");
  const [showHistory, setShowHistory] = useState(false);
  const [orgSettings, setOrgSettings] = useState(null);
  // console.log("Chores prop received:", chores);

  // Filter the list: exclude completed=true chores, then apply frequency filter
  const filteredChores = chores.filter((chore) => {
    // --- Condition 1: Exclude if legacy 'completed' field is true ---
    // This primarily affects 'Once' chores after completion based on the updated PATCH route.
    if (chore.completed === true) {
      return false; // Don't show this chore in the main list
    }

    // --- Condition 2: Exclude based on non-display statuses (optional) ---
    // You might want to always hide chores with certain statuses regardless of other fields
    if (chore.status === "Archived" || chore.status === "Deleted") {
      return false;
    }
    // Note: We don't filter out status: 'Completed' here because for recurring chores,
    // the status might remain 'Active', and for 'Once' chores, the completed===true check handles hiding them.

    // --- Condition 3: Apply the frequency dropdown filter ---
    if (filter === "All") return true; // Show if 'All' selected (and not excluded above)
    if (filter === "One-Time") return chore.frequency === "Once"; // Show if 'One-Time' selected and frequency matches
    if (filter === "Recurring") return chore.frequency !== "Once"; // Show if 'Recurring' selected and frequency matches

    // Default: Exclude if none of the above frequency conditions match
    return false;
  });


  // Fetch organization settings
  useEffect(() => {
    const getOrgSettings = async () => {
      const data = await fetch("/api/organization/settings");
      const settings = await data.json();
      setOrgSettings(settings); // Save the fetched settings
    };

    getOrgSettings(); // Call the function on component mount
  }, []);

  return (
    <div className="px-0.5 md:px-4 space-y-6 mt-4 md:mt-0 pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row md:justify-between gap-4">
        {/* Left: Title and subtitle */}
        <div>
          <h1 className="text-3xl font-bold">Chores</h1>
          <p className="text-gray-400">Manage and track your tasks</p>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 w-full sm:w-auto">
          {/* Filter and Show History grouped */}
          <div className="flex items-center gap-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] bg-gray-950 border-gray-800">
                <SelectValue placeholder="Filter chores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Chores</SelectItem>
                <SelectItem value="One-Time">One-Time</SelectItem>
                <SelectItem value="Recurring">Recurring</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="w-[180px] text-white"
              disabled={filteredChores.length === 0}
            >
              {showHistory ? "Hide History" : "Show History"}
            </Button>
          </div>

          {/* Add Chore should go under the above on sm screens */}
          {role === "Creator" ? (
            <div className="mt-4 sm:mt-0 ">
              <AddChoreDialog />
            </div>
          ) : null}
        </div>
      </div>

      {/* Display Filtered Chores */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          {filter === "All" && "All Chores"}
          {filter === "One-Time" && "One-Time Chores"}
          {filter === "Recurring" && "Recurring Chores"}
        </h2>

        {filteredChores.length === 0 && (
          <p className="text-gray-400 py-4 border border-dashed border-gray-700 rounded-lg text-center">
            No chores found matching the filter "{filter}".
          </p>
        )}

        {filteredChores.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredChores.map((chore) => (
              // ChoresCard receives chores that passed the filter (completed !== true)
              <ChoresCard key={chore.id} chore={chore} role={role} orgSettings={orgSettings}/>
            ))}
          </div>
        )}
      </div>

      {/* Render Chore Log History */}
      {showHistory && (
        <div className="mt-8">
          <ChoreLogDisplay />
        </div>
      )}
    </div>
  );
}
