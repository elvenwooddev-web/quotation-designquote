'use client';

import { ProductCatalog } from '@/components/ProductCatalog/ProductCatalog';
import { QuoteDetails } from '@/components/QuoteBuilder/QuoteDetails';
import { DiscountModeTabs } from '@/components/QuoteBuilder/DiscountModeTabs';
import { QuotationItems } from '@/components/QuoteBuilder/QuotationItems';
import { Summary } from '@/components/QuoteBuilder/Summary';
import { QuoteActions } from '@/components/QuoteBuilder/QuoteActions';

export default function NewQuotePage() {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Left Sidebar - Product Catalog */}
      <ProductCatalog />

      {/* Main Content - Quote Builder */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold text-gray-900">Quote Builder Wizard</h1>
            <p className="text-gray-600 mt-1">Create professional quotations with ease</p>
          </div>

          {/* Quote Details */}
          <QuoteDetails />

          {/* Discount Mode Tabs */}
          <DiscountModeTabs />

          {/* Quotation Items */}
          <QuotationItems />

          {/* Summary and Actions */}
          <div className="space-y-4">
            <Summary />
            <QuoteActions />
          </div>
        </div>
      </div>
    </div>
  );
}
