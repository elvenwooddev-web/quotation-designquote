'use client';

import { Quote } from '@/lib/types';

interface QuotationCardProps {
  quote: Quote;
}

export function QuotationCard({ quote }: QuotationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">{quote.title}</h4>
          <p className="text-xs text-gray-600 mt-1">#{quote.quoteNumber}</p>
          <div className="flex items-center mt-2 space-x-2">
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(quote.grandTotal)}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
              {quote.status}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Created {formatDate(quote.createdAt)}
          </p>
        </div>
        <div className="flex-shrink-0 ml-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
      </div>
    </div>
  );
}
