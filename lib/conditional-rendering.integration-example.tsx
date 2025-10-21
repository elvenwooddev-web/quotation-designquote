/**
 * Integration Example: Conditional Rendering with PDF Template Engine
 *
 * This file demonstrates how to integrate the conditional rendering system
 * with the PDF template engine for dynamic element visibility.
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet } from '@react-pdf/renderer';
import { evaluateConditions, type ConditionContext } from './conditional-rendering';
import type { TemplateJSON, QuoteWithDetails, TemplateElement } from './types';

// ==========================================
// EXAMPLE 1: Filter Elements Before Rendering
// ==========================================

/**
 * Filters template elements based on their conditions
 * Returns only elements that should be visible
 */
export function getVisibleElements(
  template: TemplateJSON,
  context: ConditionContext
): TemplateElement[] {
  return template.elements.filter(element =>
    evaluateConditions(element.conditions, context)
  );
}

// ==========================================
// EXAMPLE 2: Conditional PDF Document
// ==========================================

interface PDFDocumentProps {
  template: TemplateJSON;
  quote: QuoteWithDetails;
  company?: {
    name?: string;
    email?: string;
    phone?: string;
    logo?: string;
  };
}

/**
 * PDF Document with conditional element rendering
 */
export const ConditionalPDFDocument: React.FC<PDFDocumentProps> = ({
  template,
  quote,
  company,
}) => {
  const context: ConditionContext = { quote, company };

  // Get only visible elements
  const visibleElements = getVisibleElements(template, context);

  return (
    <Document>
      <Page size={template.metadata.pageSize} style={styles.page}>
        {visibleElements.map(element => (
          <ElementRenderer
            key={element.id}
            element={element}
            quote={quote}
            company={company}
          />
        ))}
      </Page>
    </Document>
  );
};

// ==========================================
// EXAMPLE 3: Element Renderer with Conditional Logic
// ==========================================

interface ElementRendererProps {
  element: TemplateElement;
  quote: QuoteWithDetails;
  company?: any;
}

/**
 * Renders a single template element
 * This is a simplified example - real implementation would be more complex
 */
const ElementRenderer: React.FC<ElementRendererProps> = ({
  element,
  quote,
  company
}) => {
  const context: ConditionContext = { quote, company };

  // Double-check visibility (already filtered, but safe to verify)
  if (!evaluateConditions(element.conditions, context)) {
    return null;
  }

  // Render based on element type
  switch (element.type) {
    case 'header':
      return <HeaderElement element={element} quote={quote} />;

    case 'textBlock':
      return <TextBlockElement element={element} quote={quote} />;

    case 'table':
      return <TableElement element={element} quote={quote} />;

    case 'summaryBox':
      return <SummaryBoxElement element={element} quote={quote} />;

    case 'signature':
      return <SignatureElement element={element} quote={quote} />;

    case 'divider':
      return <DividerElement element={element} />;

    case 'spacer':
      return <SpacerElement element={element} />;

    default:
      return null;
  }
};

// ==========================================
// EXAMPLE 4: Conditional Template Preview
// ==========================================

interface TemplatePreviewProps {
  template: TemplateJSON;
  quote: QuoteWithDetails;
  company?: any;
}

/**
 * React component for template preview with conditional elements
 */
export const TemplatePreview: React.FC<TemplatePreviewProps> = ({
  template,
  quote,
  company,
}) => {
  const context: ConditionContext = { quote, company };

  return (
    <div className="template-preview">
      {template.elements.map(element => {
        const isVisible = evaluateConditions(element.conditions, context);

        return (
          <div
            key={element.id}
            className={`element-preview ${!isVisible ? 'hidden' : ''}`}
            style={{
              opacity: isVisible ? 1 : 0.3,
              border: isVisible ? '1px solid #ccc' : '1px dashed #ccc'
            }}
          >
            {/* Element preview content */}
            <div className="element-header">
              <span>{element.type}</span>
              {!isVisible && <span className="hidden-badge">Hidden</span>}
            </div>

            {/* Show condition summary */}
            {element.conditions && element.conditions.length > 0 && (
              <div className="conditions-summary">
                {element.conditions.map((condition, idx) => (
                  <div key={idx} className="condition">
                    {condition.field} {condition.operator} {JSON.stringify(condition.value)}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ==========================================
// EXAMPLE 5: Template with Conditional Elements
// ==========================================

/**
 * Example template with conditional elements
 */
export const exampleTemplateWithConditions: TemplateJSON = {
  metadata: {
    version: '1.0',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
  },
  theme: {
    colors: {
      primary: '#2563eb',
      secondary: '#60a5fa',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
    },
    fonts: {
      heading: { family: 'Helvetica', size: 24, weight: 700 },
      body: { family: 'Helvetica', size: 11, weight: 400 },
      small: { family: 'Helvetica', size: 9, weight: 400 },
    },
  },
  elements: [
    // Always visible header
    {
      id: 'header',
      type: 'header',
      order: 1,
      position: 'auto',
      size: { width: 'auto', height: 60 },
      properties: {
        title: 'QUOTATION',
        alignment: 'left',
      },
      // No conditions - always visible
    },

    // Draft watermark - only visible for drafts
    {
      id: 'draft-watermark',
      type: 'textBlock',
      order: 2,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: 'DRAFT',
        fontSize: 48,
        color: '#cccccc',
        alignment: 'center',
      },
      conditions: [
        { field: 'status', operator: 'equals', value: 'DRAFT' },
      ],
    },

    // Client details - only if client exists
    {
      id: 'client-details',
      type: 'textBlock',
      order: 3,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'CLIENT DETAILS',
        content: '{{clientName}}\n{{clientEmail}}',
      },
      conditions: [
        { field: 'client', operator: 'exists', value: null },
      ],
    },

    // Item table - always visible
    {
      id: 'item-table',
      type: 'table',
      order: 4,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        columns: [
          { key: 'description', label: 'Description', width: 50 },
          { key: 'quantity', label: 'Qty', width: 15 },
          { key: 'rate', label: 'Rate', width: 15 },
          { key: 'total', label: 'Total', width: 20 },
        ],
      },
    },

    // Discount row - only if discount > 0
    {
      id: 'discount-row',
      type: 'summaryRow',
      order: 5,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'Discount',
        value: '{{discount}}',
      },
      conditions: [
        { field: 'discount', operator: 'greater_than', value: 0 },
      ],
    },

    // Summary box - always visible
    {
      id: 'summary-box',
      type: 'summaryBox',
      order: 6,
      position: 'auto',
      size: { width: 250, height: 'auto' },
      properties: {
        showSubtotal: true,
        showTax: true,
        showGrandTotal: true,
      },
    },

    // Terms - only if policies exist
    {
      id: 'terms-section',
      type: 'textBlock',
      order: 7,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'Terms & Conditions',
        content: '{{policies}}',
      },
      conditions: [
        { field: 'policies', operator: 'exists', value: null },
      ],
    },

    // Signature - only for sent/accepted quotes
    {
      id: 'signature-block',
      type: 'signature',
      order: 8,
      position: 'auto',
      size: { width: 'auto', height: 80 },
      properties: {
        layout: 'dual',
        showDate: true,
      },
      conditions: [
        { field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] },
      ],
    },

    // Premium badge - only for high-value quotes
    {
      id: 'premium-badge',
      type: 'textBlock',
      order: 9,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: 'PREMIUM CLIENT',
        fontSize: 12,
        color: '#fbbf24',
      },
      conditions: [
        { field: 'grandTotal', operator: 'greater_than', value: 10000 },
        { field: 'status', operator: 'not_equals', value: 'DRAFT' },
      ],
    },
  ],
};

// ==========================================
// EXAMPLE 6: API Route Integration
// ==========================================

/**
 * Example API route handler for PDF generation with conditional rendering
 */
export async function generateQuotePDF(quoteId: string) {
  // 1. Fetch quote data
  const quote = await fetchQuoteWithDetails(quoteId);

  // 2. Fetch template
  const template = await fetchTemplate(quote.templateId || 'default');

  // 3. Fetch company info
  const company = await fetchCompanyInfo();

  // 4. Create context
  const context: ConditionContext = { quote, company };

  // 5. Filter visible elements
  const visibleElements = getVisibleElements(template, context);

  // 6. Generate PDF with only visible elements
  const pdf = await generatePDF({
    ...template,
    elements: visibleElements, // Only visible elements
  }, quote, company);

  return pdf;
}

// ==========================================
// HELPER COMPONENTS (Simplified Examples)
// ==========================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
});

// Simplified element components
const HeaderElement: React.FC<any> = ({ element, quote }) => (
  <View>
    <Text style={{ fontSize: element.properties.fontSize }}>
      {element.properties.title}
    </Text>
  </View>
);

const TextBlockElement: React.FC<any> = ({ element, quote }) => (
  <View>
    <Text>{element.properties.content}</Text>
  </View>
);

const TableElement: React.FC<any> = ({ element, quote }) => (
  <View>
    {/* Table rendering logic */}
  </View>
);

const SummaryBoxElement: React.FC<any> = ({ element, quote }) => (
  <View>
    {/* Summary box rendering logic */}
  </View>
);

const SignatureElement: React.FC<any> = ({ element, quote }) => (
  <View>
    {/* Signature rendering logic */}
  </View>
);

const DividerElement: React.FC<any> = ({ element }) => (
  <View style={{ borderBottom: '1px solid #ccc' }} />
);

const SpacerElement: React.FC<any> = ({ element }) => (
  <View style={{ height: element.size.height }} />
);

// ==========================================
// MOCK FUNCTIONS (Replace with real implementations)
// ==========================================

async function fetchQuoteWithDetails(quoteId: string): Promise<QuoteWithDetails> {
  // Implementation would fetch from database
  throw new Error('Not implemented');
}

async function fetchTemplate(templateId: string): Promise<TemplateJSON> {
  // Implementation would fetch from database
  throw new Error('Not implemented');
}

async function fetchCompanyInfo(): Promise<any> {
  // Implementation would fetch from database
  throw new Error('Not implemented');
}

async function generatePDF(template: TemplateJSON, quote: QuoteWithDetails, company: any): Promise<Blob> {
  // Implementation would generate PDF
  throw new Error('Not implemented');
}
