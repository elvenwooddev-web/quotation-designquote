'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductCatalog } from '@/components/ProductCatalog/ProductCatalog';
import { QuoteDetails } from '@/components/QuoteBuilder/QuoteDetails';
import { DiscountModeTabs } from '@/components/QuoteBuilder/DiscountModeTabs';
import { QuotationItems } from '@/components/QuoteBuilder/QuotationItems';
import { Summary } from '@/components/QuoteBuilder/Summary';
import { TermsPreview } from '@/components/QuoteBuilder/TermsPreview';
import { QuoteActions } from '@/components/QuoteBuilder/QuoteActions';
import { useQuoteStore } from '@/lib/store';

export default function EditQuotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [quoteId, setQuoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadQuote = useQuoteStore((state) => state.loadQuote);

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

      // Load the quote into the store
      loadQuote(data);
      setError(null);
    } catch (err: any) {
      console.error('Error loading quote:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quote...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error}
          </h2>
          <button
            onClick={() => router.push('/quotations')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Quotations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Left Sidebar - Product Catalog */}
      <ProductCatalog />

      {/* Main Content - Quote Builder */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
            <p className="text-gray-600 mt-1">Update your quotation details</p>
          </div>

          {/* Quote Details */}
          <QuoteDetails />

          {/* Discount Mode Tabs */}
          <DiscountModeTabs />

          {/* Quotation Items */}
          <QuotationItems />

          {/* Summary and Terms Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Summary */}
            <div className="space-y-4">
              <Summary />
              <QuoteActions />
            </div>

            {/* Right Column - Terms Preview */}
            <div className="space-y-4">
              <TermsPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
