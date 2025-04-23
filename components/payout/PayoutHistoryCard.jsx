"use client";
import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
} from "../ui/card";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  History,
  Copy,
} from "lucide-react";
import { Badge } from "../ui/badge";
import { usePayout } from "@/lib/context/PayoutContext";

export default function PayoutHistoryCard() {
  const { payoutHistory } = usePayout();
  const [copiedId, setCopiedId] = useState(null); // track which ID was copied

  const handleCopy = async (transactionId) => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopiedId(transactionId);
      setTimeout(() => setCopiedId(null), 2000); // reset after 2 seconds
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      Completed: <CheckCircle2 className="size-4 text-green-500/50" />,
      Pending: <Clock className="size-4 text-yellow-500/50" />,
      Failed: <XCircle className="size-4 text-red-500/50" />,
      Processing: <AlertCircle className="size-4 text-blue-500/50" />,
      default: <Clock className="size-4 text-gray-500/50" />,
    };
    return statusIcons[status] || statusIcons.default;
  };

  const getStatusVariant = (status) => {
    const statusVariants = {
      Completed: "bg-transparent text-green-700",
      Pending: "bg-transparent text-yellow-700",
      Failed: "bg-transparent-red-700",
      Processing: "bg-transparent text-blue-700",
      default: "bg-transparent text-gray-700",
    };
    return statusVariants[status] || statusVariants.default;
  };

  const getBorderStatus = (status) => {
    const statusBorder = {
      Completed: "border-green-500/50",
      Pending: "border-yellow-500/50",
      Failed: "border-red-500/50",
      Processing: "border-blue-500/50",
      default: "border-gray-500/50",
    };
    return statusBorder[status] || statusBorder.default;
  };

  return (
    <Card className="bg-gray-900 border-gray-800 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-purple-500" />
          Payout History
        </CardTitle>
        <CardDescription>
          Track all your transactions in one place
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-gray-800">
          {payoutHistory.map((payout) => (
            <div
              key={payout.id}
              className=""
            >
              <div
                className={`flex justify-between py-3 px-4 gap-4 border-2 rounded-xl group ${getBorderStatus(
                  payout.status
                )}`}
              >
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-base group-hover:text-purple-500 duration-300 transition-colors">
                      {payout.amount || 0} SATS
                    </p>
                    <span className="text-xs text-gray-400">{payout.coin}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(payout.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  {/* Transaction ID and Copy Button */}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-purple-500 truncate max-w-[120px] italic">
                     Tx: {payout.transactionId}
                    </span>
                    <button
                      onClick={() => handleCopy(payout.transactionId)}
                      className="text-gray-400 hover:text-purple-400 transition duration-200"
                    >
                      <Copy className="size-4" />
                    </button>
                    {copiedId === payout.transactionId && (
                      <span className="text-green-400 text-xs">Copied!</span>
                    )}
                  </div>
                </div>

                <Badge
                  className={`self-start ${getStatusVariant(payout.status)}`}
                >
                  <span>{payout.status}</span>
                 
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
