/**
 * Template Engine for PDF Generation
 * Phase 4B: Template-Based PDF Renderer
 *
 * This module handles the rendering of PDF templates by converting template elements
 * into React-PDF components. It processes each element type and applies theme styling,
 * variable interpolation, and conditional rendering.
 */

import React from 'react';
import { View, Text, Image, StyleSheet, Svg, Path, Circle, Rect } from '@react-pdf/renderer';
import {
  TemplateElement,
  TemplateTheme,
  QuoteWithDetails,
  QRCodeProperties,
  ChartProperties
} from './types';
import { formatCurrency } from './calculations';
import QRCode from 'qrcode';

/**
 * Helper function to safely omit border when width is 0
 * react-pdf doesn't accept 'none' as a border value
 */
function omitBorderIf(condition: boolean): { border?: string } {
  return condition ? {} : { border: undefined };
}

/**
 * Context object passed to element renderers containing quote data and theme
 */
export interface RenderContext {
  quote: QuoteWithDetails;
  theme: TemplateTheme;
  pageWidth?: number;
  pageHeight?: number;
}

/**
 * Variable interpolation utility - replaces {{variable}} placeholders with actual values
 *
 * Supported variables:
 * - {{quoteNumber}} - Quote number
 * - {{date}} - Quote creation date
 * - {{validUntil}} - Quote expiry date (30 days from creation)
 * - {{status}} - Quote status
 * - {{clientName}} - Client name
 * - {{clientEmail}} - Client email
 * - {{clientPhone}} - Client phone
 * - {{clientAddress}} - Client address
 * - {{companyName}} - Company name (placeholder)
 * - {{salesperson}} - Salesperson (placeholder)
 * - {{policies}} - Terms and conditions
 * - {{subtotal}} - Subtotal amount
 * - {{discount}} - Discount amount
 * - {{tax}} - Tax amount
 * - {{grandTotal}} - Grand total amount
 */
function interpolateVariables(text: string, context: RenderContext): string {
  const { quote } = context;

  // Calculate valid until date (30 days from creation)
  const validUntilDate = new Date(quote.createdAt);
  validUntilDate.setDate(validUntilDate.getDate() + 30);

  const variables: Record<string, string> = {
    quoteNumber: quote.quoteNumber || 'DRAFT',
    date: new Date(quote.createdAt).toLocaleDateString('en-IN'),
    validUntil: validUntilDate.toLocaleDateString('en-IN'),
    status: quote.status,
    clientName: quote.client?.name || 'N/A',
    clientEmail: quote.client?.email || '',
    clientPhone: quote.client?.phone || '',
    clientAddress: quote.client?.address || '',
    companyName: 'Your Company', // TODO: Load from settings
    salesperson: 'Sales Team', // TODO: Load from user/settings
    policies: quote.policies
      .filter(p => p.isActive)
      .sort((a, b) => a.order - b.order)
      .map((p, i) => `${i + 1}. ${p.title}: ${p.description}`)
      .join('\n'),
    subtotal: formatCurrency(quote.subtotal),
    discount: formatCurrency(quote.discount),
    tax: formatCurrency(quote.tax),
    grandTotal: formatCurrency(quote.grandTotal),
  };

  let result = text;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });

  return result;
}

/**
 * Evaluate conditional rendering rules for an element
 * Returns true if element should be rendered, false otherwise
 */
function evaluateConditions(
  element: TemplateElement,
  context: RenderContext
): boolean {
  if (!element.conditions || element.conditions.length === 0) {
    return true; // No conditions, always render
  }

  // All conditions must be true (AND logic)
  return element.conditions.every(condition => {
    const { quote } = context;
    let fieldValue: any;

    // Get field value from quote
    switch (condition.field) {
      case 'status':
        fieldValue = quote.status;
        break;
      case 'total':
        fieldValue = quote.grandTotal;
        break;
      case 'hasClient':
        fieldValue = !!quote.client;
        break;
      case 'itemCount':
        fieldValue = quote.items.length;
        break;
      default:
        fieldValue = null;
    }

    // Evaluate operator
    switch (condition.operator) {
      case '==':
        return fieldValue == condition.value;
      case '!=':
        return fieldValue != condition.value;
      case '>':
        return fieldValue > condition.value;
      case '<':
        return fieldValue < condition.value;
      case '>=':
        return fieldValue >= condition.value;
      case '<=':
        return fieldValue <= condition.value;
      case 'contains':
        return String(fieldValue).includes(String(condition.value));
      default:
        return true;
    }
  });
}

/**
 * Render header element - styled text header with optional logo
 */
function renderHeader(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const props = element.properties;

  const styles = StyleSheet.create({
    container: {
      flexDirection: props.logoPosition === 'inline-right' ? 'row' : 'column',
      justifyContent: 'space-between',
      alignItems: props.alignment === 'center' ? 'center' :
                 props.alignment === 'right' ? 'flex-end' : 'flex-start',
      backgroundColor: props.backgroundColor || 'transparent',
      padding: props.padding || 0,
      ...(props.borderBottom ? { borderBottom: `${props.borderWidth || 1} solid ${props.borderColor || '#000'}` } : {}),
      marginBottom: props.marginBottom || 0,
      height: element.size.height === 'auto' ? undefined : element.size.height,
    },
    title: {
      fontSize: props.fontSize || context.theme.fonts.heading.size,
      fontWeight: props.fontWeight || context.theme.fonts.heading.weight,
      color: props.color || context.theme.colors.primary,
      fontFamily: props.fontFamily || context.theme.fonts.heading.family,
      letterSpacing: props.letterSpacing || 0,
      textTransform: props.textTransform || 'none',
    },
    logo: {
      maxHeight: props.logoMaxHeight || 50,
      maxWidth: props.logoMaxWidth || 200,
    },
  });

  return React.createElement(View, { style: styles.container, key: element.id },
    React.createElement(Text, { style: styles.title }, props.title)
    // TODO: Add logo support when logo URL is available
  );
}

/**
 * Render logo element - image component
 */
function renderLogo(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement | null {
  const props = element.properties;

  // TODO: Load logo URL from settings
  const logoUrl = null;

  if (!logoUrl) {
    return null; // Don't render if no logo
  }

  const styles = StyleSheet.create({
    container: {
      alignItems: props.alignment === 'center' ? 'center' :
                  props.alignment === 'right' ? 'flex-end' : 'flex-start',
      marginTop: props.marginTop || 0,
      marginBottom: props.marginBottom || 0,
    },
    image: {
      maxHeight: props.maxHeight || 60,
      maxWidth: props.maxWidth || 200,
    },
  });

  return React.createElement(View, { style: styles.container, key: element.id },
    React.createElement(Image, { style: styles.image, src: logoUrl })
  );
}

/**
 * Render text block element - formatted text with optional label
 */
function renderTextBlock(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const props = element.properties;
  const interpolatedContent = interpolateVariables(props.content || '', context);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: props.backgroundColor || 'transparent',
      padding: props.padding || 0,
      marginTop: props.marginTop || 0,
      marginBottom: props.marginBottom || 0,
      ...(props.showBorder ? { border: `${props.borderWidth || 1} solid ${props.borderColor || '#ccc'}` } : {}),
    },
    label: {
      fontSize: props.labelFontSize || 12,
      fontWeight: props.labelFontWeight || 600,
      color: props.labelColor || context.theme.colors.textPrimary,
      backgroundColor: props.labelBackgroundColor || 'transparent',
      padding: props.labelPadding || 0,
      marginBottom: 5,
    },
    content: {
      fontSize: props.fontSize || context.theme.fonts.body.size,
      fontWeight: props.fontWeight || context.theme.fonts.body.weight,
      color: props.color || context.theme.colors.textPrimary,
      textAlign: props.alignment || 'left',
      lineHeight: props.lineHeight || 1.3,
      letterSpacing: props.letterSpacing || 0,
      textTransform: props.textTransform || 'none',
    },
  });

  return React.createElement(View, { style: styles.container, key: element.id },
    props.label && React.createElement(Text, { style: styles.label }, props.label),
    React.createElement(Text, { style: styles.content }, interpolatedContent)
  );
}

/**
 * Render client details element - formatted client information block
 */
function renderClientDetails(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement | null {
  const { quote } = context;

  if (!quote.client) {
    return null; // Don't render if no client
  }

  const props = element.properties;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: props.backgroundColor || 'transparent',
      padding: props.padding || 10,
      marginBottom: props.marginBottom || 20,
      ...(props.showBorder ? { border: `${props.borderWidth || 1} solid ${props.borderColor || '#ccc'}` } : {}),
    },
    label: {
      fontSize: props.labelFontSize || 12,
      fontWeight: props.labelFontWeight || 600,
      color: props.labelColor || context.theme.colors.textPrimary,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 4,
    },
    fieldLabel: {
      fontSize: props.fontSize || 10,
      fontWeight: 600,
      color: props.color || context.theme.colors.textPrimary,
      width: 80,
    },
    fieldValue: {
      fontSize: props.fontSize || 10,
      fontWeight: 400,
      color: props.color || context.theme.colors.textPrimary,
      flex: 1,
    },
  });

  return React.createElement(View, { style: styles.container, key: element.id },
    props.label && React.createElement(Text, { style: styles.label }, props.label),
    React.createElement(View, { style: styles.row },
      React.createElement(Text, { style: styles.fieldLabel }, 'Name:'),
      React.createElement(Text, { style: styles.fieldValue }, quote.client.name)
    ),
    quote.client.email && React.createElement(View, { style: styles.row },
      React.createElement(Text, { style: styles.fieldLabel }, 'Email:'),
      React.createElement(Text, { style: styles.fieldValue }, quote.client.email)
    ),
    quote.client.phone && React.createElement(View, { style: styles.row },
      React.createElement(Text, { style: styles.fieldLabel }, 'Phone:'),
      React.createElement(Text, { style: styles.fieldValue }, quote.client.phone)
    ),
    quote.client.address && React.createElement(View, { style: styles.row },
      React.createElement(Text, { style: styles.fieldLabel }, 'Address:'),
      React.createElement(Text, { style: styles.fieldValue }, quote.client.address)
    )
  );
}

/**
 * Render item table element - complete quote items table with headers and rows
 */
function renderItemTable(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const { quote } = context;
  const props = element.properties;

  const styles = StyleSheet.create({
    table: {
      marginTop: props.marginTop || 10,
      marginBottom: props.marginBottom || 10,
    },
    header: {
      flexDirection: 'row',
      backgroundColor: props.headerBackgroundColor || '#f0f0f0',
      padding: props.cellPadding || 8,
      ...(props.showBorders ? { borderBottom: `${props.borderWidth || 1} solid ${props.borderColor || '#ccc'}` } : {}),
    },
    headerCell: {
      fontSize: props.headerFontSize || props.fontSize || 10,
      fontWeight: props.headerFontWeight || 700,
      color: props.headerTextColor || context.theme.colors.textPrimary,
    },
    row: {
      flexDirection: 'row',
      padding: props.cellPadding || 8,
      ...(props.showBorders ? { borderBottom: `${props.borderWidth || 1} solid ${props.borderColor || '#eee'}` } : {}),
    },
    alternateRow: {
      backgroundColor: props.alternateRowColor || 'transparent',
    },
    categoryRow: {
      flexDirection: 'row',
      backgroundColor: props.categoryGroupStyle?.backgroundColor || '#f9f9f9',
      padding: props.categoryGroupStyle?.padding || 6,
      fontWeight: props.categoryGroupStyle?.fontWeight || 600,
    },
    cell: {
      fontSize: props.fontSize || 10,
      color: props.rowTextColor || context.theme.colors.textPrimary,
    },
  });

  // Group items by category if enabled
  const groupedItems = props.showCategoryGroups
    ? quote.items.reduce((acc, item) => {
        const categoryName = item.product.category.name;
        if (!acc[categoryName]) {
          acc[categoryName] = [];
        }
        acc[categoryName].push(item);
        return acc;
      }, {} as Record<string, typeof quote.items>)
    : { 'All Items': quote.items };

  // Get column definitions from properties
  const columns = props.columns || [
    { key: 'description', label: 'Description', width: 40, alignment: 'left' },
    { key: 'quantity', label: 'Qty', width: 15, alignment: 'center' },
    { key: 'rate', label: 'Rate', width: 15, alignment: 'right' },
    { key: 'discount', label: 'Discount', width: 15, alignment: 'right' },
    { key: 'total', label: 'Total', width: 15, alignment: 'right' },
  ];

  return React.createElement(View, { style: styles.table, key: element.id },
    // Table header
    React.createElement(View, { style: styles.header },
      ...columns.map((col, idx) =>
        React.createElement(Text, {
          key: `header-${idx}`,
          style: {
            ...styles.headerCell,
            width: `${col.width}%`,
            textAlign: col.alignment || 'left',
          }
        }, col.label)
      )
    ),

    // Table rows
    ...Object.entries(groupedItems).flatMap(([categoryName, items], catIndex) => {
      const rows = [];

      // Category header (if grouping enabled)
      if (props.showCategoryGroups && categoryName !== 'All Items') {
        rows.push(
          React.createElement(View, { key: `cat-${catIndex}`, style: styles.categoryRow },
            React.createElement(Text, { style: { width: '100%' } }, categoryName)
          )
        );
      }

      // Item rows
      items.forEach((item, itemIndex) => {
        const isAlternate = itemIndex % 2 === 1;
        const rowStyle = isAlternate
          ? { ...styles.row, ...styles.alternateRow }
          : styles.row;

        rows.push(
          React.createElement(View, { key: `item-${item.id}`, style: rowStyle },
            ...columns.map((col, colIdx) => {
              let value = '';

              switch (col.key) {
                case 'item':
                  value = String(itemIndex + 1);
                  break;
                case 'description':
                  value = item.product.name + (item.description ? `\n${item.description}` : '');
                  break;
                case 'category':
                  value = item.product.category.name;
                  break;
                case 'quantity':
                  value = `${item.quantity} ${item.product.unit}`;
                  break;
                case 'rate':
                  value = formatCurrency(item.rate);
                  break;
                case 'discount':
                  value = `${item.discount}%`;
                  break;
                case 'total':
                  value = formatCurrency(item.lineTotal);
                  break;
              }

              return React.createElement(Text, {
                key: `cell-${colIdx}`,
                style: {
                  ...styles.cell,
                  width: `${col.width}%`,
                  textAlign: col.alignment || 'left',
                }
              }, value);
            })
          )
        );
      });

      return rows;
    })
  );
}

/**
 * Render summary box element - totals summary with calculations
 */
function renderSummaryBox(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const { quote } = context;
  const props = element.properties;

  const styles = StyleSheet.create({
    container: {
      width: element.size.width === 'auto' ? '100%' : element.size.width,
      alignSelf: props.alignment === 'right' ? 'flex-end' :
                 props.alignment === 'center' ? 'center' : 'flex-start',
      backgroundColor: props.backgroundColor || 'transparent',
      ...(props.borderWidth && props.borderWidth > 0 ? { border: `${props.borderWidth} solid ${props.borderColor || '#ccc'}` } : {}),
      padding: props.padding || 15,
      marginTop: props.marginTop || 20,
      marginBottom: props.marginBottom || 20,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: props.rowSpacing || 5,
    },
    label: {
      fontSize: props.fontSize || 10,
      fontWeight: props.labelFontWeight || 500,
      color: props.labelColor || context.theme.colors.textPrimary,
    },
    value: {
      fontSize: props.fontSize || 10,
      fontWeight: props.valueFontWeight || 600,
      color: props.valueColor || context.theme.colors.textPrimary,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: props.grandTotalPaddingTop || 10,
      paddingTop: props.grandTotalPaddingTop || 10,
      ...(props.grandTotalTopBorder ? { borderTop: `${props.grandTotalTopBorderWidth || 2} solid ${props.grandTotalTopBorderColor || '#333'}` } : {}),
      backgroundColor: props.grandTotalBackgroundColor || 'transparent',
      padding: props.grandTotalPadding || 0,
    },
    totalLabel: {
      fontSize: props.grandTotalFontSize || 12,
      fontWeight: props.grandTotalFontWeight || 700,
      color: props.grandTotalColor || context.theme.colors.primary,
    },
    totalValue: {
      fontSize: props.grandTotalFontSize || 12,
      fontWeight: props.grandTotalFontWeight || 700,
      color: props.grandTotalColor || context.theme.colors.primary,
    },
  });

  return React.createElement(View, { style: styles.container, key: element.id },
    // Subtotal
    props.showSubtotal && React.createElement(View, { style: styles.row },
      React.createElement(Text, { style: styles.label }, 'Subtotal:'),
      React.createElement(Text, { style: styles.value }, formatCurrency(quote.subtotal))
    ),

    // Discount
    props.showDiscount && quote.discount > 0 && React.createElement(View, { style: styles.row },
      React.createElement(Text, { style: styles.label }, 'Discount:'),
      React.createElement(Text, { style: styles.value }, `- ${formatCurrency(quote.discount)}`)
    ),

    // Tax
    props.showTax && React.createElement(View, { style: styles.row },
      React.createElement(Text, { style: styles.label }, `Tax (${quote.taxRate}%):`),
      React.createElement(Text, { style: styles.value }, formatCurrency(quote.tax))
    ),

    // Grand Total
    props.showGrandTotal && React.createElement(View, { style: styles.totalRow },
      React.createElement(Text, { style: styles.totalLabel }, 'Grand Total:'),
      React.createElement(Text, { style: styles.totalValue }, formatCurrency(quote.grandTotal))
    )
  );
}

/**
 * Render signature block element - signature lines with labels
 */
function renderSignature(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const props = element.properties;

  const styles = StyleSheet.create({
    container: {
      marginTop: props.marginTop || 40,
      backgroundColor: props.backgroundColor || 'transparent',
      padding: props.padding || 0,
      ...(props.borderWidth && props.borderWidth > 0 ? { border: `${props.borderWidth} solid ${props.borderColor || '#ccc'}` } : {}),
    },
    dualLayout: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    signatureBlock: {
      width: props.layout === 'dual' ? '45%' : '100%',
    },
    line: {
      borderTop: `${props.lineWidth || 1} solid ${props.lineColor || '#000'}`,
      marginBottom: 5,
      marginTop: 60,
    },
    label: {
      fontSize: props.fontSize || 9,
      fontWeight: props.fontWeight || 400,
      color: props.textColor || context.theme.colors.textSecondary,
      textAlign: 'center',
    },
    date: {
      fontSize: props.fontSize || 9,
      fontWeight: props.fontWeight || 400,
      color: props.textColor || context.theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 3,
    },
  });

  const customerLabel = props.labels?.customer || 'Customer Signature';
  const companyLabel = props.labels?.company || 'Company Representative';

  if (props.layout === 'dual') {
    return React.createElement(View, { style: styles.container, key: element.id },
      React.createElement(View, { style: styles.dualLayout },
        // Customer signature
        React.createElement(View, { style: styles.signatureBlock },
          React.createElement(View, { style: styles.line }),
          React.createElement(Text, { style: styles.label }, customerLabel),
          props.showDate && React.createElement(Text, { style: styles.date }, 'Date: __________')
        ),

        // Company signature
        React.createElement(View, { style: styles.signatureBlock },
          React.createElement(View, { style: styles.line }),
          React.createElement(Text, { style: styles.label }, companyLabel),
          props.showDate && React.createElement(Text, { style: styles.date }, 'Date: __________')
        )
      )
    );
  } else {
    return React.createElement(View, { style: styles.container, key: element.id },
      React.createElement(View, { style: styles.signatureBlock },
        React.createElement(View, { style: styles.line }),
        React.createElement(Text, { style: styles.label }, companyLabel),
        props.showDate && React.createElement(Text, { style: styles.date }, 'Date: __________')
      )
    );
  }
}

/**
 * Render divider element - horizontal line
 */
function renderDivider(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const props = element.properties;

  const styles = StyleSheet.create({
    container: {
      marginTop: props.marginTop || 0,
      marginBottom: props.marginBottom || 0,
      alignItems: props.alignment === 'center' ? 'center' : 'stretch',
    },
    line: {
      borderTop: `${element.size.height || 1} ${props.style || 'solid'} ${props.color || '#ccc'}`,
      width: props.width ? `${props.width}%` : '100%',
    },
  });

  return React.createElement(View, { style: styles.container, key: element.id },
    React.createElement(View, { style: styles.line })
  );
}

/**
 * Render spacer element - vertical empty space
 */
function renderSpacer(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const styles = StyleSheet.create({
    spacer: {
      height: element.size.height || 20,
    },
  });

  return React.createElement(View, { style: styles.spacer, key: element.id });
}

/**
 * Render QR code element - generates QR code image from data
 */
async function renderQRCode(
  element: TemplateElement,
  context: RenderContext
): Promise<React.ReactElement | null> {
  const props = element.properties as Partial<QRCodeProperties>;

  // Interpolate variables in QR data
  const data = interpolateVariables(props.data || '', context);

  if (!data) {
    return null; // Don't render if no data
  }

  try {
    // Generate QR code as data URL
    const qrDataUrl = await QRCode.toDataURL(data, {
      errorCorrectionLevel: props.errorCorrectionLevel || 'M',
      width: props.size || 100,
      margin: props.margin || 4,
      color: {
        dark: props.foregroundColor || '#000000',
        light: props.backgroundColor || '#ffffff',
      },
    });

    const styles = StyleSheet.create({
      container: {
        alignItems: props.alignment === 'center' ? 'center' :
                    props.alignment === 'right' ? 'flex-end' : 'flex-start',
        marginTop: props.marginTop || 0,
        marginBottom: props.marginBottom || 0,
      },
      qrImage: {
        width: props.size || 100,
        height: props.size || 100,
      },
      label: {
        fontSize: props.labelFontSize || 9,
        color: props.labelColor || context.theme.colors.textSecondary,
        textAlign: props.alignment || 'center',
        marginTop: 5,
      },
    });

    return React.createElement(View, { style: styles.container, key: element.id },
      React.createElement(Image, { style: styles.qrImage, src: qrDataUrl }),
      props.label && React.createElement(Text, { style: styles.label }, props.label)
    );
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

/**
 * Render chart element - generates SVG chart visualization
 */
function renderChart(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement | null {
  const props = element.properties as Partial<ChartProperties>;
  const { quote } = context;

  // Get data from quote categories if using automatic data source
  let chartData: Array<{ label: string; value: number; percentage: number }> = [];

  if (props.dataSource === 'categories') {
    // Calculate category contributions
    const categoryTotals = quote.items.reduce((acc, item) => {
      const categoryName = item.product.category.name;
      acc[categoryName] = (acc[categoryName] || 0) + item.lineTotal;
      return acc;
    }, {} as Record<string, number>);

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);

    chartData = Object.entries(categoryTotals).map(([label, value]) => ({
      label,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }));
  }

  if (chartData.length === 0) {
    return null; // Don't render if no data
  }

  const styles = StyleSheet.create({
    container: {
      alignItems: props.alignment === 'center' ? 'center' :
                  props.alignment === 'right' ? 'flex-end' : 'flex-start',
      marginTop: props.marginTop || 0,
      marginBottom: props.marginBottom || 0,
    },
    title: {
      fontSize: props.titleFontSize || 12,
      fontWeight: 600,
      color: props.titleColor || context.theme.colors.textPrimary,
      marginBottom: 10,
      textAlign: props.alignment || 'left',
    },
    chartWrapper: {
      width: props.width || 200,
      height: props.height || 200,
      position: 'relative',
    },
    legend: {
      marginTop: 10,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    legendColor: {
      width: 12,
      height: 12,
      marginRight: 6,
    },
    legendText: {
      fontSize: 9,
      color: context.theme.colors.textSecondary,
    },
  });

  // Default color palette
  const colors = props.colors || [
    '#2563eb', '#dc2626', '#16a34a', '#eab308', '#7c3aed',
    '#db2777', '#0891b2', '#ea580c', '#65a30d', '#6366f1'
  ];

  // Render based on chart type
  let chartElement: React.ReactElement;

  if (props.chartType === 'pie' || props.chartType === 'donut') {
    chartElement = renderPieChart(chartData, props, colors);
  } else if (props.chartType === 'bar') {
    chartElement = renderBarChart(chartData, props, colors);
  } else {
    chartElement = renderPieChart(chartData, props, colors); // Default to pie
  }

  return React.createElement(View, { style: styles.container, key: element.id },
    props.title && React.createElement(Text, { style: styles.title }, props.title),
    React.createElement(View, { style: styles.chartWrapper }, chartElement),
    props.showLegend && React.createElement(View, { style: styles.legend },
      ...chartData.map((item, idx) => {
        const color = colors[idx % colors.length];
        return React.createElement(View, { key: `legend-${idx}`, style: styles.legendItem },
          React.createElement(View, {
            style: {
              ...styles.legendColor,
              backgroundColor: color,
            }
          }),
          React.createElement(Text, { style: styles.legendText },
            `${item.label}: ${formatCurrency(item.value)}${props.showPercentages ? ` (${item.percentage.toFixed(1)}%)` : ''}`
          )
        );
      })
    )
  );
}

/**
 * Render pie/donut chart as SVG
 */
function renderPieChart(
  data: Array<{ label: string; value: number; percentage: number }>,
  props: Partial<ChartProperties>,
  colors: string[]
): React.ReactElement {
  const width = props.width || 200;
  const height = props.height || 200;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) / 2 - 10;
  const innerRadius = props.chartType === 'donut' ? radius * 0.6 : 0;

  let currentAngle = -Math.PI / 2; // Start at top

  const slices = data.map((item, idx) => {
    const sliceAngle = (item.percentage / 100) * 2 * Math.PI;
    const endAngle = currentAngle + sliceAngle;

    // Calculate arc path
    const startX = centerX + radius * Math.cos(currentAngle);
    const startY = centerY + radius * Math.sin(currentAngle);
    const endX = centerX + radius * Math.cos(endAngle);
    const endY = centerY + radius * Math.sin(endAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    let pathData: string;

    if (innerRadius > 0) {
      // Donut chart
      const innerStartX = centerX + innerRadius * Math.cos(currentAngle);
      const innerStartY = centerY + innerRadius * Math.sin(currentAngle);
      const innerEndX = centerX + innerRadius * Math.cos(endAngle);
      const innerEndY = centerY + innerRadius * Math.sin(endAngle);

      pathData = `
        M ${startX} ${startY}
        A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
        L ${innerEndX} ${innerEndY}
        A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStartX} ${innerStartY}
        Z
      `;
    } else {
      // Pie chart
      pathData = `
        M ${centerX} ${centerY}
        L ${startX} ${startY}
        A ${radius} ${radius} 0 ${largeArc} 1 ${endX} ${endY}
        Z
      `;
    }

    currentAngle = endAngle;
    const color = colors[idx % colors.length];

    return React.createElement(Path, {
      key: `slice-${idx}`,
      d: pathData,
      fill: color,
      stroke: '#ffffff',
      strokeWidth: 2,
    });
  });

  return React.createElement(Svg, {
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`,
  }, ...slices);
}

/**
 * Render bar chart as SVG
 */
function renderBarChart(
  data: Array<{ label: string; value: number; percentage: number }>,
  props: Partial<ChartProperties>,
  colors: string[]
): React.ReactElement {
  const width = props.width || 200;
  const height = props.height || 200;
  const barSpacing = 10;
  const barWidth = (width - (data.length + 1) * barSpacing) / data.length;
  const maxValue = Math.max(...data.map(d => d.value));

  const bars = data.map((item, idx) => {
    const barHeight = (item.value / maxValue) * (height - 40);
    const x = barSpacing + idx * (barWidth + barSpacing);
    const y = height - barHeight - 20;
    const color = colors[idx % colors.length];

    return React.createElement(React.Fragment, { key: `bar-${idx}` },
      React.createElement(Rect, {
        x: x,
        y: y,
        width: barWidth,
        height: barHeight,
        fill: color,
      }),
      props.showValues && React.createElement('text', {
        x: x + barWidth / 2,
        y: y - 5,
        fontSize: 8,
        textAnchor: 'middle',
        fill: colors[idx % colors.length],
      }, formatCurrency(item.value))
    );
  });

  return React.createElement(Svg, {
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`,
  }, ...bars);
}

/**
 * Main template element renderer
 * Routes each element type to its appropriate renderer function
 *
 * @param element - Template element to render
 * @param quote - Quote data with all details
 * @param context - Rendering context with theme and settings
 * @returns React element or null if element should not be rendered
 */
export function renderTemplateElement(
  element: TemplateElement,
  quote: QuoteWithDetails,
  context: RenderContext
): React.ReactElement | null {
  // Check conditional rendering
  if (!evaluateConditions(element, context)) {
    return null;
  }

  // Route to appropriate renderer based on element type
  switch (element.type) {
    case 'header':
      return renderHeader(element, context);

    case 'logo':
      return renderLogo(element, context);

    case 'textBlock':
      return renderTextBlock(element, context);

    case 'clientDetails':
      return renderClientDetails(element, context);

    case 'table':
    case 'itemTable':
      return renderItemTable(element, context);

    case 'summaryBox':
      return renderSummaryBox(element, context);

    case 'signature':
    case 'signatureBlock':
      return renderSignature(element, context);

    case 'divider':
      return renderDivider(element, context);

    case 'spacer':
      return renderSpacer(element, context);

    case 'chart':
      return renderChart(element, context);

    // Note: QR code rendering is async, handle in the PDF generation wrapper
    case 'qrCode':
      // Return placeholder or handle async in wrapper
      return renderQRCodePlaceholder(element, context);

    default:
      console.warn(`Unknown element type: ${element.type}`);
      return null;
  }
}

/**
 * Placeholder for QR code while async generation happens
 * In production, this should be handled by pre-generating QR codes
 */
function renderQRCodePlaceholder(
  element: TemplateElement,
  context: RenderContext
): React.ReactElement {
  const props = element.properties as Partial<QRCodeProperties>;

  const styles = StyleSheet.create({
    container: {
      alignItems: props.alignment === 'center' ? 'center' :
                  props.alignment === 'right' ? 'flex-end' : 'flex-start',
      marginTop: props.marginTop || 0,
      marginBottom: props.marginBottom || 0,
    },
    placeholder: {
      width: props.size || 100,
      height: props.size || 100,
      backgroundColor: '#f0f0f0',
      border: '1px dashed #ccc',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      fontSize: 8,
      color: '#999',
    },
  });

  return React.createElement(View, { style: styles.container, key: element.id },
    React.createElement(View, { style: styles.placeholder },
      React.createElement(Text, { style: styles.text }, 'QR Code')
    )
  );
}

/**
 * Async wrapper to render QR code element
 * Use this when generating PDFs to properly handle async QR generation
 */
export async function renderTemplateElementAsync(
  element: TemplateElement,
  quote: QuoteWithDetails,
  context: RenderContext
): Promise<React.ReactElement | null> {
  // Check conditional rendering
  if (!evaluateConditions(element, context)) {
    return null;
  }

  // Handle QR code async rendering
  if (element.type === 'qrCode') {
    return await renderQRCode(element, context);
  }

  // For all other elements, use synchronous renderer
  return renderTemplateElement(element, quote, context);
}
