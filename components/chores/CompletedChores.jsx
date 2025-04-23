"use client";

import { CheckCircle2, Bitcoin } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { ChevronUp } from "lucide-react";
import { ChevronDown } from "lucide-react";

export default function CompletedChores({ 
  isOpen, 
  onOpenChange, 
  chores, 
  filter 
}) {
  if (filter !== "All" && filter !== "Completed") return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={onOpenChange}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Completed Chores ({chores.length})
        </h2>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white"
          >
            {isOpen ? (
              <>
                <ChevronUp className="mr-1 h-4 w-4" />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className="mr-1 h-4 w-4" />
                Show
              </>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent>
        {chores.length === 0 ? (
          <p className="text-gray-400">No completed chores yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {chores.map((chore) => (
              <Card
                key={chore.id}
                className="border-gray-800 bg-gray-900 hover:bg-gray-800/50"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-white">{chore.name}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-400">
                        <CheckCircle2 className="mr-1 h-4 w-4 text-emerald-500" />
                        {new Date(chore.completedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center bg-amber-500/10 px-2 py-1 rounded-full text-sm font-medium text-amber-500">
                      <Bitcoin className="mr-1 h-3 w-3" />
                      {chore.reward} sats
                    </div>
                  </div>

                  {chore.User?.email && (
                    <p className="mt-2 text-xs text-gray-400">
                      Completed by: {chore.User.email}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}