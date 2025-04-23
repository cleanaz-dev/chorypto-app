// app/api/wallets/route.ts
import { createOrgTestnetWallet } from "@/lib/walletService";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await req.json();
  try {
    const wallet = await createOrgTestnetWallet(userId);
    return NextResponse.json(wallet);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create wallet" },
      { status: 500 },
    );
  }
}