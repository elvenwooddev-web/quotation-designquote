'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, Edit, Trash2, CheckCircle, Send } from 'lucide-react';
import { hasPermission } from '@/lib/permissions';
import { useAuth } from '@/lib/auth-context';

interface QuoteItem {
  id: string;
  productId: string;
  description: string | null;
  quantity: number;
  rate: number;
  discount: number;
  lineTotal: number;
  product: {
    name: string;
    unit: string;
    category: {
      name: string;
    };
  };
}

interface Quote {
  id: string;
  quoteNumber: string;
  title: string;
  status: string;
  clientId: string | null;
  discountMode: string;
  overallDiscount: number;
  taxRate: number;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  version: number;
  isApproved: boolean;
  createdAt: string;
  client: {
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  items: QuoteItem[];
  policies: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    isActive: boolean;
  }>;
}

export default function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, permissions } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [approving, setApproving] = useState(false);

  // Permission checks
  const canEdit = permissions ? hasPermission(permissions, 'quotes', 'canedit') : false;
  const canDelete = permissions ? hasPermission(permissions, 'quotes', 'candelete') : false;
  const canApprove = permissions ? hasPermission(permissions, 'quotes', 'canapprove') : false;

  useEffect(() => {
    params.then((resolvedParams) => {
      setQuoteId(resolvedParams.id);
    });
  }, [params]);

  useEffect(() => {
    if (quoteId) {
      fetchQuote();
    }
  }, [quoteId]);

  const fetchQuote = async () => {
    if (!quoteId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/quotes/${quoteId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quote');
      }

      setQuote(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!quoteId) return;

    try {
      const response = await fetch(`/api/quotes/${quoteId}/pdf`);
      if (!response.ok) throw new Error('Failed to generate PDF');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quote-${quote?.quoteNumber || quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Failed to download PDF');
    }
  };

  const handleDelete = async () => {
    if (!canDelete || !quoteId) return;

    if (confirm('Are you sure you want to delete this quotation?')) {
      try {
        const response = await fetch(`/api/quotes/${quoteId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete quotation');
        }

        router.push('/quotations');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleApprove = async () => {
    if (!canApprove || !quoteId) return;

    setApproving(true);
    try {
      const response = await fetch(`/api/quotes/${quoteId}/approve`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve quote');
      }

      const updatedQuote = await response.json();
      setQuote(updatedQuote);
      alert('Quote approved successfully!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setApproving(false);
    }
  };

  const handleSendToClient = async () => {
    if (!quoteId) return;

    // Check if quote is approved (unless user is Admin with canDelete permission)
    if (!quote?.isApproved && !(canDelete)) {
      alert('Quote must be approved before sending to client.');
      return;
    }

    if (confirm('Send this quote to the client?')) {
      try {
        const response = await fetch(`/api/quotes/${quoteId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'SENT' }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to send quote');
        }

        await fetchQuote(); // Refresh quote data
        alert('Quote sent to client successfully!');
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'DRAFT':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '₹0.00';
    return `₹${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Quote not found'}
          </h2>
          <Button onClick={() => router.push('/quotations')}>
            Back to Quotations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.push('/quotations')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {quote.quoteNumber}
                  {quote.version && quote.version > 1 && (
                    <span className="text-sm text-gray-500 ml-2">v{quote.version}</span>
                  )}
                </h1>
                <p className="text-gray-600 mt-1">{quote.title}</p>
              </div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  quote.status
                )}`}
              >
                {quote.status}
              </span>
              {quote.isApproved ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                  Pending Approval
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              {canApprove && !quote.isApproved && (
                <Button
                  onClick={handleApprove}
                  disabled={approving}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {approving ? 'Approving...' : 'Approve Quote'}
                </Button>
              )}
              {(quote.isApproved || canDelete) && quote.status === 'DRAFT' && (
                <Button variant="outline" onClick={handleSendToClient}>
                  <Send className="h-4 w-4 mr-2" />
                  Send to Client
                </Button>
              )}
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={() => router.push(`/quotes/edit/${quoteId}`)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              {canDelete && (
                <Button variant="outline" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quote Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Client Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Client Information
            </h2>
            {quote.client ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium text-gray-600">Name</p>
                  <p className="text-sm text-gray-900">{quote.client.name}</p>
                </div>
                {quote.client.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-sm text-gray-900">{quote.client.email}</p>
                  </div>
                )}
                {quote.client.phone && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Phone</p>
                    <p className="text-sm text-gray-900">{quote.client.phone}</p>
                  </div>
                )}
                {quote.client.address && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Address</p>
                    <p className="text-sm text-gray-900">{quote.client.address}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No client assigned</p>
            )}
          </div>

          {/* Quote Metadata */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quote Details
            </h2>
            <div className="space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-600">Created On</p>
                <p className="text-sm text-gray-900">{formatDate(quote.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Discount Mode</p>
                <p className="text-sm text-gray-900">{quote.discountMode}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Tax Rate</p>
                <p className="text-sm text-gray-900">{quote.taxRate}%</p>
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Financial Summary
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-600">Subtotal</p>
                <p className="text-sm text-gray-900">{formatCurrency(quote.subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-600">Discount</p>
                <p className="text-sm text-gray-900">
                  {formatCurrency(quote.discount)}
                </p>
              </div>
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-600">Tax</p>
                <p className="text-sm text-gray-900">{formatCurrency(quote.tax)}</p>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-200">
                <p className="text-base font-semibold text-gray-900">Grand Total</p>
                <p className="text-base font-bold text-blue-600">
                  {formatCurrency(quote.grandTotal)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quote Items */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quote Items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.product.name}
                      </div>
                      {item.description && (
                        <div className="text-sm text-gray-500">{item.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.product.category.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {item.quantity} {item.product.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {formatCurrency(item.rate)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 text-right">
                      {item.discount}%
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                      {formatCurrency(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Policies/Terms */}
        {quote.policies && quote.policies.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Terms & Conditions
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {quote.policies
                .filter((p) => p.isActive)
                .map((policy) => (
                  <div key={policy.id}>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {policy.title}
                    </h3>
                    <p className="text-sm text-gray-600">{policy.description}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
