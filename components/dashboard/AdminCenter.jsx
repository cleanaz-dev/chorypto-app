'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bitcoin, Users2, Wallet } from 'lucide-react';
import { formatSatsWithCommas } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { useDashboard } from '@/lib/context/DashboardContext';

export default function AdminCenter() {
  const { organization, satoshiBalance, totalPayout } = useDashboard();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading if needed
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const totalDistributed = formatSatsWithCommas(totalPayout || 0);
  const orgWalletBalance = formatSatsWithCommas(satoshiBalance?.org || 0);

  if (isLoading || !organization) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-gray-800 border border-gray-700">
            <CardContent>
              <Skeleton className="h-6 w-24 bg-gray-700 mt-4" />
              <Skeleton className="h-8 w-32 bg-gray-700 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Total Distributed Card */}
      <Card className="bg-gray-800 border border-gray-700 hover:border-amber-500 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-gray-300">
            Total Distributed
          </CardTitle>
          <Bitcoin className="h-4 w-4 text-amber-500 group-hover:scale-125 transition-transform duration-300" />
        </CardHeader>
        <CardContent className="relative z-10">
          <span className="text-2xl font-bold text-amber-500">
            {totalDistributed} SATS
          </span>
        </CardContent>
      </Card>

      {/* Total Members Card */}
      <Card className="bg-gray-800 border border-gray-700 hover:border-indigo-500 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-gray-300">
            Total Members
          </CardTitle>
          <Users2 className="h-4 w-4 text-indigo-500 group-hover:scale-125 transition-transform duration-300" />
        </CardHeader>
        <CardContent className="relative z-10">
          <span className="text-2xl font-bold text-indigo-500">
            {organization.members?.length || 0}
          </span>
        </CardContent>
      </Card>

      {/* Wallet Balance Card */}
      <Card className="bg-gray-800 border border-gray-700 hover:border-emerald-500 transition-all duration-300 group relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
          <CardTitle className="text-sm font-medium text-gray-300">
            Org Wallet
          </CardTitle>
          <Wallet className="h-4 w-4 text-emerald-500 group-hover:scale-125 transition-transform duration-300" />
        </CardHeader>
        <CardContent className="relative z-10">
          <span className="text-2xl font-bold text-emerald-500">
            {orgWalletBalance} SATS
          </span>
        </CardContent>
      </Card>
    </div>
  );
}