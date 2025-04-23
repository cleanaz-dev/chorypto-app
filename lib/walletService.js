//lib/walletService.js

import prisma from "./prisma";
import * as bitcoin from "bitcoinjs-lib";
import { networks } from "bitcoinjs-lib";
import { ECPairFactory } from "ecpair";
import * as tinysecp from "tiny-secp256k1";
import { encrypt, decrypt } from "./crypto";
import { randomBytes } from "crypto";
import axios from "axios";
import * as secp from '@noble/secp256k1';

// Initialize crypto libraries properly
const ECPair = ECPairFactory(tinysecp);
bitcoin.initEccLib(tinysecp);

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

    // --- a) Fetch Sender UTXOs ---
    console.log(`[SendTx] Fetching UTXOs for ${SENDER_ADDRESS}...`);
    const utxoResponse = await axios.get(
      `https://mempool.space/testnet/api/address/${SENDER_ADDRESS}/utxo`
    );
    const utxos = utxoResponse.data;
    console.log('[SendTx] Raw UTXOs received:', JSON.stringify(utxos, null, 2));

    const spendableUtxos = utxos.filter(utxo => utxo.value && utxo.status?.confirmed === true);
    console.log('[SendTx] Filtered Spendable UTXOs:', JSON.stringify(spendableUtxos, null, 2));

    if (!spendableUtxos || spendableUtxos.length === 0) {
      const confResponse = await axios.get(`https://mempool.space/testnet/api/address/${SENDER_ADDRESS}`);
      const funded = confResponse.data?.chain_stats?.funded_txo_sum || 0;
      const spent = confResponse.data?.chain_stats?.spent_txo_sum || 0;
      console.log(`[SendTx] Address funding check: Funded=${funded}, Spent=${spent}`);
      throw new Error(
        `No spendable UTXOs found for address ${SENDER_ADDRESS}. Make sure faucet funds are confirmed.`
      );
    }
    console.log(`[SendTx] Found ${spendableUtxos.length} spendable UTXOs.`);

    // --- b) Decrypt Private Key ---
    console.log("[SendTx] Decrypting private key...");
    const decryptedWIF = decrypt(encryptedWif);
    const keyPair = ECPair.fromWIF(decryptedWIF, network);
    console.log("[SendTx] Private key decrypted.");

    // --- e) Build Transaction (Psbt) ---
    const psbt = new bitcoin.Psbt({ network });
    let totalInputSatoshis = 0;
    let inputsCount = 0;

    // Add Inputs with explicit sighash type
    for (const utxo of spendableUtxos) {
      totalInputSatoshis += utxo.value;
      inputsCount++;
      psbt.addInput({
        hash: utxo.txid,
        index: utxo.vout,
        witnessUtxo: {
          script: Buffer.from(
            bitcoin.address.toOutputScript(SENDER_ADDRESS, network)
          ),
          value: utxo.value,
        },
        sighashTypes: [SIGHASH_ALL],
      });
      console.log(`[SendTx] Added input ${inputsCount - 1} with sighashTypes:`, psbt.data.inputs[inputsCount - 1].sighashType);
      if (totalInputSatoshis >= (amountToSendSatoshis + DUST_THRESHOLD)) { // Ensure enough for amount + fee
        console.log(`[SendTx] Sufficient input value (${totalInputSatoshis}) reached after adding ${inputsCount} inputs.`);
        break;
      }
    }

    if (totalInputSatoshis < amountToSendSatoshis) {
      throw new Error(
        `Insufficient funds even with all UTXOs. Available: ${totalInputSatoshis} satoshis, needed: ${amountToSendSatoshis}`
      );
    }

    // --- c) Add Outputs & Calculate Change ---
    const recipientOutputCount = 1;
    const changeOutputCount = 1;
    const estimatedTxVBytes = inputsCount * 68 + (recipientOutputCount * 31) + (changeOutputCount * 31) + 10.5;
    const estimatedFeeSatoshis = Math.ceil(estimatedTxVBytes * feeRateSatPerVB);
    console.log(`[SendTx] Estimated fee: ${estimatedFeeSatoshis} sats for ~${estimatedTxVBytes} vBytes at ${feeRateSatPerVB} sat/vB`);

    const changeAmountSatoshis = totalInputSatoshis - amountToSendSatoshis - estimatedFeeSatoshis;

    if (changeAmountSatoshis < 0) {
      throw new Error(
        `Insufficient funds for amount + estimated fee. Needed: ${amountToSendSatoshis + estimatedFeeSatoshis}, Have: ${totalInputSatoshis}`
      );
    }

    // Add Recipient Output
    psbt.addOutput({
      address: RECIPIENT_ADDRESS,
      value: amountToSendSatoshis,
    });
    console.log(`[SendTx] Added recipient output: ${amountToSendSatoshis} sats to ${RECIPIENT_ADDRESS}`);

    // Add Change Output (if above dust)
    if (changeAmountSatoshis >= DUST_THRESHOLD) {
      psbt.addOutput({
        address: SENDER_ADDRESS,
        value: changeAmountSatoshis,
      });
      console.log(`[SendTx] Added change output: ${changeAmountSatoshis} sats to ${SENDER_ADDRESS}`);
    } else {
      console.log(`[SendTx] Change ${changeAmountSatoshis} is below dust threshold; adding to fee.`);
    }

    // --- f) Sign Transaction ---
    console.log("[SendTx] Signing transaction inputs...");
    for (let i = 0; i < inputsCount; i++) {
      try {
        // Ensure keyPair is valid
        if (!keyPair || !keyPair.privateKey) {
          throw new Error(`Invalid keyPair for input ${i}`);
        }

        // Custom signer to ensure correct Buffer output
        const signer = {
          publicKey: Buffer.isBuffer(keyPair.publicKey) ? keyPair.publicKey : Buffer.from(keyPair.publicKey),
          sign(hash, lowR) {
            const sig = keyPair.sign(hash, lowR);
            const sigBuffer = Buffer.isBuffer(sig) ? sig : Buffer.from(sig);
            console.log(`[SendTx] Signature for input ${i} type: ${sigBuffer.constructor.name}, length: ${sigBuffer.length}`);
            return sigBuffer;
          },
        };

        psbt.signInput(i, signer);
        console.log(`[SendTx] Signed input ${i} successfully.`);

        // Debug partialSig
        console.log(`[SendTx] partialSig for input ${i}:`, psbt.data.inputs[i].partialSig);
      } catch (signError) {
        console.error(`[SendTx] Error signing input ${i}:`, signError.message);
        throw new Error(`Failed signing input ${i}: ${signError.message}`);
      }
    }

    // Validate signatures
    console.log("[SendTx] Validating signatures...");
    try {
      psbt.validateSignaturesOfAllInputs((pubkey, msghash, signature) => {
        console.log(`[SendTx] Validating signature type: ${signature.constructor.name}, length: ${signature.length}`);
        const signatureBuffer = Buffer.isBuffer(signature) ? signature : Buffer.from(signature);
        return tinysecp.verify(msghash, pubkey, signatureBuffer);
      });
    } catch (validationError) {
      console.error("[SendTx] Signature validation failed:", validationError.message);
      throw new Error(`Signature validation failed: ${validationError.message}`);
    }
    console.log("[SendTx] Signing and validation complete.");

    // --- g) Finalize Transaction ---
    console.log("[SendTx] Finalizing transaction...");
    try {
      psbt.finalizeAllInputs();
    } catch (finalizeError) {
      console.error(`[SendTx] Error finalizing inputs:`, finalizeError);
      throw new Error(`Failed finalizing tx: ${finalizeError.message}`);
    }
    console.log("[SendTx] Finalization complete.");

    // --- h) Extract and Broadcast ---
    const finalTx = psbt.extractTransaction();
    const finalTxHex = finalTx.toHex();
    const finalTxId = finalTx.getId();
    console.log(`[SendTx] Final Transaction Hex (${finalTxId}):`, finalTxHex);

    console.log("[SendTx] Broadcasting transaction...");
    const broadcastResponse = await axios.post(
      "https://mempool.space/testnet/api/tx",
      finalTxHex,
      { headers: { 'Content-Type': 'text/plain' } }
    );

    console.log(
      `[SendTx] Broadcast successful! Transaction ID: ${broadcastResponse.data} (Matches calculated: ${broadcastResponse.data === finalTxId})`
    );
    return broadcastResponse.data;

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("[SendTx] Axios Error:", JSON.stringify(error.response?.data || error.message));
    } else {
      console.error("[SendTx] Transaction failed:", error.message);
    }
    throw new Error(
      `Failed to send transaction: ${error.response?.data || error.message}`
    );
  } finally {
    console.log("[SendTx] Transaction function execution finished.");
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