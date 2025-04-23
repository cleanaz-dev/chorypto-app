import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. First get the user with their organization (without trying to include members)
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      include: {
        Organization: true // Just get basic org info
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.Organization) {
      return NextResponse.json({ organization: null, members: [] });
    }

    // 2. Now get the member details separately
    const members = await prisma.user.findMany({
      where: {
        id: {
          in: user.Organization.members // Use the member IDs array
        }
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        clerkId: true
      }
    });

    return NextResponse.json({
      organization: user.Organization,
      members
    });

  } catch (error) {
    console.error("Error fetching organization:", error);
    return NextResponse.json(
      { error: "Failed to fetch organization" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();
    console.log("org name:", name);

    // 1. Get the creating user
    const creator = await prisma.user.findUnique({
      where: { clerkId: clerkUserId }
    });

    if (!creator) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has an organization
    if (creator.organizationId) {
      return NextResponse.json(
        { error: "User already belongs to an organization" },
        { status: 400 }
      );
    }

    // 2. Create organization in a single transaction
    const result = await prisma.$transaction([
      prisma.organization.create({
        data: {
          name,
          creatorId: creator.id,
          members: {
            connect: [{ id: creator.id }]
          }
        }
      }),
      prisma.user.update({
        where: { id: creator.id },
        data: {
          role: "Creator"
        }
      })
    ]);

    const [organization] = result;

    return NextResponse.json({
      organization,
    });

  } catch (error) {
    console.error("Error creating organization:", error);
    return NextResponse.json(
      { error: "Failed to create organization" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json({ error: "Organization ID is required" }, { status: 400 });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    if (organization.creatorId !== clerkUserId) {
      return NextResponse.json({ error: "Forbidden: You are not the owner" }, { status: 403 });
    }

    const deletedOrganization = await prisma.organization.delete({
      where: { id: organizationId },
    });

    return NextResponse.json({ organization: deletedOrganization });

  } catch (error) {
    console.error("Error deleting organization:", error);
    return NextResponse.json({ error: "Failed to delete organization" }, { status: 500 });
  }
}