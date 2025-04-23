"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OctagonPause } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StopChoreDialog({ chore }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleStop = async () => {
    try {
      const response = await fetch(`/api/chores/${chore.id}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        toast.error("Failed to stop chore");
      }
      setOpen(false);
      toast.success("Chore stopped and archived");
    } catch (err) {
      console.error("Failed to delete chore:", err);
    } finally {
      router.refresh();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-red-700 text-red-400 hover:bg-red-800 hover:text-red-200"
        >
          <OctagonPause className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Stop & Archive</DialogTitle>
        </DialogHeader>
        <p className="text-gray-200">
          Are you sure you want to stop "{chore.name}"?
        </p>
        <Button onClick={handleStop} className="bg-red-600 hover:bg-red-700">
          Stop & Archive
        </Button>
      </DialogContent>
    </Dialog>
  );
}
