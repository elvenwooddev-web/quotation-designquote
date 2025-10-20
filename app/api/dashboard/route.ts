import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userRole = searchParams.get('role') || 'Admin';
    const userId = searchParams.get('userId');

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
      throw quotesError;
    }

    console.log('Quotes fetched:', quotes?.length || 0);

    if (!quotes || quotes.length === 0) {
      return NextResponse.json({
        totalRevenue: 0,
        salesGrowth: 0,
        avgDealSize: 0,
        conversionRate: 0,
        revenueOverTime: [],
        leadSourceBreakdown: [],
        topDeals: []
      });
    }

    // Calculate metrics
    const acceptedQuotes = quotes.filter(q => q.status === 'ACCEPTED');
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
      : 0;

    const avgDealSize = acceptedQuotes.length > 0 ? totalRevenue / acceptedQuotes.length : 0;
    const conversionRate = quotes.length > 0 ? (acceptedQuotes.length / quotes.length) * 100 : 0;

    // Revenue over time (last 6 months)
    const revenueOverTime = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentDate = new Date();

    for (let i = 5; i >= 0; i--) {
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
        revenue: monthRevenue
      });
    }

    // Lead source breakdown
    const leadSources = ['Organic', 'Referral', 'Paid Ads', 'Other'];
    const leadSourceBreakdown = leadSources.map(source => {
      const count = quotes.filter(q => q.client?.source === source).length;
      const percentage = quotes.length > 0 ? (count / quotes.length) * 100 : 0;
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
      topDeals
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}