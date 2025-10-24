import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Extract token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    // Create authenticated Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    const searchParams = request.nextUrl.searchParams;
    const userRole = searchParams.get('role') || 'Admin';
    const userId = searchParams.get('userId');
    const period = searchParams.get('period') || '30days';

    // Get all quotes with client information
    let quotesQuery = supabase
      .from('quotes')
      .select(`
        *,
        client:clients(*)
      `)
      .order('createdat', { ascending: false });

    // Apply role-based filtering
    if (userRole === 'Client' && userId) {
      quotesQuery = quotesQuery.eq('clientid', userId);
    }

    const { data: quotes, error: quotesError } = await quotesQuery;

    if (quotesError) {
      console.error('Quotes query error:', quotesError);
    }

    // Get pending approvals count
    const { count: pendingApprovalsCount, error: pendingCountError } = await supabase
      .from('quotes')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING_APPROVAL');

    if (pendingCountError) {
      console.error('Pending approvals count error:', pendingCountError);
    }

    // Get pending approvals list (top 10)
    const { data: pendingApprovalsList, error: pendingListError } = await supabase
      .from('quotes')
      .select(`
        id,
        quotenumber,
        title,
        grandtotal,
        createdat,
        client:clients(name)
      `)
      .eq('status', 'PENDING_APPROVAL')
      .order('createdat', { ascending: false })
      .limit(10);

    if (pendingListError) {
      console.error('Pending approvals list error:', pendingListError);
    }

    // Map pending approvals to camelCase format
    // Note: createdByName is set to 'System' until we add createdby column to quotes table
    const pendingApprovals = (pendingApprovalsList || []).map((quote: any) => ({
      id: quote.id,
      quoteNumber: quote.quotenumber,
      title: quote.title,
      grandTotal: quote.grandtotal,
      createdAt: quote.createdat,
      clientName: quote.client?.name || 'Unknown',
      createdByName: 'System' // TODO: Add createdby column to quotes table
    }));

    // Use only real data - no mock data fallback
    const dataToUse = quotes || [];

    if (!dataToUse || dataToUse.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        salesGrowth: 0,
        avgDealSize: 0,
        conversionRate: 0,
        revenueOverTime: [],
        leadSourceBreakdown: [],
        topDeals: [],
        pendingApprovalsCount: pendingApprovalsCount || 0,
        pendingApprovals
      });
    }

    // Calculate metrics
    const acceptedQuotes = dataToUse.filter(q => q.status === 'ACCEPTED');
    const totalRevenue = acceptedQuotes.reduce((sum, q) => sum + (q.grandTotal || 0), 0);

    // Calculate sales growth (current month vs previous month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthRevenue = acceptedQuotes
      .filter(q => {
        const quoteDate = new Date(q.createdat);
        return quoteDate.getMonth() === currentMonth && quoteDate.getFullYear() === currentYear;
      })
      .reduce((sum, q) => sum + (q.grandTotal || 0), 0);

    const previousMonthRevenue = acceptedQuotes
      .filter(q => {
        const quoteDate = new Date(q.createdat);
        return quoteDate.getMonth() === previousMonth && quoteDate.getFullYear() === previousYear;
      })
      .reduce((sum, q) => sum + (q.grandTotal || 0), 0);

    const salesGrowth = previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : currentMonthRevenue > 0 ? 100 : 0;

    const avgDealSize = acceptedQuotes.length > 0 ? totalRevenue / acceptedQuotes.length : 0;
    const conversionRate = dataToUse.length > 0 ? (acceptedQuotes.length / dataToUse.length) * 100 : 0;

    // Revenue over time - dynamic based on period
    const revenueOverTime = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDate = new Date();

    // Determine data points based on period
    let dataPoints = 6;
    let granularity: 'day' | 'week' | 'month' = 'month';

    switch (period) {
      case '7days':
        dataPoints = 7;
        granularity = 'day';
        break;
      case '30days':
        dataPoints = 30;
        granularity = 'day';
        break;
      case '90days':
        dataPoints = 90;
        granularity = 'day';
        break;
      case '12months':
      case 'year':
        dataPoints = 12;
        granularity = 'month';
        break;
      default:
        dataPoints = 6;
        granularity = 'month';
    }

    // Generate data based on granularity
    if (granularity === 'day') {
      for (let i = dataPoints - 1; i >= 0; i--) {
        const targetDate = new Date(currentDate);
        targetDate.setDate(currentDate.getDate() - i);

        const dayRevenue = acceptedQuotes
          .filter(q => {
            const quoteDate = new Date(q.createdat);
            return quoteDate.toDateString() === targetDate.toDateString();
          })
          .reduce((sum, q) => sum + (q.grandTotal || 0), 0);

        const label = dataPoints <= 7
          ? `${days[targetDate.getDay()]} ${targetDate.getDate()}`
          : `${targetDate.getDate()}`;

        revenueOverTime.push({
          month: label,
          revenue: dayRevenue,
          date: targetDate.toISOString().split('T')[0]
        });
      }
    } else {
      // Monthly granularity
      for (let i = dataPoints - 1; i >= 0; i--) {
        const targetDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        const monthRevenue = acceptedQuotes
          .filter(q => {
            const quoteDate = new Date(q.createdat);
            return quoteDate.getMonth() === targetDate.getMonth() &&
                   quoteDate.getFullYear() === targetDate.getFullYear();
          })
          .reduce((sum, q) => sum + (q.grandTotal || 0), 0);

        revenueOverTime.push({
          month: months[targetDate.getMonth()],
          revenue: monthRevenue,
          date: targetDate.toISOString().split('T')[0]
        });
      }
    }

    // Lead source breakdown
    const leadSources = ['Organic', 'Referral', 'Paid Ads', 'Other'];
    const leadSourceBreakdown = leadSources.map(source => {
      const count = dataToUse.filter(q => q.client?.source === source).length;
      const percentage = dataToUse.length > 0 ? (count / dataToUse.length) * 100 : 0;
      return { source, count, percentage };
    });

    // Top deals (top 5 by grandTotal)
    const topDeals = acceptedQuotes
      .sort((a, b) => (b.grandTotal || 0) - (a.grandTotal || 0))
      .slice(0, 5)
      .map(quote => ({
        id: quote.id,
        dealName: quote.title || 'Untitled Quote',
        salesperson: quote.client?.name || 'Unknown',
        amount: quote.grandTotal || 0,
        closeDate: new Date(quote.createdat).toISOString().split('T')[0]
      }));

    return NextResponse.json({
      totalRevenue,
      salesGrowth,
      avgDealSize,
      conversionRate,
      revenueOverTime,
      leadSourceBreakdown,
      topDeals,
      pendingApprovalsCount: pendingApprovalsCount || 0,
      pendingApprovals
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}