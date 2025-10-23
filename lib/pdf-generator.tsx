/**
 * PDF Generation Module for Intelli-Quoter
 * Simplified version without template engine
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font
} from '@react-pdf/renderer';
import { QuoteWithDetails } from './types';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.0/files/inter-latin-400-normal.woff' },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.0/files/inter-latin-500-normal.woff', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.0/files/inter-latin-600-normal.woff', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/npm/@fontsource/inter@4.5.0/files/inter-latin-700-normal.woff', fontWeight: 700 },
  ]
});

// Define styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Inter',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #1e40af',
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 10,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: '#6b7280',
    width: '40%',
  },
  value: {
    fontSize: 10,
    color: '#111827',
    width: '60%',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottom: '1 solid #e5e7eb',
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: 600,
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: '1 solid #e5e7eb',
  },
  tableCell: {
    fontSize: 9,
    color: '#111827',
  },
  totalsSection: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: '1 solid #e5e7eb',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    color: '#6b7280',
  },
  totalValue: {
    fontSize: 10,
    color: '#111827',
    fontWeight: 500,
  },
  grandTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: '2 solid #1e40af',
  },
  grandTotalLabel: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e40af',
  },
  grandTotalValue: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1e40af',
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1 solid #e5e7eb',
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
});

/**
 * Simple PDF Document Component
 */
interface SimplePDFProps {
  quote: QuoteWithDetails;
}

const SimplePDF: React.FC<SimplePDFProps> = ({ quote }) => {
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quotation</Text>
          <Text style={styles.subtitle}>Quote # {quote.quoteNumber}</Text>
        </View>

        {/* Quote Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quote Details</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Title:</Text>
            <Text style={styles.value}>{quote.title}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.value}>{formatDate(quote.createdAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{quote.status}</Text>
          </View>
        </View>

        {/* Client Information */}
        {quote.client && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{quote.client.name}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{quote.client.email}</Text>
            </View>
            {quote.client.phone && (
              <View style={styles.row}>
                <Text style={styles.label}>Phone:</Text>
                <Text style={styles.value}>{quote.client.phone}</Text>
              </View>
            )}
            {quote.client.company && (
              <View style={styles.row}>
                <Text style={styles.label}>Company:</Text>
                <Text style={styles.value}>{quote.client.company}</Text>
              </View>
            )}
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          <Text style={styles.sectionTitle}>Quotation Items</Text>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '35%' }]}>Item</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Qty</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Rate</Text>
            <Text style={[styles.tableHeaderCell, { width: '15%' }]}>Discount</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Total</Text>
          </View>

          {/* Table Rows */}
          {quote.items.map((item, index) => (
            <View key={item.id} style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: '35%' }]}>
                {item.product.name}
              </Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>
                {formatCurrency(item.rate)}
              </Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>
                {item.discount}%
              </Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>
                {formatCurrency(item.lineTotal)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          {quote.discount > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(quote.discount)}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({quote.taxRate}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.tax)}</Text>
          </View>
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalLabel}>Grand Total:</Text>
            <Text style={styles.grandTotalValue}>{formatCurrency(quote.grandTotal)}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Thank you for your business!
          </Text>
        </View>
      </Page>
    </Document>
  );
};

/**
 * Generate PDF from quote data
 * @param quote Quote data with all details
 * @returns PDF as Blob
 */
export async function generateQuotePDF(
  quote: QuoteWithDetails
): Promise<Blob> {
  const doc = <SimplePDF quote={quote} />;
  const pdfInstance = pdf(doc);
  const blob = await pdfInstance.toBlob();
  return blob;
}