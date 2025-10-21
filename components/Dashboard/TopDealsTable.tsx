'use client';

interface TopDeal {
  id: string;
  dealName: string;
  salesperson: string;
  amount: number;
  closeDate: string;
}

interface TopDealsTableProps {
  data: TopDeal[];
  period?: string;
  className?: string;
}

export function TopDealsTable({ data, period = '30days', className = '' }: TopDealsTableProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case '7days': return 'Last 7 days';
      case '30days': return 'Last 30 days';
      case '90days': return 'Last 90 days';
      case '12months': return 'Last 12 months';
      case 'year': return 'This Year';
      default: return 'Last 30 days';
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Top Deals</h3>
        <span className="text-sm text-gray-600">{getPeriodLabel(period)}</span>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No deals found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Deal Name</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Salesperson</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Close Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((deal, index) => (
                <tr 
                  key={deal.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{deal.dealName}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{deal.salesperson}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {formatCurrency(deal.amount)}
                  </td>
                  <td className="py-3 px-4 text-right text-gray-600">
                    {formatDate(deal.closeDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
