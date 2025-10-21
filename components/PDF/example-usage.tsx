/**
 * PDF Preview Components - Example Usage
 * Phase 5A: Live PDF Preview
 *
 * This file demonstrates how to use PDFPreview and PDFPreviewModal components
 * in various scenarios.
 */

'use client';

import React, { useState } from 'react';
import { PDFPreview, PDFPreviewModal } from '@/components/PDF';
import { QuoteWithDetails, PDFTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';

/**
 * Example 1: Basic PDF Preview
 * Shows inline PDF preview with default settings
 */
export function BasicPreviewExample({ quote }: { quote: QuoteWithDetails }) {
  return (
    <div className="w-full h-screen">
      <PDFPreview
        quote={quote}
        title="Quote Preview"
      />
    </div>
  );
}

/**
 * Example 2: PDF Preview with Custom Template
 * Shows how to use a custom template
 */
export function CustomTemplatePreviewExample({
  quote,
  template,
}: {
  quote: QuoteWithDetails;
  template: PDFTemplate;
}) {
  return (
    <div className="w-full h-screen">
      <PDFPreview
        quote={quote}
        template={template}
        title="Custom Template Preview"
      />
    </div>
  );
}

/**
 * Example 3: PDF Preview with Error Handling
 * Shows how to handle errors
 */
export function PreviewWithErrorHandlingExample({ quote }: { quote: QuoteWithDetails }) {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">Error: {error}</p>
        </div>
      )}

      <div className="w-full h-screen">
        <PDFPreview
          quote={quote}
          onError={(err) => setError(err.message)}
          title="PDF Preview with Error Handling"
        />
      </div>
    </div>
  );
}

/**
 * Example 4: PDF Preview without Controls
 * Shows preview without control buttons (view-only)
 */
export function ViewOnlyPreviewExample({ quote }: { quote: QuoteWithDetails }) {
  return (
    <div className="w-full h-screen">
      <PDFPreview
        quote={quote}
        showControls={false}
        title="View Only Preview"
      />
    </div>
  );
}

/**
 * Example 5: PDF Preview with Custom Zoom
 * Shows preview with custom default zoom
 */
export function CustomZoomPreviewExample({ quote }: { quote: QuoteWithDetails }) {
  return (
    <div className="w-full h-screen">
      <PDFPreview
        quote={quote}
        defaultZoom={125}
        title="PDF Preview (125% Zoom)"
      />
    </div>
  );
}

/**
 * Example 6: PDF Preview Modal
 * Shows how to use modal for preview
 */
export function ModalPreviewExample({ quote }: { quote: QuoteWithDetails }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Preview PDF
      </Button>

      <PDFPreviewModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        quote={quote}
        title="Quote PDF Preview"
      />
    </>
  );
}

/**
 * Example 7: Template Editor with Live Preview
 * Shows split-screen editor with live preview
 */
export function TemplateEditorWithPreviewExample({
  template,
  sampleQuote,
  onTemplateChange,
}: {
  template: PDFTemplate;
  sampleQuote: QuoteWithDetails;
  onTemplateChange: (template: PDFTemplate) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 h-screen">
      {/* Left: Template Editor */}
      <div className="overflow-auto p-4 bg-white border-r">
        <h2 className="text-xl font-bold mb-4">Template Editor</h2>
        {/* Your template editor form here */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Template Name</label>
            <input
              type="text"
              value={template.name}
              onChange={(e) =>
                onTemplateChange({ ...template, name: e.target.value })
              }
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          {/* More template editor fields... */}
        </div>
      </div>

      {/* Right: Live Preview */}
      <div className="sticky top-0 h-screen">
        <PDFPreview
          quote={sampleQuote}
          template={template}
          title="Live Preview"
          showControls={true}
        />
      </div>
    </div>
  );
}

/**
 * Example 8: Quote List with Preview Modal
 * Shows how to integrate preview in a quote list
 */
export function QuoteListWithPreviewExample({
  quotes,
}: {
  quotes: QuoteWithDetails[];
}) {
  const [selectedQuote, setSelectedQuote] = useState<QuoteWithDetails | null>(null);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Quote #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Client
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {quotes.map((quote) => (
              <tr key={quote.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {quote.quoteNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {quote.title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {quote.client?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  ₹ {quote.grandTotal.toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedQuote(quote)}
                  >
                    Preview
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedQuote && (
        <PDFPreviewModal
          open={!!selectedQuote}
          onClose={() => setSelectedQuote(null)}
          quote={selectedQuote}
          title={`Preview: ${selectedQuote.quoteNumber}`}
        />
      )}
    </>
  );
}

/**
 * Example 9: Quote Builder with Preview Button
 * Shows how to integrate in quote builder
 */
export function QuoteBuilderWithPreviewExample({
  quote,
  onChange,
}: {
  quote: QuoteWithDetails;
  onChange: (quote: QuoteWithDetails) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="space-y-4">
        {/* Quote Builder Form */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Quote Builder</h2>
          {/* Your quote builder form here */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Quote Title</label>
              <input
                type="text"
                value={quote.title}
                onChange={(e) => onChange({ ...quote, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            {/* More quote fields... */}
          </div>

          {/* Preview Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={() => setShowPreview(true)}>Preview PDF</Button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <PDFPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quote={quote}
        title="Quote Preview"
      />
    </>
  );
}

/**
 * Example 10: Template Selector with Preview
 * Shows how to preview different templates
 */
export function TemplateSelectorWithPreviewExample({
  templates,
  sampleQuote,
}: {
  templates: PDFTemplate[];
  sampleQuote: QuoteWithDetails;
}) {
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate>(templates[0]);
  const [showPreview, setShowPreview] = useState(false);

  return (
    <>
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Select Template</h2>

        <div className="grid grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedTemplate.id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              {template.thumbnail && (
                <img
                  src={template.thumbnail}
                  alt={template.name}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-semibold">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              )}
            </div>
          ))}
        </div>

        <Button onClick={() => setShowPreview(true)}>Preview Selected Template</Button>
      </div>

      <PDFPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quote={sampleQuote}
        template={selectedTemplate}
        title={`Preview: ${selectedTemplate.name}`}
      />
    </>
  );
}
