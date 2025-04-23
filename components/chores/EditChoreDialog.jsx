"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function EditChoreDialog({ chore }) {
  const [reward, setReward] = useState(chore.reward);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEditChore = (e) => {
    e.preventDefault(); // Prevent default form submission
 
    // Add your save logic here
    setOpen(false); // Close dialog after save
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Chore</DialogTitle>
          <DialogDescription>
            Edit the details of this chore.
          </DialogDescription>
          <div>
            {chore.name} ({chore.frequency})
          </div>
        </DialogHeader>
        <form onSubmit={handleEditChore}>
          <div className="flex flex-col gap-4">
            <Label htmlFor="chore-reward">Satoshis</Label>
            <Input
              type="number"
              id="chore-reward"
              value={reward}
              onChange={(e) => setReward(Number(e.target.value))}
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit" variant="outline">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}