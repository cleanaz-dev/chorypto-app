// ChoresCard.jsx
"use client";

import {
  Bitcoin,
  Circle,
  User,
  MoreVertical,
  CircleAlert
} from "lucide-react";
import { Card } from "@/components/ui/card";
import EditChoreDialog from "./EditChoreDialog";
import CompleteChoreDialog from "./CompleteChoreDialog";
import DeleteChoreDialog from "./DeleteChoreDialog";
import { cn, getChoreTimeStatus } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EarnMoreDialog from "./EarnMoreDialog";
import { Badge } from "../ui/badge";
import { choreDecorationColor, choreStatusColor } from "@/lib/constants";
import StopChoreDialog from "./StopChoreDialog";

export default function ChoresCard({ chore, role, orgSettings }) {
  const [showActions, setShowActions] = useState(false);

  const { chorePenalty, dailyChoreDeadline } = orgSettings || {};

  const cardRef = useRef(null);
  const { message, icon: Icon } = getChoreTimeStatus(chore, dailyChoreDeadline);

  // Calculate the reward based on the status
  const currentReward =
    chore.status === "Active"
      ? chore.reward || 0
      : chore.status === "Late"
      ? Math.max(
          0,
          Math.floor((chore.reward || 0) * (1 - (chorePenalty || 0) / 100))
        )
      : chore.status === "Overdue"
      ? Math.max(
          0,
          Math.floor(
            (chore.reward || 0) * (1 - ((chorePenalty || 0) * 1.5) / 100)
          )
        )
      : 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        setShowActions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleActions = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border border-gray-800 shadow-sm transition-all group hover:border-amber-500/60 hover:shadow-amber-500/10">
        <div className="flex flex-col h-full">
          <div className="flex-grow p-4 bg-gray-900 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 min-w-0">
                {chore.status === "Active" ? (
                  <Circle
                    className={`size-4 shrink-0 ${
                      choreStatusColor[chore.status]
                    }`}
                  />
                ) : (
                  <CircleAlert
                    className={`size-4 shrink-0 ${
                      choreStatusColor[chore.status]
                    }`}
                  />
                )}

                <h3
                  className={`text-base lg:text-lg font-semibold text-white tracking-tight truncate underline ${
                    choreDecorationColor[chore.status]
                  }`}
                >
                  {chore.name}
                </h3>
              </div>
              {chore.frequency && (
                <Badge
                  className={cn(
                    "",
                    chore.frequency === "Once"
                      ? "border-amber-600 text-amber-600 bg-transparent"
                      : "border-indigo-600 text-indigo-600 bg-transparent"
                  )}
                >
                  {chore.frequency}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 flex flex-wrap items-center gap-2 text-sm truncate">
                <span className={choreStatusColor[chore.status]}>
                  {chore.status}
                </span>
              </div>

              <div className="flex-shrink-0 flex items-center gap-1 text-amber-500 text-sm font-medium">
                <Bitcoin className="h-4 w-4" />
                {`${currentReward} SATS`}
              </div>
            </div>
            <div className="flex justify-between">
              {role === "Creator" && chore.User?.email && (
                <div className="text-sm text-muted-foreground flex gap-2 items-center">
                  <User className="size-4 text-sky-400" />
                  <span className="text-sky-400">{chore.User.email}</span>
                </div>
              )}
              <div>
                {chore.dueDate ? (
                  <div
                    className={`flex items-center gap-2 text-sm ${
                      choreStatusColor[chore.status]
                    }`}
                  >
                    {Icon && <Icon className="size-4" />}
                    <span>{message}</span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No due date 🫡</div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-black px-2 py-2.5 border-t border-gray-800 gap-2 h-14 w-full">
            <AnimatePresence mode="wait">
              {showActions ? (
                <motion.div
                  key="actions"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="flex gap-2 w-full"
                  ref={cardRef}
                >
                  <div className="flex justify-between w-full">
                    <div>
                      <EarnMoreDialog />
                    </div>
                    <div className="flex gap-2">
                      <CompleteChoreDialog
                        chore={chore}
                        currentReward={currentReward}
                        dailyChoreDeadline={dailyChoreDeadline}
                      />
                      {role === "Creator" && <EditChoreDialog chore={chore} />}
                      {role === "Creator" && chore.frequency === "Daily" ? (
                        <StopChoreDialog chore={chore} />
                      ) : (
                        <DeleteChoreDialog chore={chore} />
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  key="ellipsis"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={toggleActions}
                  className="text-gray-400 hover:text-white p-1 transition-colors"
                  aria-label="Show actions"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <div className="flex justify-end">
                    <MoreVertical className="h-5 w-5" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
