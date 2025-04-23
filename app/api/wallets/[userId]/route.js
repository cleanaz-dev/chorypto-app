"use client";
import { useState } from "react";

export default function CreateWalletButton({ userId }) {
  const [address, setAddress] = useState("");

  const handleCreateWallet = async () => {
    const res = await fetch("/api/wallets", {
      method: "POST",
      body: JSON.stringify({ userId }),
    });
    const { address } = await res.json();
    setAddress(address);
  };

  return (
    <div>
      <button onClick={handleCreateWallet}>Create Testnet Wallet</button>
      {address && <p>Wallet Address: {address}</p>}
    </div>
  );
}