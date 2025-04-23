"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bitcoin, Copy } from "lucide-react";
import { useUser } from "@clerk/nextjs"; // Keep useUser here if needed for actions
import CreateWalletButton from "../wallet/CreateWalletButton";
import CreateOrgWalletButton from "../wallet/CreateOrgWalletButton";
import { formatSatsWithCommas } from "@/lib/utils";
import { Wallet2Icon } from "lucide-react";

// Placeholder for Transaction Type - Replace with actual type if available
// type Transaction = {
//   id: string;
//   title: string;
//   amount: string; // Or number
//   date: string; // Or Date
// };

export default function Wallet({
  userWalletData,
  organization,
  orgWalletBalance,
  userId,
  userIdSatoshiBalance,
  role,
}) {
  const [copyWallet, setCopyWallet] = useState(false);
  const [orgWallet, setOrgWallet] = useState(false);
  const [isTestPayout, setIsTestPayout] = useState(false);
  const [transactions, setTransactions] = useState([]); // State for transactions

  const userWalletAddress = userWalletData?.[0]?.address;
  const orgWalletAddress = organization?.wallet?.address;
  const orgWalletBalanceSats = formatSatsWithCommas(orgWalletBalance);
  const userWalletBalanceSats = formatSatsWithCommas(userIdSatoshiBalance);

  // Use effect for copy feedback timeout
  useEffect(() => {
    let timer;
    if (copyWallet) {
      timer = setTimeout(() => setCopyWallet(false), 2000);
    } else if (orgWallet) {
      timer = setTimeout(() => setOrgWallet(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [copyWallet, orgWallet]);

  // Use effect to fetch transactions (example)
  useEffect(() => {
    // TODO: Replace with actual API call to fetch user's transactions
    // Example fetch:
    // async function fetchTransactions() {
    //   try {
    //     const response = await fetch(`/api/wallets/transactions?userId=${userId}`);
    //     if (!response.ok) throw new Error("Failed to fetch transactions");
    //     const data = await response.json();
    //     setTransactions(data.transactions); // Assuming API returns { transactions: [...] }
    //   } catch (error) {
    //     console.error("Error fetching transactions:", error);
    //     // Handle error state appropriately
    //   }
    // }
    // if (userId) {
    //  fetchTransactions();
    // }

    // Using static data for now:
    setTransactions([
      { id: "1", title: "Clean kitchen", amount: "+200 SATS", date: "Today" },
      {
        id: "2",
        title: "Vacuum living room",
        amount: "+150 SATS",
        date: "Yesterday",
      },
      { id: "3", title: "Do laundry", amount: "+300 SATS", date: "Yesterday" },
      // Add more transaction objects here
    ]);
  }, [userId]); // Re-fetch if userId changes

  const handleCopyToClipboard = () => {
    if (userWalletAddress) {
      navigator.clipboard.writeText(userWalletAddress);
      setCopyWallet(true);
    }
  };

  const handleCopyOrgWallet = () => {
    if (orgWalletAddress) {
      navigator.clipboard.writeText(orgWalletAddress);
      setOrgWallet(true);
    }
  };

  const handleTestPayout = async () => {
    if (!userId || !organization?.id) {
      console.error("User ID or Organization ID is missing for test payout.");
      // Optionally show a user-facing error message
      return;
    }
    setIsTestPayout(true);
    try {
      const response = await fetch("/api/wallets/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId, // Ensure your API uses this if needed for auth/lookup
          amountToSendSatoshis: 600, // Test amount
          senderOrgId: organization.id,
          recipientUserId: userId, // Sending to self in this test case
        }),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({
            message: "Request failed with status " + response.status,
          }));
        throw new Error(errorData.message || "Test payout request failed");
      }

      const data = await response.json();
      console.log("Test Payout Response:", data);
      // TODO: Potentially show a success message to the user
      // TODO: Re-fetch transactions or balance after successful payout
      // fetchTransactions(); // Re-fetch transactions list
    } catch (error) {
      console.error("Test Payout Error:", error);
      // TODO: Show an error message to the user
    } finally {
      setIsTestPayout(false);
    }
  };

  // TODO: Implement Xfer Funds functionality
  const handleTransferFunds = () => {
    console.log("Transfer Funds button clicked");
    // Implement fund transfer logic here
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
        <CardDescription className="text-gray-400"> </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {" "}
        {/* Added spacing */}
        {/* Organization Wallet Section */}
        {role === "Creator" && (
          <div className="p-2 border-slate-600 bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">
                Organization wallet address
              </span>
              <span className="text-xs font-medium text-green-300 h-4">
                {" "}
                {/* Added fixed height */}
                {orgWallet ? "Copied!" : ""}
              </span>
            </div>
            <div className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5">
              <div className="text-xs flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {orgWalletAddress ? (
                    <div className="flex overflow-hidden">
                      <span className="truncate block font-mono">
                        {orgWalletAddress}
                      </span>{" "}
                      {/* Added font-mono */}
                    </div>
                  ) : (
                    // Pass necessary props to CreateOrgWalletButton
                    <CreateOrgWalletButton userId={userId} />
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    className="group disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-gray-400 hover:text-white"
                    disabled={!orgWalletAddress}
                    onClick={handleCopyOrgWallet}
                    aria-label="Copy organization wallet address"
                  >
                    <Copy
                      size={16}
                      className="group-hover:text-amber-400 group-hover:scale-105 transition-all duration-200"
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Org Wallet Balance */}
            {orgWalletAddress && ( // Only show balance if org wallet exists
              <div className="rounded-lg border border-gray-800 bg-gray-950 p-4 mt-2 ">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Wallet2Icon className="mr-2 h-5 w-5 text-amber-500" />
                    <span className="font-medium">Organization Balance</span>
                  </div>
                  {/* <span className="text-xs text-gray-400">BTC</span> */}
                </div>
                <div className="mt-3 text-2xl font-bold text-amber-500 flex justify-between items-center">
                  <span>{orgWalletBalanceSats}</span> <span>SATS</span>
                </div>
                {/* TODO: Fetch and display accurate USD equivalent */}
                {/* <div className="mt-1 text-sm text-gray-400">≈ $XXX.XX USD</div> */}
              </div>
            )}
          </div>
        )}
        {/* User Wallet Section */}
        <div className="p-2 border-slate-600 bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-400">Your wallet address</span>
            <span className="text-xs font-medium text-green-300 h-4">
              {" "}
              {/* Added fixed height */}
              {copyWallet ? "Copied!" : ""}
            </span>
          </div>
          <div className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-2.5">
            <div className="text-xs flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                {userWalletAddress ? (
                  <div className="flex overflow-hidden">
                    <span className="truncate block font-mono">
                      {userWalletAddress}
                    </span>{" "}
                    {/* Added font-mono */}
                  </div>
                ) : (
                  // Pass necessary props to CreateWalletButton
                  <CreateWalletButton userId={userId} />
                )}
              </div>
              <div>
                <button
                  type="button"
                  className="group disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-gray-400 hover:text-white"
                  disabled={!userWalletAddress}
                  onClick={handleCopyToClipboard}
                  aria-label="Copy your wallet address"
                >
                  <Copy
                    size={16}
                    className="group-hover:text-amber-400 group-hover:scale-105 transition-all duration-200"
                  />
                </button>
              </div>
            </div>
          </div>
          {/* Org Wallet Balance */}
          {userWalletAddress && ( // Only show balance if org wallet exists
            <div className="rounded-lg border border-gray-800 bg-gray-950 p-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wallet2Icon className="mr-2 h-5 w-5 text-amber-500" />
                  <span className="font-medium">User Balance</span>
                </div>
                {/* <span className="text-xs text-gray-400">BTC</span> */}
              </div>
              <div className="mt-3 text-2xl font-bold text-amber-500 flex justify-between items-center">
                <span> {userWalletBalanceSats}</span> <span>SATS</span>
              </div>
              {/* TODO: Fetch and display accurate USD equivalent */}
              {/* <div className="mt-1 text-sm text-gray-400">≈ $XXX.XX USD</div> */}
            </div>
          )}
        </div>
        {/* Test Payout Button - Enable only if user & org wallets exist */}
        {userWalletAddress && orgWalletAddress && role === "Creator" && (
          <div className="rounded-lg border border-gray-800 bg-gray-950 p-4">
            <Button
              className="w-full" // Make button full width
              onClick={handleTestPayout}
              disabled={
                isTestPayout || !orgWalletBalance || orgWalletBalance < 600
              } // Disable if testing or insufficient balance
            >
              <span className="text-xs">
                {isTestPayout
                  ? "Testing Payout..."
                  : "Test Payout (600 SATS to Self)"}
              </span>
            </Button>
            {orgWalletBalance < 600 && (
              <p className="text-xs text-red-400 mt-2 text-center">
                Insufficient organization balance for test payout.
              </p>
            )}
          </div>
        )}
        {/* Wallet Transactions */}
        <div className="space-y-3 pt-4">
          {" "}
          {/* Added padding top */}
          <h4 className="font-medium text-base">Recent Transactions</h4>{" "}
          {/* Slightly larger heading */}
          {transactions.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
              {" "}
              {/* Scrollable list */}
              {transactions.map((tx) => (
                <div
                  key={tx.id} // Use a unique key, like transaction ID
                  className="flex items-center justify-between rounded-lg border border-gray-800 p-3 bg-gray-950" // Changed padding and background
                >
                  <div>
                    <p className="text-sm font-medium">{tx.title}</p>
                    <p className="text-xs text-gray-400">{tx.date}</p>
                  </div>
                  <div className="text-sm font-medium text-amber-500 whitespace-nowrap">
                    {" "}
                    {/* Prevent wrapping */}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No transactions yet.
            </p>
          )}
        </div>
        {/* Transfer Funds Button - Enable only if user wallet exists */}
        <Button
          className="w-full bg-amber-500 text-black hover:bg-amber-400 mt-4"
          onClick={handleTransferFunds}
          disabled={!userWalletAddress} // Disable if user has no wallet
        >
          Transfer Funds
        </Button>
      </CardContent>
    </Card>
  );
}
