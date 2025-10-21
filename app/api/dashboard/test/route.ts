import { NextRequest, NextResponse } from 'next/server';

// Force use of mock data for testing
function generateMockData(period: string = '30days') {
  const now = new Date();
  const mockQuotes = [];

  // Determine date range based on period
  let daysBack = 30;
  switch (period) {
    case '7days': daysBack = 7; break;
    case '30days': daysBack = 30; break;
    case '90days': daysBack = 90; break;
    case '12months': daysBack = 365; break;
    case 'year': daysBack = 365; break;
  }

  // Generate 50 mock quotes spread across the time period
  const statuses = ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED'];
  const clients = [
    { name: 'Acme Corp', source: 'Organic' },
    { name: 'Tech Solutions Inc', source: 'Referral' },
    { name: 'Global Enterprises', source: 'Paid Ads' },
    { name: 'StartUp Hub', source: 'Other' },
    { name: 'Enterprise Systems', source: 'Organic' },
    { name: 'Innovation Labs', source: 'Referral' },
  ];

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * daysBack);
    const quoteDate = new Date(now);
    quoteDate.setDate(quoteDate.getDate() - daysAgo);

    const client = clients[Math.floor(Math.random() * clients.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const grandTotal = Math.floor(Math.random() * 50000) + 5000;

    mockQuotes.push({
      id: `mock-${i}`,
      title: `Project ${i + 1}`,
      status,
      grandTotal,
      createdat: quoteDate.toISOString(),
      client: {
        name: client.name,
        source: client.source
      }
    });
  }

  return mockQuotes;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || '30days';

    // Always use mock data for testing
    const dataToUse = generateMockData(period);

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
      period,
      totalQuotes: dataToUse.length,
      acceptedQuotes: acceptedQuotes.length,
      totalRevenue,
      salesGrowth: Math.round(salesGrowth * 10) / 10,
      avgDealSize: Math.round(avgDealSize),
      conversionRate: Math.round(conversionRate * 10) / 10,
      revenueOverTime,
      leadSourceBreakdown,
      topDeals,
      debug: {
        currentMonthRevenue,
        previousMonthRevenue,
        statusBreakdown: {
          DRAFT: dataToUse.filter(q => q.status === 'DRAFT').length,
          SENT: dataToUse.filter(q => q.status === 'SENT').length,
          ACCEPTED: dataToUse.filter(q => q.status === 'ACCEPTED').length,
          REJECTED: dataToUse.filter(q => q.status === 'REJECTED').length,
        }
      }
    });

  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json(
      { error: 'Failed to generate test data' },
      { status: 500 }
    );
  }
}
