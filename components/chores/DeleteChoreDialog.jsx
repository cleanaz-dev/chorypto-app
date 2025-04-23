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
import { Trash2 } from "lucide-react";

export default function DeleteChoreDialog({ chore }) {
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      await fetch(`/api/chores/${chore.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      await fetch("/api/revalidate?path=/chores", { method: "POST" });
      setOpen(false);
    } catch (err) {
      console.error("Failed to delete chore:", err);
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
          <Trash2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Chore</DialogTitle>
        </DialogHeader>
        <p className="text-gray-200">Are you sure you want to delete "{chore.name}"?</p>
        <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
          Delete
        </Button>
      </DialogContent>
    </Dialog>
  );
}