'use client';

import { ProductCatalog } from '@/components/ProductCatalog/ProductCatalog';
import { QuoteDetails } from '@/components/QuoteBuilder/QuoteDetails';
import { DiscountModeTabs } from '@/components/QuoteBuilder/DiscountModeTabs';
import { QuotationItems } from '@/components/QuoteBuilder/QuotationItems';
import { Summary } from '@/components/QuoteBuilder/Summary';
import { PolicyBuilder } from '@/components/QuoteBuilder/PolicyBuilder';
import { TermsPreview } from '@/components/QuoteBuilder/TermsPreview';
import { QuoteActions } from '@/components/QuoteBuilder/QuoteActions';

export default function Home() {
  return (
    <div className="flex h-screen bg-white">
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

          {/* Summary and Policy Builder Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Summary */}
            <div className="space-y-4">
              <Summary />
              <QuoteActions />
            </div>

            {/* Right Column - Policy Builder */}
            <div className="space-y-4">
              <PolicyBuilder />
              <TermsPreview />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
