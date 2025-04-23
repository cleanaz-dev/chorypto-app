import { revalidatePath } from "next/cache";
import prisma from "./prisma";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { addHours, isAfter, set, startOfDay } from "date-fns";
import { calculateChoreDeadlines } from "./utils";

export const findRoleByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    return user.role;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to find user role");
  } finally {
    await prisma.$disconnect();
  }
};

export const getOrganizationDataByUserId = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        Organization: true,
      },
    });

    if (!user.Organization) return {};

    const members = await prisma.user.findMany({
      where: { Organization: { is: user.Organization } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,

        role: true,
      },
    });

    return {
      organization: user.Organization,
      members,
    };
  } catch (error) {
    console.error("Failed to fetch organization data:", error);
    return {};
  }
};

export const createOrganization = async (name, userId) => {
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) throw new Error("User not found");

    const organization = await prisma.organization.create({
      data: {
        name,
        creatorId: user.id,
        members: [user.id],
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { organizationId: organization.id, role: "Creator" },
    });

    return {
      organization,
      members: [
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: "Creator",
        },
      ],
    };
  } catch (error) {
    console.error("Error in createOrganization:", error);
    return { error: error.message };
  }
};

export async function sendInviteEmail(email) {
  try {
    const response = await fetch("/api/invite/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Failed to send invite");
    }

    return { success: true, message: result.message };
  } catch (error) {
    console.error("Error sending invite:", error);
    return { error: error.message };
  }
}

export const getChoresByUserId = async (clerkUserId) => {
  if (!clerkUserId) {
    return [];
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!user) {
      return [];
    }
    const userId = user.id;

    const chores = await prisma.chore.findMany({
      where: {
        userId: userId,
      },
      include: { User: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });

    return chores;
  } catch (error) {
    console.error("Error fetching chores by userId:", error);
    return [];
  }
};

export const getUserDataByUserId = async (userId) => {
  if (!userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        firstName: true,
        email: true,
        role: true,
        organizationId: true,
        level:true,
        xp:true,


        Organization: {
          select: {
            name: true,
            id: true,
            creator: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            members: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        Chores: {
          include: {
            User: { select: { email: true } },
          },
        },
        ChoreLog: true,
      },
    });

    // Debug: Check organization data
    if (!user.Organization.length) {
      const org = await prisma.organization.findFirst({
        where: { id: user.organizationId },
      });
    }

    return user;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
};

export const completeChoreAction = async (choreId) => {
  try {
    await prisma.chore.update({
      where: { id: choreId },
      data: {
        completed: true, // Still set boolean if used for 'Once' or immediate UI feedback
        completedAt: new Date(), // *** This is the critical update ***
      },
    });
    // Add revalidation logic if using Next.js App Router caching
    revalidatePath("/chores");
    return { success: true };
  } catch (error) {
    console.error("Error completing chore:", error);
    return { success: false, error: "Failed to complete chore" };
  }
};

export const getUserSettingsbyUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        role: true,
        email: true,
        firstName: true,
        lastName: true,
        UserSettings: {
          select: {
            language: true,
            timezone: true,
            choreReminders: true,
            rewardNotifications: true,
            marketingEmails: true,
          },
        },
        Wallet: {
          select: {
            address: true,
          },
        },
        Organization: {
          select: {
            id: true,
            name: true,
            OrgSettings: {
              select: {
                payoutTime: true,
                payoutFrequency: true,
                payoutCurrency: true,
                chorePenalty: true,
                dailyChoreDeadline: true,
                dailyChoreWindow: true,
              },
              // Only fetch OrgSettings for Creator role
              where: {
                organization: {
                  creator: {
                    role: "Creator",
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Normalize the response
    return {
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      UserSettings: user.UserSettings || {},
      Wallet: user.Wallet || [],
      Organization: user.Organization
        ? {
            id: user.Organization.id,
            name: user.Organization.name,
            OrgSettings:
              user.role === "Creator" && user.Organization.OrgSettings
                ? user.Organization.OrgSettings
                : {},
          }
        : null,
    };
  } catch (error) {
    console.error("Failed to fetch user settings:", error);
    throw new Error("Failed to find user settings");
  }
};

export const getProfileDataByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        Wallet: {
          select: {
            address: true,
            network: true,
          },
        },
        Organization: {
          include: {
            wallet: { select: { address: true, network: true } },
          },
        },
        _count: { select: { ChoreLog: true } },
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to find user profile");
  } finally {
    await prisma.$disconnect();
  }
};

export const getChoresByOrganizationId = async (organizationId) => {
  try {
    if (!organizationId) {
      throw new Error("Invalid organization ID");
    }
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new Error("Organization not found");
    }
    const members = organization.members;
    const chores = await prisma.chore.findMany({
      where: {
        userId: { in: members },
        organizationId: organizationId,
      },
      include: { User: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });
    return chores;
  } catch (error) {
    console.error("Error fetching chores by organizationId:", error);
    return [];
  }
};

export const getOrganizationIdByUserId = async (userId) => {
  try {
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      throw new Error("User not found");
    }
    return user.organizationId;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to find user organization ID");
  } finally {
    await prisma.$disconnect();
  }
};

export function filterChores(chores = []) {
  const active = chores.filter(
    (chore) => !chore.completed && chore.frequency === "Once"
  );
  const completed = chores.filter((chore) => chore.completed);
  const recurring = chores.filter(
    (chore) => !chore.completed && chore.frequency !== "Once"
  );
  return { active, completed, recurring };
}

export function isTodayOrFuture(dateInput) {
  if (!dateInput) return false;
  try {
    const inputDate = new Date(dateInput);
    if (isNaN(inputDate.getTime())) return false;
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const startOfInputDate = new Date(inputDate.setHours(0, 0, 0, 0));
    return startOfInputDate.getTime() >= startOfToday.getTime();
  } catch (error) {
    console.error("Error in isTodayOrFuture:", dateInput, error);
    return false;
  }
}

export function calculateStats(chores = [], choreLogs = [], role) {
  const completed = chores.filter((chore) => chore.completed);
  return {
    earned: completed.reduce((sum, c) => sum + c.reward, 0),
    completed: completed.length,

    totalChores: choreLogs.length,
    totalRewards: choreLogs.reduce((sum, c) => sum + c.rewardApplied, 0),
  };
}

// Assuming calculateStreak exists; move it here if needed

export const getPayoutInformationByUserId = async (userId) => {
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        Organization: {
          select: {
            id: true,
            name: true,
            OrgSettings: true,
          },
        },
      },
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user.Organization;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to find payout information");
  }
};

// export const getEarnedRewardsByUserId = async (userId) => {
//   if (!userId) return null;
//   try {
//     const user = await prisma.user.findUnique({ where: { clerkId: userId } });
//     const choreLogs = await prisma.choreLog.findMany({
//       where: {
//         userId: user.id,
//         paid: false,
        
//       },
//       select: {
//         rewardApplied: true,
//       },
//     });
//     console.log("chores length:", choreLogs.length)
//     return choreLogs.reduce((sum, log) => sum + log.rewardApplied, 0);
//   } catch (error) {
//     console.error(error);
//     throw new Error("Failed to fetch earned rewards");
//   }
// };

export const getEarnedRewardsByUserId = async (userId) => {
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const choreLogSum = await prisma.choreLog.aggregate({
      _sum: {
        rewardApplied: true,
      },
      where: {
        userId: user.id,
        paid: false,
      }
    })

    return choreLogSum._sum.rewardApplied;
    } catch (error) {
    console.error(error);
    return 0;
    }
}

export const getAverageRewardByUserId = async (userId) => {
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const average = await prisma.choreLog.aggregate({
      _avg: {
        rewardApplied: true,
      },
      where: {
        userId: user.id,
        paid: true,
      }
    })
    return average._avg.rewardApplied;
    } catch (error) {
    console.error(error);
    return 0;
    }
}

export const getPayoutHistoryByUserId = async (userId) => {
  if (!userId) return null;
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    const payoutHistory = await prisma.payout.findMany({
      where: { userId: user.id },
    });

    return payoutHistory;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch payout history");
  }
};


export const updateActiveChoresStatus = async (activeChores, userId) => {
  if (!activeChores || !userId) return null;

  // Fetch user settings
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      UserSettings: { select: { timezone: true } },
      Organization: {
        select: {
          OrgSettings: {
            select: { dailyChoreDeadline: true, dailyChoreWindow: true },
          },
        },
      },
    },
  });

  if (!user) return activeChores;

  // Configure time settings
  const userTimezone = user.UserSettings?.timezone?.replace('_', '/') || 'America/New_York';
  const dailyChoreDeadline = user.Organization?.OrgSettings?.dailyChoreDeadline || '20:00';
  const dailyChoreWindow = user.Organization?.OrgSettings?.dailyChoreWindow || 2;
  const [deadlineHour, deadlineMinute] = dailyChoreDeadline.split(':').map(Number);

  const now = new Date();
  const updates = [];

  for (const chore of activeChores) {
    if (chore.status !== 'Active' || !chore.dueDate) continue;

    // Skip if completed today (timezone-aware)
    if (chore.completedAt) {
      const completedDate = new Date(chore.completedAt).toLocaleDateString('en-US', { timeZone: userTimezone });
      const today = now.toLocaleDateString('en-US', { timeZone: userTimezone });
      if (completedDate === today) continue;
    }

    const choreDueDate = new Date(chore.dueDate);

    if (chore.frequency === 'Daily') {
      // Convert deadline to UTC using user's timezone
      const localDueDate = new Date(choreDueDate.toLocaleString('en-US', { timeZone: userTimezone }));
      const deadlineLocal = new Date(localDueDate);
      deadlineLocal.setHours(deadlineHour, deadlineMinute, 0, 0);
      const utcDeadline = new Date(deadlineLocal.toISOString());

      // Calculate grace period end in UTC
      const graceEndLocal = new Date(deadlineLocal);
      graceEndLocal.setHours(deadlineHour + dailyChoreWindow, deadlineMinute, 0, 0);
      const utcGraceEnd = new Date(graceEndLocal.toISOString());

      // Status determination
      if (now > utcGraceEnd) {
        updates.push({
          where: { id: chore.id },
          data: { status: 'Missed' }, // Changed from 'Overdue'
        });
      } else if (now > utcDeadline) {
        updates.push({
          where: { id: chore.id },
          data: { status: 'Late' },
        });
      }
    } 
    // Handle one-time chores
    else if (chore.frequency === 'Once' && now > choreDueDate) {
      updates.push({
        where: { id: chore.id },
        data: { status: 'Overdue' },
      });
    }
  }

  // Batch update if needed
  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((update) => prisma.chore.update(update))
    );
  }

  // Return updated chore list
  return activeChores.map((chore) => {
    const update = updates.find((u) => u.where.id === chore.id);
    return update ? { ...chore, status: update.data.status } : chore;
  });
};

export const getTotalPayoutByOrganizationId = async (orgId) => {
  if (!orgId) return null;
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: orgId },
    });
    const payouts = await prisma.payout.findMany({
      where: {
        organizationId: organization.id,
      },
      select: {
        amount: true,
      },
    });
    const totalPayout = payouts.reduce((sum, payout) => sum + payout.amount, 0);
    return totalPayout;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch payout history");
  }
};

export const getNonPaidChoreLogsByUserId = async (userId) => {
  if (!userId) return null;
  try {
    const count = await prisma.choreLog.count({
      where: {
        user: {
          clerkId: userId,
        },
        paid: false,
      },
    });

    return count;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch non-paid chore logs count");
  }
};
