"use client";
import { getWallet } from "@/lib/walletService";
import * as bitcoin from "bitcoinjs-lib";
import { useState } from "react";

export default function SendBTC({ userId }) {
  const [txHash, setTxHash] = useState("");

  const handleSend = async () => {
    // 1. Get the wallet from DB
    const wallet = await getWallet(userId);
    if (!wallet) return;

    // 2. Prepare transaction
    const keyPair = bitcoin.ECPair.fromWIF(wallet.privateKey, bitcoin.networks.testnet);
    const txb = new bitcoin.TransactionBuilder(bitcoin.networks.testnet);
    txb.addInput("previousTxHash", 0); // Replace with actual UTXO
    txb.addOutput("recipientAddress", 10000); // 10,000 sats
    txb.sign(0, keyPair);

    // 3. Broadcast (simplified)
    const rawTx = txb.build().toHex();
    const res = await fetch("https://blockstream.info/testnet/api/tx", {
      method: "POST",
      body: rawTx,
    });
    setTxHash(await res.text());
  };

  return (
    <div>
      <button onClick={handleSend}>Send 10,000 Sats</button>
      {txHash && <p>TX Hash: {txHash}</p>}
    </div>
  );
}