import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Wallet } from "lucide-react";
import { usePayout } from "@/lib/context/PayoutContext";

export default function PayoutInformationCard() {
  const { payoutInformation } = usePayout();
  const {
    name,
    id: orgId,
    OrgSettings: {
      payoutFrequency,
      payoutTime,
      payoutCurrency,
      nextPayOutDate,
      payoutDay
    } = {},
  } = payoutInformation || {};

  // Default values if payoutInformation is empty
  const displayName = name || "Not specified";
  const displayCurrency = payoutCurrency || "Not set";
  const displayFrequency = payoutFrequency || "Not set";
  const displayTime = payoutTime || "Not set";

  return (
    <Card className="bg-gray-900  border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-indigo-500" />
          Payout Information
        </CardTitle>
        <CardDescription>
          Your organization's payout settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Organization</p>
            <p className="font-semibold">{displayName}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Currency</p>
            <p className="font-semibold">{displayCurrency}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Frequency</p>
            <p className="font-semibold">{displayFrequency}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Payout Day</p>
            <p className="font-semibold">{payoutDay || "TBA"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Payout Time</p>
            <p className="font-semibold">{displayTime}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">
              Next Payout Date
            </p>
            <p className="font-semibold">
              {new Date(nextPayOutDate).toLocaleDateString(
                "en-US",
                {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
