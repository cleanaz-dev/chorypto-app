"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateOrgWalletButton({ userId }) {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateWallet = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/wallets/organization", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      const { address } = await res.json();
      setAddress(address);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      router.refresh(); 
    }
  };

  return (
    <div>
      {!address && (
        <button
          onClick={handleCreateWallet}
          disabled={isLoading}
          className="py-1.5 px-2.5 min-w-20 text-amber-400 border-2 rounded-md hover:border-amber-400 transition-all duration-300"
        >
          {isLoading ? "Creating..." : "Create Org. Wallet"}
        </button>
      )}
      {address && <p>{address}</p>}
    </div>
  );
}