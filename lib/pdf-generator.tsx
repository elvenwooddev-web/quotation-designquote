/**
 * PDF Generator Module
 * Phase 4B: Template-Based PDF Renderer
 *
 * This module generates PDF documents from quotes using template-based rendering.
 * It supports both custom templates and a default fallback template.
 *
 * Key features:
 * - Template-based rendering using template-engine.ts
 * - Default template fallback for backward compatibility
 * - Theme application from template configuration
 * - Dynamic element rendering in specified order
 * - Support for all template element types
 */

import React from 'react';
import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import { QuoteWithDetails, PDFTemplate } from './types';
import { renderTemplateElement, RenderContext } from './template-engine';
import { DEFAULT_TEMPLATES } from './template-defaults';

/**
 * Create page styles from template metadata and theme
 */
function createPageStyles(template: PDFTemplate) {
  const { metadata, theme } = template.templateJson;

  return StyleSheet.create({
    page: {
      padding: metadata.margins.top, // Using top margin for all sides initially
      paddingTop: metadata.margins.top,
      paddingBottom: metadata.margins.bottom,
      paddingLeft: metadata.margins.left,
      paddingRight: metadata.margins.right,
      fontSize: theme.fonts.body.size,
      fontFamily: theme.fonts.body.family,
      color: theme.colors.textPrimary,
      backgroundColor: theme.colors.background,
    },
  });
}

/**
 * Get page dimensions based on page size and orientation
 */
function getPageDimensions(template: PDFTemplate): { width: number; height: number } {
  const { pageSize, orientation } = template.templateJson.metadata;

  // Page sizes in points (1 point = 1/72 inch)
  const sizes = {
    A4: { width: 595, height: 842 },
    Letter: { width: 612, height: 792 },
    Legal: { width: 612, height: 1008 },
  };

  const size = sizes[pageSize] || sizes.A4;

  if (orientation === 'landscape') {
    return { width: size.height, height: size.width };
  }

  return size;
}

/**
 * Template-based PDF Document Component
 * Renders all template elements in order
 */
interface TemplatePDFProps {
  quote: QuoteWithDetails;
  template: PDFTemplate;
}

const TemplatePDF: React.FC<TemplatePDFProps> = ({ quote, template }) => {
  const pageStyles = createPageStyles(template);
  const dimensions = getPageDimensions(template);

  // Create render context
  const context: RenderContext = {
    quote,
    theme: template.templateJson.theme,
    pageWidth: dimensions.width,
    pageHeight: dimensions.height,
  };

  // Sort elements by order
  const sortedElements = [...template.templateJson.elements].sort(
    (a, b) => a.order - b.order
  );

  // Render all elements
  const renderedElements = sortedElements
    .map(element => renderTemplateElement(element, quote, context))
    .filter(el => el !== null); // Remove null elements (conditional rendering)

  return (
    <Document>
      <Page
        size={template.templateJson.metadata.pageSize}
        orientation={template.templateJson.metadata.orientation}
        style={pageStyles.page}
      >
        {renderedElements}
      </Page>
    </Document>
  );
};

/**
 * Fallback PDF Component (Hard-coded layout)
 * Used when no template is provided for backward compatibility
 * This is the original hard-coded PDF layout
 */
interface FallbackPDFProps {
  quote: QuoteWithDetails;
}

const FallbackPDF: React.FC<FallbackPDFProps> = ({ quote }) => {
  // Import the original hard-coded styles and layout
  const styles = StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: 'Helvetica',
    },
    header: {
      marginBottom: 20,
      borderBottom: '2 solid #333',
      paddingBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    subtitle: {
      fontSize: 12,
      color: '#666',
    },
    section: {
      marginBottom: 15,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 8,
      color: '#333',
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
    },
    label: {
      fontWeight: 'bold',
    },
    table: {
      marginTop: 10,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: '#f0f0f0',
      padding: 8,
      fontWeight: 'bold',
      borderBottom: '1 solid #ccc',
    },
    tableRow: {
      flexDirection: 'row',
      padding: 8,
      borderBottom: '1 solid #eee',
    },
    col1: { width: '5%' },
    col2: { width: '30%' },
    col3: { width: '15%' },
    col4: { width: '15%' },
    col5: { width: '15%' },
    col6: { width: '20%', textAlign: 'right' },
    summary: {
      marginTop: 20,
      marginLeft: '60%',
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
      paddingHorizontal: 10,
    },
    summaryTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
      paddingTop: 10,
      paddingHorizontal: 10,
      borderTop: '2 solid #333',
      fontWeight: 'bold',
      fontSize: 12,
    },
    policies: {
      marginTop: 20,
      padding: 10,
      backgroundColor: '#f5f5f5',
    },
    policyItem: {
      marginBottom: 8,
    },
    policyTitle: {
      fontWeight: 'bold',
      marginBottom: 3,
    },
    footer: {
      position: 'absolute',
      bottom: 30,
      left: 40,
      right: 40,
      textAlign: 'center',
      fontSize: 8,
      color: '#999',
      borderTop: '1 solid #ddd',
      paddingTop: 10,
    },
  });

  // Group items by category
  const groupedItems = quote.items.reduce((acc, item) => {
    const categoryName = item.product.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, typeof quote.items>);

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return `₹ ${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>QUOTATION</Text>
          <Text style={styles.subtitle}>Quote #{quote.quoteNumber}</Text>
        </View>

        {/* Quote Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Quote Title:</Text>
            <Text>{quote.title}</Text>
          </View>
          {quote.client && (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Client:</Text>
                <Text>{quote.client.name}</Text>
              </View>
              {quote.client.email && (
                <View style={styles.row}>
                  <Text style={styles.label}>Email:</Text>
                  <Text>{quote.client.email}</Text>
                </View>
              )}
              {quote.client.phone && (
                <View style={styles.row}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text>{quote.client.phone}</Text>
                </View>
              )}
            </>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text>{new Date(quote.createdAt).toLocaleDateString('en-IN')}</Text>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quotation Items</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>#</Text>
              <Text style={styles.col2}>Item</Text>
              <Text style={styles.col3}>Quantity</Text>
              <Text style={styles.col4}>Rate</Text>
              <Text style={styles.col5}>Discount</Text>
              <Text style={styles.col6}>Total</Text>
            </View>

            {Object.entries(groupedItems).map(([category, items], catIndex) => (
              <View key={catIndex}>
                <View style={{ ...styles.tableRow, backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
                  <Text style={{ width: '100%' }}>{category}</Text>
                </View>
                {items.map((item, index) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={styles.col1}>{index + 1}</Text>
                    <Text style={styles.col2}>
                      {item.product.name}
                      {item.description && `\n${item.description}`}
                    </Text>
                    <Text style={styles.col3}>{item.quantity} {item.product.unit}</Text>
                    <Text style={styles.col4}>{formatCurrency(item.rate)}</Text>
                    <Text style={styles.col5}>{item.discount}%</Text>
                    <Text style={styles.col6}>{formatCurrency(item.lineTotal)}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>Subtotal:</Text>
            <Text>{formatCurrency(quote.subtotal)}</Text>
          </View>
          {quote.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text>Discount:</Text>
              <Text>- {formatCurrency(quote.discount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text>Tax (GST {quote.taxRate}%):</Text>
            <Text>{formatCurrency(quote.tax)}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text>Grand Total:</Text>
            <Text>{formatCurrency(quote.grandTotal)}</Text>
          </View>
        </View>

        {/* Terms & Conditions */}
        {quote.policies.length > 0 && (
          <View style={styles.policies}>
            <Text style={styles.sectionTitle}>Terms and Conditions</Text>
            {quote.policies
              .filter((p) => p.isActive)
              .sort((a, b) => a.order - b.order)
              .map((policy, index) => (
                <View key={policy.id} style={styles.policyItem}>
                  <Text style={styles.policyTitle}>
                    {index + 1}. {policy.title}
                  </Text>
                  <Text>{policy.description}</Text>
                </View>
              ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate PDF from quote and template
 *
 * @param quote - Complete quote data with items, client, and policies
 * @param template - Optional PDF template. If not provided, uses default template
 * @returns PDF as Blob
 */
export async function generateQuotePDF(
  quote: QuoteWithDetails,
  template?: PDFTemplate
): Promise<Blob> {
  let doc: React.ReactElement;

  if (template) {
    // Use template-based rendering
    doc = <TemplatePDF quote={quote} template={template} />;
  } else {
    // Use default template from template-defaults.ts
    const defaultTemplateConfig = DEFAULT_TEMPLATES.find(t => t.isDefault);

    if (defaultTemplateConfig) {
      // Create a PDFTemplate object from the default configuration
      const defaultTemplate: PDFTemplate = {
        id: 'default',
        name: defaultTemplateConfig.name,
        description: defaultTemplateConfig.description,
        category: defaultTemplateConfig.category,
        isDefault: true,
        isPublic: true,
        templateJson: defaultTemplateConfig.templateJson,
        thumbnail: null,
        createdBy: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        version: 1,
      };

      doc = <TemplatePDF quote={quote} template={defaultTemplate} />;
    } else {
      // Final fallback to hard-coded layout (for backward compatibility)
      console.warn('No default template found, using fallback hard-coded layout');
      doc = <FallbackPDF quote={quote} />;
    }
  }

  // Generate PDF blob
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  return blob;
}

/**
 * Legacy export for backward compatibility
 * @deprecated Use generateQuotePDF instead
 */
export { generateQuotePDF as default };
