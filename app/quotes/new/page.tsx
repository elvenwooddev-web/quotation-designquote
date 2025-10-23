'use client';

import React, { useState } from 'react';
import { ProductCatalog } from '@/components/ProductCatalog/ProductCatalog';
import { QuoteDetails } from '@/components/QuoteBuilder/QuoteDetails';
import { DiscountModeTabs } from '@/components/QuoteBuilder/DiscountModeTabs';
import { QuotationItems } from '@/components/QuoteBuilder/QuotationItems';
import { Summary } from '@/components/QuoteBuilder/Summary';
import { QuoteActions } from '@/components/QuoteBuilder/QuoteActions';
import { QuotePreview } from '@/components/QuoteBuilder/QuotePreview';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, FileText, Maximize2, Minimize2 } from 'lucide-react';

export default function NewQuotePage() {
  const [showPreview, setShowPreview] = useState(true);
  const [previewMode, setPreviewMode] = useState<'side' | 'fullscreen'>('side');

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const toggleFullscreen = () => {
    setPreviewMode(previewMode === 'side' ? 'fullscreen' : 'side');
  };

  // Fullscreen preview modal
  if (showPreview && previewMode === 'fullscreen') {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="h-full flex flex-col">
          {/* Fullscreen Preview Header */}
          <div className="border-b bg-gray-50 px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Quote Preview</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFullscreen}
                className="flex items-center gap-2"
              >
                <Minimize2 className="h-4 w-4" />
                Exit Fullscreen
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className="flex items-center gap-2"
              >
                <EyeOff className="h-4 w-4" />
                Close Preview
              </Button>
            </div>
          </div>
          {/* Fullscreen Preview Content */}
          <div className="flex-1 overflow-hidden bg-gray-100 p-8">
            <div className="h-full max-w-4xl mx-auto">
              <QuotePreview />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white">
      {/* Left Sidebar - Product Catalog */}
      <ProductCatalog />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Quote Builder Section */}
        <div className={`${showPreview && previewMode === 'side' ? 'w-1/2' : 'flex-1'} overflow-y-auto border-r`}>
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header with Preview Toggle */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Quote Builder Wizard</h1>
                  <p className="text-gray-600 mt-1">Create professional quotations with ease</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={showPreview ? 'default' : 'outline'}
                    size="sm"
                    onClick={togglePreview}
                    className="flex items-center gap-2"
                  >
                    {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </Button>
                  {showPreview && previewMode === 'side' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleFullscreen}
                      className="flex items-center gap-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Fullscreen
                    </Button>
                  )}
                </div>
              </div>
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

        {/* Preview Section - Side by Side */}
        {showPreview && previewMode === 'side' && (
          <div className="w-1/2 bg-gray-50 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Preview Header */}
              <div className="bg-white border-b px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Live Preview</h2>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Updates automatically
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
              {/* Preview Content */}
              <div className="flex-1 p-6 overflow-hidden">
                <QuotePreview />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}