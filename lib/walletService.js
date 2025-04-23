//lib/walletService.js

import prisma from "./prisma";
import * as bitcoin from "bitcoinjs-lib";
import { networks } from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import { encrypt, decrypt } from "./crypto";
import axios from "axios";
// import * as secp from '@noble/secp256k1';
import * as secp256k1 from '@bitcoinerlab/secp256k1';

// Initialize crypto libraries properly
const ECPair = ECPairFactory( secp256k1 );
bitcoin.initEccLib( secp256k1 );

const network = networks.testnet;
// Explicitly define SIGHASH_ALL constant
const SIGHASH_ALL = 0x01;

// Dust threshold for P2WPKH (in satoshis)
const DUST_THRESHOLD = 546;

export async function createTestnetWallet(userId) {
  console.log(`[WalletService] Creating wallet for user ${userId}`);

  try {
    // 1. Generate key pair with proper type conversion
    const keyPair = ECPair.makeRandom({
      network: networks.testnet,
      rng: (size) => crypto.getRandomValues(new Uint8Array(size)),
    });

    // Explicitly convert public key to Buffer
    const publicKeyBuffer = Buffer.from(keyPair.publicKey);
    console.log("[WalletService] Keypair generated successfully");

    // 2. Derive address with properly typed public key
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: publicKeyBuffer, // Explicit Buffer type
      network: networks.testnet,
    });

    if (!address) throw new Error("Address derivation failed");
    console.log(`[WalletService] Address derived: ${address}`);

    // 3. Prepare and encrypt private key
    const privateKey = keyPair.toWIF();
    const encryptedPrivateKey = encrypt(privateKey);

    console.log("[WalletService] Encryption successful.");

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    // 4. Save to database
    const wallet = await prisma.userWallet.create({
      data: {
        userId: user.id,
        privateKey: encryptedPrivateKey,
        address,
        network: "testnet",
      },
    });

    console.log(
      `[WalletService] Wallet created successfully ${wallet.id} ${wallet.network}`
    );

    return {
      id: wallet.id,
      address,
      network: "testnet",
    };
  } catch (error) {
    console.error("[WalletService] Creation failed:", error);
    throw new Error("Wallet creation failed. Please try again.");
  }
}

export async function createOrgTestnetWallet(userId) {
  console.log(`[WalletService] Creating wallet for organization ${userId}`);
  try {
    // 1. Generate key pair with proper type conversion
    const keyPair = ECPair.makeRandom({
      network: networks.testnet,
      rng: (size) => crypto.getRandomValues(new Uint8Array(size)),
    });

    // Explicitly convert public key to Buffer
    const publicKeyBuffer = Buffer.from(keyPair.publicKey);
    console.log("[WalletService] Keypair generated successfully");

    // 2. Derive address with properly typed public key
    const { address } = bitcoin.payments.p2wpkh({
      pubkey: publicKeyBuffer, // Explicit Buffer type
      network: networks.testnet,
    });

    if (!address) throw new Error("Address derivation failed");
    console.log(`[WalletService] Address derived: ${address}`);

    // 3. Prepare and encrypt private key
    const privateKey = keyPair.toWIF();
    const encryptedPrivateKey = encrypt(privateKey);

    console.log("[WalletService] Encryption successful.");

    const user = await prisma.user.findUnique({ 
      where: { clerkId: userId },
      include: {
        Organization: true,
      }
     });
    
     console.log(`[WalletService] Org Id query ${user.Organization[0].id}`);
    // 4. Save to database
    const wallet = await prisma.orgWallet.create({
      data: {
        organizationId: user.Organization[0].id,
        privateKey: encryptedPrivateKey,
        address,
        network: "testnet",
      },
    });

    console.log(
      `[WalletService] Wallet created successfully ${wallet.id} ${wallet.network}`
    );

    return {
      id: wallet.id,
      address,
      network: "testnet",
    };
  } catch (error) {
    console.error("[WalletService] Creation failed:", error);
    throw new Error("Wallet creation failed. Please try again.");
  }
}


export async function sendTestnetTransaction(
  senderOrgId,
  recipientUserId,
  amountToSendSatoshis
) {
  console.log(`[SendTx] Initiating transaction from Org ${senderOrgId} to User ${recipientUserId} for ${amountToSendSatoshis} sats`);
  try {
    // --- Get Sender OrgWallet Info ---
    const senderWallet = await prisma.orgWallet.findUnique({
      where: { organizationId: senderOrgId },
    });
    if (!senderWallet || !senderWallet.privateKey || !senderWallet.address) {
      throw new Error(`Sender OrgWallet data incomplete or not found for orgId ${senderOrgId}`);
    }
    const SENDER_ADDRESS = senderWallet.address;
    const encryptedWif = senderWallet.privateKey;
    console.log(`[SendTx] Sender OrgWallet Address: ${SENDER_ADDRESS}`);

    // --- Get Recipient UserWallet Address ---
    const user = await prisma.user.findUnique({
      where: { clerkId: recipientUserId },
    });
    const recipientWallet = await prisma.userWallet.findFirst({
      where: { userId: user.id, network: 'testnet' },
      orderBy: { createdAt: 'asc' },
    });
    if (!recipientWallet || !recipientWallet.address) {
      throw new Error(`Recipient UserWallet address not found for userId ${recipientUserId}`);
    }
    const RECIPIENT_ADDRESS = recipientWallet.address;
    console.log(`[SendTx] Recipient UserWallet Address: ${RECIPIENT_ADDRESS}`);

    // --- Validate Amount ---
    if (amountToSendSatoshis < DUST_THRESHOLD) {
      throw new Error(`Amount to send (${amountToSendSatoshis} satoshis) is below dust threshold (${DUST_THRESHOLD} satoshis)`);
    }

    // --- Get Dynamic Fee Rate ---
    console.log("[SendTx] Fetching recommended fee rates...");
    let feeRateSatPerVB;
    try {
      const feeResponse = await axios.get('https://mempool.space/testnet/api/v1/fees/recommended');
      feeRateSatPerVB = feeResponse.data.halfHourFee;
      console.log(`[SendTx] Recommended fee rate: ${feeRateSatPerVB} sat/vB`);
      if (!feeRateSatPerVB || typeof feeRateSatPerVB !== 'number' || feeRateSatPerVB <= 0) {
        console.warn(`[SendTx] Invalid fee rate fetched, using fallback: 2`);
        feeRateSatPerVB = 2;
      }
    } catch (feeError) {
      console.error("[SendTx] Failed to fetch fee rate:", feeError.message);
      console.warn("[SendTx] Using fallback fee rate: 2");
      feeRateSatPerVB = 2;
    }

    // --- Fetch Sender UTXOs ---
    console.log(`[SendTx] Fetching UTXOs for ${SENDER_ADDRESS}...`);
    let utxos = [];
    try {
      const utxoResponse = await axios.get(`https://mempool.space/testnet/api/address/${SENDER_ADDRESS}/utxo`);
      utxos = utxoResponse.data;
      console.log(`[SendTx] Found ${utxos.length} UTXOs`);
    } catch (utxoError) {
      console.error("[SendTx] Failed to fetch UTXOs:", utxoError.message);
      throw new Error("Unable to fetch UTXOs");
    }

    // --- Select UTXOs ---
    let selectedUtxos = [];
    let totalInputValue = 0;
    for (const utxo of utxos) {
      selectedUtxos.push({
        txid: utxo.txid,
        vout: utxo.vout,
        value: utxo.value,
      });
      totalInputValue += utxo.value;
      if (totalInputValue >= amountToSendSatoshis + 1000) break; // Rough fee estimate
    }
    if (totalInputValue < amountToSendSatoshis) {
      throw new Error(`Insufficient funds: ${totalInputValue} satoshis available, ${amountToSendSatoshis} needed`);
    }
    console.log(`[SendTx] Selected ${selectedUtxos.length} UTXOs with total value ${totalInputValue} sats`);

    // --- Decrypt Sender Private Key ---
    const decryptedWif = decrypt(encryptedWif);
    const keyPair = ECPair.fromWIF(decryptedWif, network);
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network });

    // --- Create PSBT ---
    const psbt = new bitcoin.Psbt({ network });
    let inputValue = 0;
    for (const utxo of selectedUtxos) {
      const utxoDetails = await axios.get(`https://mempool.space/testnet/api/tx/${utxo.txid}`);
      const scriptPubKey = utxoDetails.data.vout[utxo.vout].scriptpubkey;
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Buffer.from(scriptPubKey, 'hex'),
          value: utxo.value,
        },
      });
      inputValue += utxo.value;
    }

    // --- Add Outputs ---
    psbt.addOutput({
      address: RECIPIENT_ADDRESS,
      value: amountToSendSatoshis,
    });

    // --- Estimate Transaction Size and Fees ---
    const virtualSize = psbt.__CACHE.__TX.getVirtualSize(); // Rough estimate
    const fee = Math.ceil(virtualSize * feeRateSatPerVB);
    console.log(`[SendTx] Estimated fee: ${fee} sats for ${virtualSize} vB`);

    // --- Add Change Output if Needed ---
    const change = inputValue - amountToSendSatoshis - fee;
    if (change > DUST_THRESHOLD) {
      psbt.addOutput({
        address: SENDER_ADDRESS,
        value: change,
      });
      console.log(`[SendTx] Added change output: ${change} sats`);
    } else if (change < 0) {
      throw new Error(`Insufficient funds for fee: ${fee} sats required`);
    }

    // --- Sign Inputs ---
    for (let i = 0; i < selectedUtxos.length; i++) {
      psbt.signInput(i, keyPair);
      const sigHash = psbt.__CACHE.__TX.hashForWitnessV0(
        i,
        p2wpkh.script,
        selectedUtxos[i].value,
        SIGHASH_ALL
      );
      const signature = psbt.data.inputs[i].partialSig[0].signature;
      if (!secp256k1.verify(sigHash, keyPair.publicKey, signature)) {
        throw new Error(`Signature verification failed for input ${i}`);
      }
    }

    // --- Finalize and Broadcast ---
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    const txHex = tx.toHex();
    console.log(`[SendTx] Transaction hex: ${txHex}`);

    let txId;
    try {
      const broadcastResponse = await axios.post('https://mempool.space/testnet/api/tx', txHex);
      txId = broadcastResponse.data;
      console.log(`[SendTx] Transaction broadcasted: ${txId}`);
    } catch (broadcastError) {
      console.error("[SendTx] Failed to broadcast transaction:", broadcastError.message);
      throw new Error("Transaction broadcast failed");
    }

    return txId;
  } catch (error) {
    console.error("[SendTx] Error:", error.message);
    throw error;
  }
}

export async function getWalletBalance(address, network = "testnet") {
  console.log(`[GetBalance] Fetching balance for address ${address} on ${network}`);
  try {
    // Validate address
    if (!address || typeof address !== "string") {
      throw new Error("Invalid or missing address");
    }

    // Use mempool.space API
    const apiUrl = `https://mempool.space/${network}/api/address/${address}`;
    const response = await axios.get(apiUrl);
    const stats = response.data.chain_stats;

    // Calculate balance (in satoshis)
    const balanceSatoshis = stats.funded_txo_sum - stats.spent_txo_sum;
    console.log(`[GetBalance] Balance for ${address}: ${balanceSatoshis} satoshis`);

    return balanceSatoshis;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[GetBalance] Axios Error:", JSON.stringify(error.response?.data || error.message));
    } else {
      console.error("[GetBalance] Error:", error.message);
    }
    throw new Error(`Failed to fetch balance for ${address}: ${error.message}`);
  }
}


export async function getOrgWalletData(orgId) {
  console.log(`[GetOrgWalletData] Fetching data for orgId ${orgId}`);
  try {
    const wallet = await prisma.orgWallet.findUnique({
      where: { organizationId: orgId },
    });
    if (!wallet || !wallet.address) {
      throw new Error(`OrgWallet not found or missing address for orgId ${orgId}`);
    }
    const [balance, transactions] = await Promise.all([
      getWalletBalance(wallet.address, wallet.network || "testnet"),
      getWalletTransactions(wallet.address, wallet.network || "testnet"),
    ]);
    return {
      address: wallet.address,
      balanceSatoshis: balance,
      balanceBtc: balance / 100000000,
      transactions,
    };
  } catch (error) {
    console.error("[GetWalletData] Error:", error.message);
    throw error;
  }
}

export async function getWalletTransactions(address, network = "testnet", limit = 10) {
  console.log(`[GetTxs] Fetching transactions for address ${address} on ${network}`);
  try {
    if (!address || typeof address !== "string") {
      throw new Error("Invalid or missing address");
    }
    const apiUrl = `https://mempool.space/${network}/api/address/${address}/txs`;
    const response = await axios.get(apiUrl);
    const transactions = response.data.slice(0, limit); // Limit to recent txs

    // Format transactions for UI
    const formattedTxs = transactions.map(tx => {
      const isIncoming = tx.vout.some(vout => vout.scriptpubkey_address === address);
      const amountSatoshis = tx.vout.reduce((sum, vout) => {
        if (vout.scriptpubkey_address === address) {
          return sum + vout.value;
        }
        return sum;
      }, 0) - tx.vin.reduce((sum, vin) => {
        if (vin.prevout?.scriptpubkey_address === address) {
          return sum + vin.prevout.value;
        }
        return sum;
      }, 0);
      const date = new Date(tx.status.block_time * 1000);
      const dateStr = date.toLocaleDateString() === new Date().toLocaleDateString()
        ? "Today"
        : date.toLocaleDateString() === new Date(Date.now() - 86400000).toLocaleDateString()
        ? "Yesterday"
        : date.toLocaleDateString();

      return {
        title: isIncoming ? "Received" : "Sent", // Customize based on your needs
        amount: `${amountSatoshis >= 0 ? "+" : ""}${(amountSatoshis / 100000000).toFixed(8)} BTC`,
        date: dateStr,
      };
    });

    console.log(`[GetTxs] Fetched ${formattedTxs.length} transactions for ${address}`);
    return formattedTxs;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[GetTxs] Axios Error:", JSON.stringify(error.response?.data || error.message));
    } else {
      console.error("[GetTxs] Error:", error.message);
    }
    throw new Error(`Failed to fetch transactions for ${address}: ${error.message}`);
  }
}
export async function getUserWalletData(userId) {
  console.log(`[GetUserWalletData] Fetching data for userId ${userId}`);
  try {
    const wallets = await prisma.userWallet.findMany({
      where: { user: { clerkId: userId } },
      take: 1, // Get only the first wallet
    });
    
    if (!wallets || wallets.length === 0 || !wallets[0].address) {
      throw new Error(`UserWallet not found or missing address for userId ${userId}`);
    }

    const wallet = wallets[0]; // Select the first wallet
    const [balance, transactions] = await Promise.all([
      getWalletBalance(wallet.address, wallet.network || "testnet"),
      getWalletTransactions(wallet.address, wallet.network || "testnet"),
    ]);

    return {
      address: wallet.address,
      balanceSatoshis: balance,
      balanceBtc: balance / 100000000,
      transactions,
    };
  } catch (error) {
    console.error("[GetUserWalletData] Error:", error.message);
    throw error;
  }
}

