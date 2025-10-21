'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { MetricCard } from '@/components/Dashboard/MetricCard';
import { RevenueChart } from '@/components/Dashboard/RevenueChart';
import { LeadSourceChart } from '@/components/Dashboard/LeadSourceChart';
import { TopDealsTable } from '@/components/Dashboard/TopDealsTable';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Plus, Calendar } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  totalRevenue: number;
  salesGrowth: number;
  avgDealSize: number;
  conversionRate: number;
  revenueOverTime: Array<{ month: string; revenue: number }>;
  leadSourceBreakdown: Array<{ source: string; count: number; percentage: number }>;
  topDeals: Array<{ id: string; dealName: string; salesperson: string; amount: number; closeDate: string }>;
}

type TimePeriod = '7days' | '30days' | '90days' | '12months' | 'year';

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30days');

  useEffect(() => {
    fetchDashboardData();
  }, [user, timePeriod]);

  const fetchDashboardData = async () => {
    try {
      // Only show full page loading on initial load
      if (dashboardData === null) {
        setLoading(true);
      } else {
        // Show subtle loading for filter changes
        setIsRefreshing(true);
      }

      const params = new URLSearchParams();
      if (user?.role) params.append('role', user.role);
      if (user?.id) params.append('userId', user.id);
      params.append('period', timePeriod);

      const response = await fetch(`/api/dashboard?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const getTimePeriodLabel = (period: TimePeriod) => {
    switch (period) {
      case '7days': return 'Last 7 days';
      case '30days': return 'Last 30 days';
      case '90days': return 'Last 90 days';
      case '12months': return 'Last 12 months';
      case 'year': return 'This Year';
      default: return 'Last 30 days';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h2>
          <p className="text-gray-600">No dashboard data found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
              <p className="text-gray-600">Welcome back, {user?.name || 'User'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative inline-flex items-center">
                <Calendar className="absolute left-3 h-4 w-4 text-gray-500 pointer-events-none z-10" />
                <Select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
                  className="pl-9 pr-4 h-9 min-w-[160px] appearance-none cursor-pointer"
                >
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                  <option value="12months">Last 12 months</option>
                  <option value="year">This Year</option>
                </Select>
              </div>
              <Link href="/quotes/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Quotation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
          <MetricCard
            title="Total Revenue"
            value={dashboardData.totalRevenue}
            change={dashboardData.salesGrowth}
            trend={dashboardData.salesGrowth >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Sales Growth"
            value={dashboardData.salesGrowth}
            trend={dashboardData.salesGrowth >= 0 ? 'up' : 'down'}
          />
          <MetricCard
            title="Avg Deal Size"
            value={dashboardData.avgDealSize}
          />
          <MetricCard
            title="Conversion Rate"
            value={dashboardData.conversionRate}
          />
        </div>

        {/* Charts Row */}
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
          <div className="lg:col-span-2">
            <RevenueChart
              data={dashboardData.revenueOverTime}
              growth={dashboardData.salesGrowth}
              period={timePeriod}
            />
          </div>
          <div className="lg:col-span-1">
            <LeadSourceChart data={dashboardData.leadSourceBreakdown} />
          </div>
        </div>

        {/* Top Deals Table */}
        <div className={`grid grid-cols-1 transition-opacity duration-300 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}>
          <TopDealsTable data={dashboardData.topDeals} period={timePeriod} />
        </div>
      </div>
    </div>
  );
}
