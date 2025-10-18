import React from 'react';
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { QuoteWithDetails } from './types';
import { formatCurrency } from './calculations';

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
  categoryContribution: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
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

interface QuotePDFProps {
  quote: QuoteWithDetails;
}

const QuotePDF: React.FC<QuotePDFProps> = ({ quote }) => {
  const groupedItems = quote.items.reduce((acc, item) => {
    const categoryName = item.product.category.name;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, typeof quote.items>);

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

export async function generateQuotePDF(quote: QuoteWithDetails): Promise<Blob> {
  const doc = <QuotePDF quote={quote} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  return blob;
}



