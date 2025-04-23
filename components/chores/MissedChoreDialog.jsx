"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClockAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { startOfToday, nextDay } from 'date-fns';
import { Textarea } from "../ui/textarea";

export default function MissedChoreDialog({ chore }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({
    day: false,
    reason: false
  });
  const router = useRouter();

  const validateForm = () => {
    const newErrors = {
      day: !selectedOption,
      reason: reason.length < 20
    };
    setErrors(newErrors);
    return !newErrors.day && !newErrors.reason;
  };

  const handleMiss = async () => {
    if (!validateForm()) {
      toast.warning("Please select a day and provide a reason (at least 20 characters)");
      return;
    }

    setLoading(true);
    try {
      const rescheduleDate = selectedOption === "today" 
        ? startOfToday() 
        : nextDay(startOfToday(), 1);

      const response = await fetch(`/api/chores/${chore.id}/missed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rescheduleDate: rescheduleDate.toISOString(),
          note: reason
        })
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      toast.success("Chore successfully rescheduled");
      setOpen(false);
      router.refresh();
    } catch (err) {
      console.error("Failed to reschedule chore:", err);
      toast.error("Failed to reschedule chore");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-orange-700 text-orange-400 hover:bg-orange-800 hover:text-orange-200"
        >
          <ClockAlert className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Reschedule Missed Chore</DialogTitle>
          <DialogDescription className="text-gray-400">
            This chore was missed. Please select when you'll complete it and explain why.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-gray-200">Reschedule "{chore.name}"?</p>
          
          <div className="space-y-2">
            <Select 
              value={selectedOption} 
              onValueChange={(value) => {
                setSelectedOption(value);
                setErrors(prev => ({...prev, day: false}));
              }}
            >
              <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Select when..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="tomorrow">Tomorrow</SelectItem>
              </SelectContent>
            </Select>
            {errors.day && (
              <p className="text-sm text-red-500">Please select a day</p>
            )}
          </div>

          <div className="space-y-2">
            <Textarea 
              placeholder="Why was this chore missed? (Minimum 20 characters)"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors(prev => ({...prev, reason: false}));
              }}
              className={`bg-gray-800 border-gray-700 text-white ${
                errors.reason ? "border-red-500" : ""
              }`}
            />
            <div className="flex justify-between">
              {errors.reason && (
                <p className="text-sm text-red-500">
                  Reason must be at least 20 characters
                </p>
              )}
              <p className={`text-sm ml-auto ${
                reason.length < 20 ? "text-gray-400" : "text-green-400"
              }`}>
                {reason.length}/20
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="border-gray-600 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleMiss} 
              className="bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? "Rescheduling..." : "Confirm"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}