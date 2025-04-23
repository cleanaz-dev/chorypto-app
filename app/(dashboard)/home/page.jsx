import DashboardHomepage from '@/components/dashboard/DashboardHomePage';
import { DashboardProvider } from '@/lib/context/DashboardContext';
import { auth } from '@clerk/nextjs/server';
import {
  findRoleByUserId,
  getUserDataByUserId,
  filterChores,
  isTodayOrFuture,
  calculateStats,
  getTotalPayoutByOrganizationId
} from '@/lib/actions';
import { getOrgWalletData, getUserWalletData } from '@/lib/walletService';

export default async function Page() {
  // Data fetching (unchanged)
  const { userId } = await auth();
  const role = await findRoleByUserId(userId);
  const userData = await getUserDataByUserId(userId);
  const orgId = userData.Organization.id || '';
  const orgWalletData = await getOrgWalletData(orgId);
  const userWalletData = await getUserWalletData(userId);
  const totalPayout = await getTotalPayoutByOrganizationId(orgId);

  // Process data (unchanged)
  const satoshiBalance = {
    user: userWalletData?.balanceSatoshis || 0,
    org: orgWalletData?.balanceSatoshis || 0,
  };

  const chores = userData.Chores || [];
  const { active, completed, recurring } = filterChores(chores);
  const choreLogs = userData.ChoreLog || [];

  const stats = {
    ...calculateStats(chores, choreLogs, role),
    choreLogs,
  };



  const upcomingChores = recurring.filter((chore) =>
    isTodayOrFuture(chore.dueDate)
  );


  const recentActivity = completed.slice(0, 4);



  // Structured data object
  const dashboardData = {
    user: {
      firstName: userData.firstName || '',
      level: userData.level || 0,
      xp: userData.xp || 0,
      role,
    },
    organization: userData.Organization,
    chores: { active, completed, recurring },
    stats,
    upcomingChores,
    recentActivity,
    satoshiBalance,
    totalPayout,
  };

  return (
    <DashboardProvider data={dashboardData}>
      <DashboardHomepage />
    </DashboardProvider>
  );
}