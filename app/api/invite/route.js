// api/invite/route.js
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { sendInviteEmail } from "@/lib/resend";

export async function POST(request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { email } = await request.json();

    // Find inviting user and their organization
    const invitingUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: { Organization: true },
    });

    if (!invitingUser || !invitingUser.Organization) {
      return NextResponse.json(
        { error: "You don't have an organization" },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // If user exists, add to organization if not already a member
      if (!invitingUser.Organization.members.includes(existingUser.id)) {
        await prisma.organization.update({
          where: { id: invitingUser.organizationId },
          data: {
            members: {
              push: existingUser.id,
            },
          },
        });

        // Update user's organization reference
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            organizationId: invitingUser.organizationId,
          },
        });
      }
      return NextResponse.json({ message: "User added to organization" });
    }

    // Create invite for new user
    const inviteToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    await prisma.invite.create({
      data: {
        token: inviteToken,
        email,
        organizationId: invitingUser.organizationId,
        expiresAt,
      },
    });

    // Send email with invite link
    const emailResult = await sendInviteEmail(email, inviteToken);
    
    if (!emailResult.success) {
      throw new Error('Failed to send email invitation');
    }

    return NextResponse.json({ message: "Invite sent successfully" });
  } catch (error) {
    console.error("Error sending invite:", error);
    return NextResponse.json(
      { error: "Failed to send invite" },
      { status: 500 }
    );
  }
}