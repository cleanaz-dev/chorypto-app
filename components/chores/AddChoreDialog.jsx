"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MIN_REWARD_SATS = 600;
const MAX_REWARD_SATS = 5000;
const REWARD_INCREMENT = 100;

const initialChoreState = {
  name: "",
  reward: "600",
  frequency: "Once",
  assigneeEmail: "",
  dueDate: "",
  start: "today",
};

export default function AddChoreDialog() {
  const [open, setOpen] = useState(false);
  const [chore, setChore] = useState(initialChoreState);
  const [assignees, setAssignees] = useState([]);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const fetchAssignees = useCallback(async () => {
    try {
      const response = await fetch("/api/chores/assignees");
      if (!response.ok) throw new Error("Failed to fetch assignees");
      const data = await response.json();
      setAssignees(data);
    } catch (err) {
      console.error("Error fetching assignees:", err);
      setError("Could not load assignees");
    }
  }, []);

  useEffect(() => {
    fetchAssignees();
  }, [fetchAssignees]);

  useEffect(() => {
    if (open) {
      setChore(initialChoreState);
      setSelectedAssignee("");
      setError("");
    }
  }, [open]);

  const validateReward = (value) => {
    if (value === "") return true;
    const num = Number(value);
    return (
      !isNaN(num) &&
      num >= MIN_REWARD_SATS &&
      num <= MAX_REWARD_SATS &&
      num % REWARD_INCREMENT === 0
    );
  };

  const handleRewardChange = (e) => {
    const value = e.target.value;
    setChore({ ...chore, reward: value });
    if (!validateReward(value)) {
      setError(
        `Reward must be between ${MIN_REWARD_SATS} and ${MAX_REWARD_SATS} sats in increments of ${REWARD_INCREMENT}`
      );
    } else {
      setError("");
    }
  };

  const isFormValid = () =>
    !!chore.name &&
    validateReward(chore.reward) &&
    Number(chore.reward) >= MIN_REWARD_SATS;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid()) {
      setError("Please fill in all required fields correctly");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: chore.name,
          reward: parseInt(chore.reward),
          frequency: chore.frequency,
          assigneeEmail: selectedAssignee || null,
          dueDate:
            chore.frequency !== "Daily" && chore.dueDate
              ? new Date(chore.dueDate).toISOString()
              : null,
          start: chore.frequency === "Daily" ? chore.start : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add chore");
      }

      setChore(initialChoreState);
      setSelectedAssignee("");
      setOpen(false);
      toast.success("Chore added successfully!");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add chore. Please try again."
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
      router.refresh()

    }
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setChore(initialChoreState);
      setSelectedAssignee("");
      setError("");
      setIsSubmitting(false);
    }
    setOpen(isOpen);
  };

  const inputStyles =
    "bg-gray-950 border-gray-800 text-white focus:ring-amber-500 focus:border-amber-500";
  const labelStyles = "text-gray-200";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 text-black hover:bg-amber-400">
          <Plus className="h-4 w-4 mr-2" /> Add Chore
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">New Chore</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="chore-name" className={labelStyles}>
                Chore Name
              </Label>
              <Input
                id="chore-name"
                placeholder="e.g., Wash Dishes"
                className={inputStyles}
                value={chore.name}
                onChange={(e) => setChore({ ...chore, name: e.target.value })}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward" className={labelStyles}>
                Reward (Satoshis)
              </Label>
              <Input
                id="reward"
                type="text"
                placeholder="e.g., 600"
                className={inputStyles}
                value={chore.reward}
                onChange={handleRewardChange}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency" className={labelStyles}>
              Frequency
            </Label>
            <Select
              value={chore.frequency}
              onValueChange={(value) =>
                setChore({ ...chore, frequency: value, dueDate: "", start: "today" })
              }
              disabled={isSubmitting}
            >
              <SelectTrigger className={inputStyles}>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Once">Once</SelectItem>
                <SelectItem value="Daily">Daily</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {chore.frequency === "Daily" && (
            <div className="space-y-2">
              <Label htmlFor="start" className={labelStyles}>
                Start
              </Label>
              <Select
                value={chore.start}
                onValueChange={(value) =>
                  setChore({ ...chore, start: value })
                }
                disabled={isSubmitting}
              >
                <SelectTrigger className={inputStyles}>
                  <SelectValue placeholder="Select start" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="tomorrow">Tomorrow</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {chore.frequency !== "Daily" && (
            <div className="space-y-2">
              <Label htmlFor="due-date" className={labelStyles}>
                Due Date (optional)
              </Label>
              <Input
                id="due-date"
                type="datetime-local"
                className={inputStyles}
                value={chore.dueDate}
                onChange={(e) => setChore({ ...chore, dueDate: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="assignee-email" className={labelStyles}>
              Assignee
            </Label>
            <Select
              value={selectedAssignee}
              onValueChange={setSelectedAssignee}
              disabled={isSubmitting}
            >
              <SelectTrigger className={inputStyles}>
                <SelectValue placeholder="Select assignee" />
              </SelectTrigger>
              <SelectContent>
                {assignees.map((assignee) => (
                  <SelectItem key={assignee.email} value={assignee.email}>
                    {assignee.firstName} ({assignee.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <Button
            type="submit"
            className="w-full bg-amber-500 text-black hover:bg-amber-400 disabled:opacity-50"
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Chore"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}