import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { differenceInHours, addDays, startOfDay, isToday } from "date-fns";

export default function CompleteChoreDialog({ chore, currentReward }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Calculate availability status
  const calculateAvailability = () => {
    if (chore.status === "Overdue" || chore.status === "Late") {
      return {
        message: chore.status === "Overdue" ? "Overdue" : "Late",
        isAvailable: false,
        icon:
          chore.status === "Overdue" ? (
            <AlertCircle className="h-4 w-4 text-red-500" />
          ) : (
            <Clock className="h-4 w-4 text-yellow-500" />
          ),
      };
    }

    if (chore.completedAt) {
      const completedAt = new Date(chore.completedAt);
      if (isToday(completedAt)) {
        const nextAvailable = addDays(startOfDay(new Date()), 1);
        const hoursLeft = differenceInHours(nextAvailable, new Date());
        return {
          message: `in ${hoursLeft}h`,
          isAvailable: false,
          icon: <Clock className="h-4 w-4 text-blue-500 mr-1" />,
        };
      }
    }

    return {
      message: "Complete",
      isAvailable: true,
      icon: <CheckCircle2 className="h-4 w-4 text-green-300" />,
    };
  };

  const { message, isAvailable, icon } = calculateAvailability();

  const handleComplete = async () => {
    if (isSubmitting || !isAvailable) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/chores/${chore.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: true, currentReward }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update chore");

      setOpen(false);
      toast.success(
        `Chore completed! Level: ${data.level}, XP: ${data.xp}/${data.xpForNextLevel}`
      );
    } catch (err) {
      toast.error(err.message || "Failed to complete chore");
    } finally {
      setIsSubmitting(false);
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={isAvailable ? "icon" : ""} // 👈 size toggle based on available
          className={cn(
            "border-green-700 hover:bg-green-800",
            !isAvailable && "opacity-70 cursor-not-allowed"
          )}
          disabled={!isAvailable}
        >
          {isAvailable ? (
            <CheckCircle2 className="h-4 w-4 text-green-300" />
          ) : (
            <span className="flex items-center gap-1 text-xs">
              {icon}
              {message}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="flex flex-col gap-2 text-white">
            <p>Complete Chore</p>
            <p className="text-sm text-amber-400">{currentReward} SATS</p>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-gray-200">Mark "{chore.name}" as complete?</p>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full"
            disabled={isSubmitting || !isAvailable}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Confirming...
              </span>
            ) : (
              "Confirm Completion"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
