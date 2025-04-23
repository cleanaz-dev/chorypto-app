"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Unlock, Video } from "lucide-react";
import { FaBitcoin } from "react-icons/fa";
import { Bitcoin } from "lucide-react";

export default function EarnMoreDialog() {
  const [showAd, setShowAd] = useState(true);
  const [open, setOpen] = useState(false);




  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* Moved text inside the button, added gap and padding */}
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 "
          disabled={!showAd}
        >
          <FaBitcoin className="fill-amber-500" />
          <span>Earn More Sats</span>{" "}
          {/* Changed text to match component name intent */}
        </Button>
      </DialogTrigger>
      <DialogContent className=" bg-gray-900 border-gray-800">
        {" "}
        {/* Example width constraint */}
        <DialogHeader>
          <DialogTitle><span className="flex gap-2">Watch Ad to Earn Satoshis <Bitcoin className="text-amber-500"/></span></DialogTitle>{" "}
          {/* Updated Title */}
          <DialogDescription>
            Watch a short advertisement completely to earn extra satoshis that
            you can use. Make sure your ad blocker is paused if you have one.
          </DialogDescription>{" "}
          {/* Added Description */}
        </DialogHeader>
        {/*Reward Main Content Area */}
        <div className="py-4">
          <div>
            <p className="text-sm text-gray-400">
              Click the button below to start the ad. Rewards are credited only
              after watching the full video.
            </p>
            {/* You might add more info here later, like the exact reward amount */}
            <p className="text-center font-semibold text-amber-400 mt-4">
              Reward: 10 sats (example)
            </p>
          </div>
          <div className="">
            {/* Unlock icon for showing/hiding the ad */}
         
            {showAd && (
              <div className="flex justify-around pt-8">
                <Button
                className="bg-amber-500 group"
                  type="button"
                  onClick={() => {
                    console.log(
                      "Trigger Ad SDK here"
                    ); /* TODO: Implement ad trigger */
                  }}
                >
                  <Video className="mr-2 h-4 w-4 group-hover:scale-150 transition-all duration-300" /> Watch Ad Now
                </Button>
          
              <Button variant="ghost">Cancel</Button>
              </div>
            )}
               
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
