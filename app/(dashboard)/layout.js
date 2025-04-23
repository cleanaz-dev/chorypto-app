//app/(dashboard)/layout.js 

import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { findRoleByUserId } from "@/lib/actions";
import { auth } from "@clerk/nextjs/server";

export default async function DashboardLayout({ children }) {
  const { userId } = await auth();
  const role = await findRoleByUserId(userId);
  return (
    <div className="flex h-screen flex-col bg-black text-white md:flex-row">
      {/* Sidebar for larger screens */}
      <aside className="hidden flex-shrink-0 border-r border-gray-800 bg-gray-950 lg:block">
        <DashboardNav role={role}/>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header with nav */}
        <header className="flex h-16 items-center justify-end border-b border-gray-800 bg-gray-950 px-4 lg:hidden">
          <DashboardNav mobile role={role}/>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-0.5 md:p-6 ">{children}</main>
      </div>
    </div>
  );
}