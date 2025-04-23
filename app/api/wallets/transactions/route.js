// app/api/wallets/transactions/route.js

import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma"; // Adjust path if needed
import { sendTestnetTransaction } from "@/lib/walletService"; // Adjust path if needed
import { NextResponse } from "next/server";

// --- Authorization Helper ---
// IMPORTANT: Implement this based on your schema!
// Should verify the clerkUserId is an admin AND is associated with the passed orgIdToCheck.
async function isUserAdminForOrg(clerkUserId, orgIdToCheck) {
  const user = await prisma.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { id: true, organizationId: true, role: true }
   });

  if (!user) return false;

  // Combine role check and organization match check
  const isCreator = user.role === "Creator"; // Adjust role name if needed
  const isCorrectOrg = user.organizationId === orgIdToCheck;

  console.log(`[Authz Check] User ${user.id} attempting action on Org ${orgIdToCheck}. IsCreator=${isCreator}, IsCorrectOrg=${isCorrectOrg}`);
  return isCreator && isCorrectOrg;
}
// --- End Authorization Helper ---


export async function POST(req) {
  console.log('[POST /api/send] Request received');
  
  try {
    // Authentication
    console.log('[1/6] Authenticating user...');
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      console.log('⚠️ Authentication failed - no clerkUserId');
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    console.log(`✅ Authenticated as clerk user: ${clerkUserId}`);

    // Parse body
    console.log('[2/6] Parsing request body...');
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.log('⚠️ Body parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const { senderOrgId, recipientUserId, amountToSendSatoshis } = body;
    console.log(`Extracted params - org: ${senderOrgId}, recipient: ${recipientUserId}, amount: ${amountToSendSatoshis}`);

    // Input validation
    console.log('[3/6] Validating inputs...');
    if (!senderOrgId || !recipientUserId || amountToSendSatoshis == null) {
      console.log('⚠️ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }
    
    const amount = Number(amountToSendSatoshis);
    if (isNaN(amount)) {
      console.log('⚠️ Invalid amount (not a number)');
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      console.log(`⚠️ Invalid amount (must be positive integer): ${amount}`);
      return NextResponse.json({ error: 'Invalid amount.' }, { status: 400 });
    }
    console.log(`✅ Valid amount: ${amount} satoshis`);

    // Authorization check
    console.log('[4/6] Checking admin authorization...');
    const authorized = await isUserAdminForOrg(clerkUserId, senderOrgId);
    if (!authorized) {
      console.log(`⚠️ User ${clerkUserId} not admin for org ${senderOrgId}`);
      return NextResponse.json({ error: 'User not authorized for this organization wallet.' }, { status: 403 });
    }
    console.log(`✅ User is admin for org ${senderOrgId}`);

    // Recipient validation
    console.log('[5/6] Verifying recipient...');
    const recipientUser = await prisma.user.findUnique({
      where: { clerkId: recipientUserId },
      select: { organizationId: true }
    });

    if (!recipientUser) {
      console.log(`⚠️ Recipient ${recipientUserId} not found`);
      return NextResponse.json({ error: 'Recipient user not found.' }, { status: 404 });
    }
    if (recipientUser.organizationId !== senderOrgId) {
      console.log(`⚠️ Recipient org mismatch (expected ${senderOrgId}, got ${recipientUser.organizationId})`);
      return NextResponse.json({ error: 'Recipient does not belong to the sender organization.' }, { status: 403 });
    }
    console.log(`✅ Recipient ${recipientUserId} verified in org ${senderOrgId}`);

    // Transaction
    console.log('[6/6] Sending transaction...');
    console.log(`Sending ${amount} satoshis from org ${senderOrgId} to user ${recipientUserId}`);
    
    const txid = await sendTestnetTransaction(
      senderOrgId,
      recipientUserId,
      amount
    );

    console.log(`🎉 Transaction successful! TXID: ${txid}`);
    return NextResponse.json({ txid: txid }, { status: 200 });

  } catch (error) {
    console.error('💥 [API SendTx] Critical Error:', error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred.";
    
    let status = 500;
    if (error.message.includes("Insufficient funds") || 
        error.message.includes("No spendable UTXOs") || 
        error.message.includes("Recipient user not found")) {
      status = 400;
    }
    
    console.log(`Returning error (status ${status}): ${message}`);
    return NextResponse.json({ error: `Transaction failed: ${message}` }, { status: status });
  }
}