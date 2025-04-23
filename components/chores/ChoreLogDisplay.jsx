"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2, ClipboardList, Repeat, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, parseISO } from 'date-fns'; // Import date-fns functions

export default function ChoreLogDisplay() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/chores/logs");
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch logs (${response.status})`);
        }
        const data = await response.json();
        setLogs(data);
      } catch (err) {
        console.error("Error fetching chore logs:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // --- Loading State ---
  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 text-gray-400 p-4">
        <Loader2 className="animate-spin h-5 w-5" />
        Loading chore history...
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex items-center justify-center gap-2 text-red-500 p-4 bg-red-900/20 border border-red-800 rounded-md">
        <AlertCircle className="h-5 w-5" />
        Error loading history: {error}
      </div>
    );
  }

  // --- Empty State ---
  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center text-center text-gray-400 p-6 border border-dashed border-gray-700 rounded-lg">
        <ClipboardList className="h-12 w-12 mb-3 text-gray-600" />
        <p className="font-medium">No Completed Chores</p>
        <p className="text-sm text-gray-500">Your chore completion history will appear here.</p>
      </div>
    );
  }

  // --- Display Logs ---
  return (
    <motion.div
      className="space-y-4 overflow-hidden" // <-- Added overflow-hidden
      initial={{ opacity: 0, height: 0 }} // <-- Initial state (hidden)
      animate={{ opacity: 1, height: "auto" }} // <-- Animate to visible
      exit={{ opacity: 0, height: 0 }} // <-- Animate to hidden (for exit)
      transition={{ duration: 0.3, ease: "easeInOut" }} // Customize transition
    >
      <ul className="space-y-3">
        {logs.map((log, index) => {
          const FrequencyIcon = log.chore?.frequency === 'Once' ? CalendarCheck : Repeat;
          const frequencyColor = log.chore?.frequency === 'Once' ? "text-amber-400" : "text-indigo-300";

          let relativeTime = "N/A";
          if (log.completedAt) {
            try {
              const completedDate = parseISO(log.completedAt);
              if (!isNaN(completedDate.getTime())) {
                 relativeTime = formatDistanceToNow(completedDate, { addSuffix: true });
              } else {
                 relativeTime = "Invalid Date";
              }
            } catch (e) {
              console.error("Error formatting date:", log.completedAt, e);
              relativeTime = "Invalid Date";
            }
          }

          return (
            <motion.li
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-3 bg-gray-800/50 border border-gray-700 rounded-lg shadow-sm hover:bg-gray-800 transition-colors"
            >
              {/* Top Row: Chore Name & Reward */}
              <div className="flex justify-between items-start gap-2 mb-1">
                <span className="flex items-center gap-2 font-medium text-gray-100 break-words">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {log.chore?.name || <span className="italic text-gray-500">Original chore deleted</span>}
                </span>
                {/* --- Corrected Reward Span --- */}
                {log.rewardApplied > 0 && (
                  <span className="text-sm font-semibold text-amber-400 whitespace-nowrap ml-2">
                    +{log.rewardApplied} sats
                  </span>
                )}
                {/* --- End Corrected Reward Span --- */}
              </div>

              {/* Second Row: Metadata (Frequency, Completed By, Date) */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400 mt-1 ml-6">
                {/* Frequency */}
                {log.chore?.frequency && (
                   <span className={cn("flex items-center gap-1", frequencyColor)}>
                       <FrequencyIcon className="h-3 w-3" />
                       {log.chore.frequency}
                   </span>
                )}

                {/* Separator */}
                {(log.chore?.frequency && log.user?.email) && <span>•</span>}

                {/* Completed By */}
                {log.user?.email && (
                   <span>
                       By: <span className="font-medium text-gray-300">{log.user.email}</span>
                   </span>
                )}

                 {/* Separator */}
                 {((log.chore?.frequency || log.User?.email) && log.completedAt) && <span>•</span>}

                {/* Completion Date (now relative time) */}
                {log.completedAt && (
                    <span>{relativeTime}</span>
                )}
              </div>

              {/* Notes (Optional) */}
              {log.notes && (
                 <p className="text-sm text-gray-300 mt-2 ml-6 italic border-l-2 border-gray-600 pl-2">
                    {log.notes}
                 </p>
              )}
            </motion.li>
          );
        })}
      </ul>
    </motion.div>
  );
}