/**
 * Professional PDF Template Defaults
 *
 * This file contains pre-built professional templates for the PDF Template Editor.
 * Each template includes complete metadata, theme configuration, and element definitions.
 * These templates serve as starting points for users and seed data for the database.
 *
 * Phase 3A: Professional Template Definitions
 */

import { TemplateJSON, TemplateCategory } from './types';

// ==========================================
// 1. MODERN TEMPLATE
// ==========================================

/**
 * Modern Template - Clean, minimalist design with blue accents
 * Perfect for technology companies and modern businesses
 */
const modernTemplate: TemplateJSON = {
  metadata: {
    version: '1.0',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  theme: {
    colors: {
      primary: '#2563eb',      // Blue
      secondary: '#60a5fa',    // Light blue
      textPrimary: '#1f2937',  // Dark gray
      textSecondary: '#6b7280', // Gray
      background: '#ffffff',   // White
    },
    fonts: {
      heading: {
        family: 'Helvetica',
        size: 24,
        weight: 700,
      },
      body: {
        family: 'Helvetica',
        size: 11,
        weight: 400,
      },
      small: {
        family: 'Helvetica',
        size: 9,
        weight: 400,
      },
    },
  },
  elements: [
    {
      id: 'modern-header',
      type: 'header',
      order: 1,
      position: 'auto',
      size: { width: 'auto', height: 60 },
      properties: {
        title: 'QUOTATION',
        alignment: 'left',
        fontSize: 28,
        fontWeight: 700,
        color: '#2563eb',
        backgroundColor: 'transparent',
        showLogo: true,
        logoPosition: 'right',
        logoMaxHeight: 50,
      },
    },
    {
      id: 'modern-quote-info',
      type: 'textBlock',
      order: 2,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: 'Quote #{{quoteNumber}} | Date: {{date}}',
        fontSize: 10,
        fontWeight: 400,
        color: '#6b7280',
        alignment: 'left',
        marginBottom: 20,
      },
    },
    {
      id: 'modern-client-details',
      type: 'textBlock',
      order: 3,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'CLIENT DETAILS',
        labelFontSize: 12,
        labelFontWeight: 600,
        labelColor: '#1f2937',
        content: '{{clientName}}\n{{clientAddress}}\n{{clientEmail}}\n{{clientPhone}}',
        fontSize: 10,
        fontWeight: 400,
        color: '#4b5563',
        alignment: 'left',
        marginBottom: 30,
        showBorder: false,
      },
    },
    {
      id: 'modern-item-table',
      type: 'table',
      order: 4,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        showBorders: true,
        borderColor: '#e5e7eb',
        borderWidth: 1,
        headerBackgroundColor: '#f9fafb',
        headerTextColor: '#1f2937',
        headerFontWeight: 600,
        rowBackgroundColor: '#ffffff',
        alternateRowColor: '#ffffff',
        rowTextColor: '#374151',
        fontSize: 10,
        cellPadding: 8,
        columns: [
          { key: 'description', label: 'Description', width: 40 },
          { key: 'quantity', label: 'Qty', width: 10, alignment: 'center' },
          { key: 'rate', label: 'Rate', width: 15, alignment: 'right' },
          { key: 'discount', label: 'Discount', width: 15, alignment: 'right' },
          { key: 'total', label: 'Total', width: 20, alignment: 'right' },
        ],
        showCategoryGroups: false,
      },
    },
    {
      id: 'modern-summary',
      type: 'summaryBox',
      order: 5,
      position: 'auto',
      size: { width: 250, height: 'auto' },
      properties: {
        alignment: 'right',
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        padding: 15,
        fontSize: 10,
        labelFontWeight: 500,
        valueFontWeight: 600,
        marginTop: 20,
        marginBottom: 20,
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showGrandTotal: true,
        grandTotalColor: '#2563eb',
        grandTotalFontSize: 14,
      },
    },
    {
      id: 'modern-terms',
      type: 'textBlock',
      order: 6,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'Terms & Conditions',
        labelFontSize: 11,
        labelFontWeight: 600,
        labelColor: '#1f2937',
        content: '{{policies}}',
        fontSize: 9,
        fontWeight: 400,
        color: '#6b7280',
        alignment: 'left',
        marginTop: 30,
        marginBottom: 20,
      },
    },
    {
      id: 'modern-chart',
      type: 'chart',
      order: 7,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        chartType: 'pie',
        dataSource: 'categories',
        title: 'Quote Breakdown',
        titleFontSize: 12,
        titleColor: '#1f2937',
        showLegend: true,
        showValues: false,
        showPercentages: true,
        width: 200,
        height: 200,
        alignment: 'center',
        marginTop: 30,
        marginBottom: 30,
        colors: ['#2563eb', '#60a5fa', '#3b82f6', '#1e40af', '#1e3a8a'],
      },
    },
    {
      id: 'modern-qr',
      type: 'qrCode',
      order: 8,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        data: 'https://example.com/quote/{{quoteNumber}}',
        size: 100,
        errorCorrectionLevel: 'M',
        backgroundColor: '#ffffff',
        foregroundColor: '#2563eb',
        margin: 4,
        label: 'Scan for online quote',
        labelFontSize: 9,
        labelColor: '#6b7280',
        alignment: 'center',
        marginTop: 20,
        marginBottom: 20,
      },
    },
    {
      id: 'modern-signature',
      type: 'signature',
      order: 9,
      position: 'auto',
      size: { width: 'auto', height: 80 },
      properties: {
        layout: 'dual', // Customer and Company signatures side by side
        showDate: true,
        lineColor: '#d1d5db',
        lineWidth: 1,
        fontSize: 9,
        fontWeight: 400,
        textColor: '#6b7280',
        marginTop: 40,
      },
    },
  ],
};

// ==========================================
// 2. CLASSIC TEMPLATE
// ==========================================

/**
 * Classic Template - Traditional formal business style
 * Ideal for established businesses and corporate environments
 */
const classicTemplate: TemplateJSON = {
  metadata: {
    version: '1.0',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  theme: {
    colors: {
      primary: '#1f2937',      // Dark gray
      secondary: '#fbbf24',    // Gold
      textPrimary: '#111827',  // Near black
      textSecondary: '#4b5563', // Medium gray
      background: '#ffffff',   // White
    },
    fonts: {
      heading: {
        family: 'Times-Roman',
        size: 26,
        weight: 700,
      },
      body: {
        family: 'Helvetica',
        size: 10,
        weight: 400,
      },
      small: {
        family: 'Helvetica',
        size: 8,
        weight: 400,
      },
    },
  },
  elements: [
    {
      id: 'classic-logo',
      type: 'logo',
      order: 1,
      position: 'auto',
      size: { width: 'auto', height: 60 },
      properties: {
        alignment: 'center',
        maxHeight: 60,
        maxWidth: 200,
        marginBottom: 15,
      },
    },
    {
      id: 'classic-header',
      type: 'header',
      order: 2,
      position: 'auto',
      size: { width: 'auto', height: 50 },
      properties: {
        title: 'QUOTATION',
        alignment: 'center',
        fontSize: 26,
        fontWeight: 700,
        color: '#1f2937',
        backgroundColor: 'transparent',
        showLogo: false,
        borderBottom: true,
        borderColor: '#fbbf24',
        borderWidth: 2,
        marginBottom: 10,
      },
    },
    {
      id: 'classic-divider-1',
      type: 'divider',
      order: 3,
      position: 'auto',
      size: { width: 'auto', height: 2 },
      properties: {
        color: '#fbbf24',
        style: 'solid',
        marginTop: 5,
        marginBottom: 20,
      },
    },
    {
      id: 'classic-client-details',
      type: 'textBlock',
      order: 4,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'Bill To:',
        labelFontSize: 12,
        labelFontWeight: 700,
        labelColor: '#1f2937',
        content: '{{clientName}}\n{{clientAddress}}\n{{clientEmail}}\n{{clientPhone}}',
        fontSize: 10,
        fontWeight: 400,
        color: '#374151',
        alignment: 'left',
        marginBottom: 20,
        showBorder: true,
        borderColor: '#d1d5db',
        borderWidth: 1,
        padding: 12,
        backgroundColor: '#f9fafb',
      },
    },
    {
      id: 'classic-quote-info',
      type: 'textBlock',
      order: 5,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: 'Quote Number: {{quoteNumber}}\nDate: {{date}}\nValid Until: {{validUntil}}',
        fontSize: 10,
        fontWeight: 400,
        color: '#4b5563',
        alignment: 'right',
        marginBottom: 25,
      },
    },
    {
      id: 'classic-item-table',
      type: 'table',
      order: 6,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        showBorders: true,
        borderColor: '#1f2937',
        borderWidth: 1,
        headerBackgroundColor: '#1f2937',
        headerTextColor: '#ffffff',
        headerFontWeight: 700,
        rowBackgroundColor: '#ffffff',
        alternateRowColor: '#f9fafb',
        rowTextColor: '#374151',
        fontSize: 10,
        cellPadding: 10,
        columns: [
          { key: 'item', label: 'Item', width: 10, alignment: 'center' },
          { key: 'description', label: 'Description', width: 35 },
          { key: 'quantity', label: 'Quantity', width: 12, alignment: 'center' },
          { key: 'rate', label: 'Unit Price', width: 15, alignment: 'right' },
          { key: 'discount', label: 'Discount', width: 13, alignment: 'right' },
          { key: 'total', label: 'Amount', width: 15, alignment: 'right' },
        ],
        showCategoryGroups: false,
        showRowNumbers: true,
      },
    },
    {
      id: 'classic-divider-2',
      type: 'divider',
      order: 7,
      position: 'auto',
      size: { width: 'auto', height: 1 },
      properties: {
        color: '#d1d5db',
        style: 'solid',
        marginTop: 15,
        marginBottom: 15,
      },
    },
    {
      id: 'classic-summary',
      type: 'summaryBox',
      order: 8,
      position: 'auto',
      size: { width: 280, height: 'auto' },
      properties: {
        alignment: 'right',
        backgroundColor: '#ffffff',
        borderColor: '#1f2937',
        borderWidth: 2,
        padding: 15,
        fontSize: 11,
        labelFontWeight: 600,
        valueFontWeight: 700,
        marginTop: 10,
        marginBottom: 25,
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showGrandTotal: true,
        grandTotalColor: '#1f2937',
        grandTotalFontSize: 14,
        grandTotalBackgroundColor: '#f9fafb',
      },
    },
    {
      id: 'classic-terms',
      type: 'textBlock',
      order: 9,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'Terms and Conditions',
        labelFontSize: 12,
        labelFontWeight: 700,
        labelColor: '#1f2937',
        content: '{{policies}}',
        fontSize: 9,
        fontWeight: 400,
        color: '#4b5563',
        alignment: 'justify',
        marginTop: 20,
        marginBottom: 25,
        showBorder: true,
        borderColor: '#d1d5db',
        borderWidth: 1,
        padding: 12,
      },
    },
    {
      id: 'classic-signature',
      type: 'signature',
      order: 10,
      position: 'auto',
      size: { width: 'auto', height: 100 },
      properties: {
        layout: 'dual',
        showDate: true,
        lineColor: '#1f2937',
        lineWidth: 1.5,
        fontSize: 10,
        fontWeight: 600,
        textColor: '#1f2937',
        marginTop: 40,
        labels: {
          customer: 'Customer Signature',
          company: 'Authorized Signature',
        },
      },
    },
  ],
};

// ==========================================
// 3. PROFESSIONAL TEMPLATE
// ==========================================

/**
 * Professional Template - Corporate structured layout
 * Suitable for professional services and B2B transactions
 */
const professionalTemplate: TemplateJSON = {
  metadata: {
    version: '1.0',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  theme: {
    colors: {
      primary: '#0f172a',      // Slate
      secondary: '#64748b',    // Gray
      textPrimary: '#1e293b',  // Dark slate
      textSecondary: '#475569', // Medium slate
      background: '#f8fafc',   // Off-white
    },
    fonts: {
      heading: {
        family: 'Helvetica',
        size: 22,
        weight: 700,
      },
      body: {
        family: 'Helvetica',
        size: 10,
        weight: 400,
      },
      small: {
        family: 'Helvetica',
        size: 8,
        weight: 400,
      },
    },
  },
  elements: [
    {
      id: 'professional-header',
      type: 'header',
      order: 1,
      position: 'auto',
      size: { width: 'auto', height: 70 },
      properties: {
        title: 'Professional Quotation',
        alignment: 'left',
        fontSize: 22,
        fontWeight: 700,
        color: '#0f172a',
        backgroundColor: '#f8fafc',
        showLogo: true,
        logoPosition: 'inline-right', // Logo on same line as title, aligned right
        logoMaxHeight: 45,
        padding: 15,
        borderBottom: true,
        borderColor: '#cbd5e1',
        borderWidth: 2,
      },
    },
    {
      id: 'professional-metadata',
      type: 'textBlock',
      order: 2,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        layout: 'columns',
        columns: [
          {
            width: 50,
            content: 'Quote Number: {{quoteNumber}}\nIssue Date: {{date}}\nValid Until: {{validUntil}}',
          },
          {
            width: 50,
            content: 'Status: {{status}}\nSalesperson: {{salesperson}}',
            alignment: 'right',
          },
        ],
        fontSize: 9,
        fontWeight: 400,
        color: '#475569',
        marginTop: 15,
        marginBottom: 15,
        backgroundColor: '#ffffff',
        padding: 10,
      },
    },
    {
      id: 'professional-client-details',
      type: 'textBlock',
      order: 3,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'CLIENT INFORMATION',
        labelFontSize: 10,
        labelFontWeight: 700,
        labelColor: '#0f172a',
        labelBackgroundColor: '#e2e8f0',
        labelPadding: 6,
        content: '{{clientName}}\n{{clientAddress}}\n{{clientEmail}} | {{clientPhone}}',
        fontSize: 10,
        fontWeight: 400,
        color: '#334155',
        alignment: 'left',
        marginBottom: 20,
        backgroundColor: '#ffffff',
        padding: 12,
        showBorder: true,
        borderColor: '#cbd5e1',
        borderWidth: 1,
      },
    },
    {
      id: 'professional-spacer',
      type: 'spacer',
      order: 4,
      position: 'auto',
      size: { width: 'auto', height: 15 },
      properties: {},
    },
    {
      id: 'professional-item-table',
      type: 'table',
      order: 5,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        showBorders: true,
        borderColor: '#cbd5e1',
        borderWidth: 1,
        headerBackgroundColor: '#0f172a',
        headerTextColor: '#ffffff',
        headerFontWeight: 700,
        headerFontSize: 10,
        rowBackgroundColor: '#ffffff',
        alternateRowColor: '#f8fafc',
        rowTextColor: '#334155',
        fontSize: 9,
        cellPadding: 9,
        columns: [
          { key: 'description', label: 'Description', width: 38 },
          { key: 'category', label: 'Category', width: 15 },
          { key: 'quantity', label: 'Qty', width: 10, alignment: 'center' },
          { key: 'rate', label: 'Rate', width: 14, alignment: 'right' },
          { key: 'discount', label: 'Disc.', width: 10, alignment: 'right' },
          { key: 'total', label: 'Line Total', width: 13, alignment: 'right' },
        ],
        showCategoryGroups: true,
        categoryGroupStyle: {
          backgroundColor: '#e2e8f0',
          fontWeight: 600,
          fontSize: 9,
          padding: 6,
        },
      },
    },
    {
      id: 'professional-summary',
      type: 'summaryBox',
      order: 6,
      position: 'auto',
      size: { width: 300, height: 'auto' },
      properties: {
        alignment: 'right',
        backgroundColor: '#ffffff',
        borderColor: '#0f172a',
        borderWidth: 2,
        padding: 18,
        fontSize: 10,
        labelFontWeight: 600,
        valueFontWeight: 700,
        marginTop: 20,
        marginBottom: 25,
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showGrandTotal: true,
        grandTotalColor: '#0f172a',
        grandTotalFontSize: 16,
        grandTotalBackgroundColor: '#e2e8f0',
        grandTotalPadding: 8,
      },
    },
    {
      id: 'professional-chart',
      type: 'chart',
      order: 7,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        chartType: 'donut',
        dataSource: 'categories',
        title: 'Category Distribution',
        titleFontSize: 12,
        titleColor: '#0f172a',
        showLegend: true,
        showValues: true,
        showPercentages: true,
        width: 220,
        height: 220,
        alignment: 'center',
        marginTop: 25,
        marginBottom: 25,
        colors: ['#0f172a', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
      },
    },
    {
      id: 'professional-divider',
      type: 'divider',
      order: 8,
      position: 'auto',
      size: { width: 'auto', height: 2 },
      properties: {
        color: '#cbd5e1',
        style: 'solid',
        marginTop: 20,
        marginBottom: 20,
      },
    },
    {
      id: 'professional-terms',
      type: 'textBlock',
      order: 9,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'TERMS & CONDITIONS',
        labelFontSize: 10,
        labelFontWeight: 700,
        labelColor: '#0f172a',
        content: '{{policies}}',
        fontSize: 8,
        fontWeight: 400,
        color: '#475569',
        alignment: 'left',
        lineHeight: 1.4,
        marginBottom: 25,
      },
    },
    {
      id: 'professional-signature',
      type: 'signature',
      order: 10,
      position: 'auto',
      size: { width: 'auto', height: 90 },
      properties: {
        layout: 'dual',
        showDate: true,
        lineColor: '#64748b',
        lineWidth: 1,
        fontSize: 9,
        fontWeight: 500,
        textColor: '#475569',
        marginTop: 30,
        backgroundColor: '#ffffff',
        padding: 10,
        borderColor: '#cbd5e1',
        borderWidth: 1,
      },
    },
  ],
};

// ==========================================
// 4. MINIMALIST TEMPLATE
// ==========================================

/**
 * Minimalist Template - Ultra-clean, typography-driven design
 * Perfect for creative professionals and modern startups
 */
const minimalistTemplate: TemplateJSON = {
  metadata: {
    version: '1.0',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  theme: {
    colors: {
      primary: '#000000',      // Black
      secondary: '#6b7280',    // Gray
      textPrimary: '#000000',  // Black
      textSecondary: '#9ca3af', // Light gray
      background: '#ffffff',   // White
    },
    fonts: {
      heading: {
        family: 'Helvetica',
        size: 32,
        weight: 300, // Light weight for minimalist feel
      },
      body: {
        family: 'Helvetica',
        size: 10,
        weight: 400,
      },
      small: {
        family: 'Helvetica',
        size: 8,
        weight: 300,
      },
    },
  },
  elements: [
    {
      id: 'minimalist-company',
      type: 'textBlock',
      order: 1,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: '{{companyName}}',
        fontSize: 14,
        fontWeight: 300,
        color: '#000000',
        alignment: 'left',
        marginBottom: 5,
        letterSpacing: 2,
        textTransform: 'uppercase',
      },
    },
    {
      id: 'minimalist-spacer-1',
      type: 'spacer',
      order: 2,
      position: 'auto',
      size: { width: 'auto', height: 40 },
      properties: {},
    },
    {
      id: 'minimalist-title',
      type: 'textBlock',
      order: 3,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: 'Quote',
        fontSize: 32,
        fontWeight: 300,
        color: '#000000',
        alignment: 'left',
        marginBottom: 10,
      },
    },
    {
      id: 'minimalist-quote-info',
      type: 'textBlock',
      order: 4,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: '{{quoteNumber}} / {{date}}',
        fontSize: 9,
        fontWeight: 300,
        color: '#6b7280',
        alignment: 'left',
        marginBottom: 60,
      },
    },
    {
      id: 'minimalist-client-details',
      type: 'textBlock',
      order: 5,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: '{{clientName}}\n{{clientAddress}}\n{{clientEmail}}',
        fontSize: 10,
        fontWeight: 400,
        color: '#000000',
        alignment: 'left',
        marginBottom: 50,
        lineHeight: 1.6,
        showBorder: false,
      },
    },
    {
      id: 'minimalist-item-table',
      type: 'table',
      order: 6,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        showBorders: false,
        borderColor: 'transparent',
        borderWidth: 0,
        headerBackgroundColor: 'transparent',
        headerTextColor: '#6b7280',
        headerFontWeight: 400,
        headerFontSize: 8,
        rowBackgroundColor: 'transparent',
        alternateRowColor: 'transparent',
        rowTextColor: '#000000',
        fontSize: 10,
        cellPadding: 12,
        showHeaderUnderline: true,
        headerUnderlineColor: '#e5e7eb',
        headerUnderlineWidth: 1,
        columns: [
          { key: 'description', label: 'Description', width: 50 },
          { key: 'quantity', label: 'Qty', width: 10, alignment: 'right' },
          { key: 'rate', label: 'Rate', width: 20, alignment: 'right' },
          { key: 'total', label: 'Total', width: 20, alignment: 'right' },
        ],
        showCategoryGroups: false,
        rowSpacing: 8,
      },
    },
    {
      id: 'minimalist-summary',
      type: 'summaryBox',
      order: 7,
      position: 'auto',
      size: { width: 250, height: 'auto' },
      properties: {
        alignment: 'right',
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: 0,
        padding: 0,
        fontSize: 10,
        labelFontWeight: 300,
        valueFontWeight: 400,
        marginTop: 40,
        marginBottom: 60,
        showSubtotal: true,
        showDiscount: false,
        showTax: true,
        showGrandTotal: true,
        grandTotalColor: '#000000',
        grandTotalFontSize: 14,
        grandTotalFontWeight: 400,
        rowSpacing: 8,
        grandTotalTopBorder: true,
        grandTotalTopBorderColor: '#000000',
        grandTotalTopBorderWidth: 1,
        grandTotalPaddingTop: 12,
      },
    },
    {
      id: 'minimalist-terms',
      type: 'textBlock',
      order: 8,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: '{{policies}}',
        fontSize: 8,
        fontWeight: 300,
        color: '#6b7280',
        alignment: 'left',
        lineHeight: 1.6,
        marginTop: 40,
      },
    },
  ],
};

// ==========================================
// 5. BOLD TEMPLATE
// ==========================================

/**
 * Bold Template - Eye-catching design with strong visual hierarchy
 * Great for creative agencies and marketing materials
 */
const boldTemplate: TemplateJSON = {
  metadata: {
    version: '1.0',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  theme: {
    colors: {
      primary: '#dc2626',      // Red
      secondary: '#eab308',    // Yellow
      textPrimary: '#1f2937',  // Dark gray
      textSecondary: '#6b7280', // Medium gray
      background: '#ffffff',   // White
    },
    fonts: {
      heading: {
        family: 'Helvetica-Bold',
        size: 32,
        weight: 700,
      },
      body: {
        family: 'Helvetica',
        size: 11,
        weight: 400,
      },
      small: {
        family: 'Helvetica',
        size: 9,
        weight: 400,
      },
    },
  },
  elements: [
    {
      id: 'bold-header',
      type: 'header',
      order: 1,
      position: 'auto',
      size: { width: 'auto', height: 80 },
      properties: {
        title: 'QUOTATION',
        alignment: 'center',
        fontSize: 32,
        fontWeight: 700,
        color: '#ffffff',
        backgroundColor: '#dc2626',
        padding: 20,
        showLogo: false,
        textTransform: 'uppercase',
        letterSpacing: 3,
      },
    },
    {
      id: 'bold-logo',
      type: 'logo',
      order: 2,
      position: 'auto',
      size: { width: 'auto', height: 70 },
      properties: {
        alignment: 'center',
        maxHeight: 70,
        maxWidth: 250,
        marginTop: 20,
        marginBottom: 20,
      },
    },
    {
      id: 'bold-quote-info',
      type: 'textBlock',
      order: 3,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        content: 'Quote #{{quoteNumber}} | {{date}}',
        fontSize: 12,
        fontWeight: 700,
        color: '#1f2937',
        alignment: 'center',
        marginBottom: 25,
        textTransform: 'uppercase',
      },
    },
    {
      id: 'bold-client-details',
      type: 'textBlock',
      order: 4,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'CLIENT',
        labelFontSize: 14,
        labelFontWeight: 700,
        labelColor: '#ffffff',
        labelBackgroundColor: '#1f2937',
        labelPadding: 10,
        content: '{{clientName}}\n{{clientAddress}}\n{{clientEmail}} | {{clientPhone}}',
        fontSize: 11,
        fontWeight: 400,
        color: '#374151',
        alignment: 'left',
        marginBottom: 25,
        showBorder: true,
        borderColor: '#1f2937',
        borderWidth: 3,
        padding: 15,
      },
    },
    {
      id: 'bold-item-table',
      type: 'table',
      order: 5,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        showBorders: true,
        borderColor: '#1f2937',
        borderWidth: 2,
        headerBackgroundColor: '#eab308',
        headerTextColor: '#1f2937',
        headerFontWeight: 700,
        headerFontSize: 11,
        rowBackgroundColor: '#ffffff',
        alternateRowColor: '#fef3c7',
        rowTextColor: '#374151',
        fontSize: 10,
        cellPadding: 12,
        columns: [
          { key: 'description', label: 'DESCRIPTION', width: 40 },
          { key: 'quantity', label: 'QTY', width: 12, alignment: 'center' },
          { key: 'rate', label: 'RATE', width: 16, alignment: 'right' },
          { key: 'discount', label: 'DISCOUNT', width: 16, alignment: 'right' },
          { key: 'total', label: 'TOTAL', width: 16, alignment: 'right' },
        ],
        showCategoryGroups: false,
      },
    },
    {
      id: 'bold-summary',
      type: 'summaryBox',
      order: 6,
      position: 'auto',
      size: { width: 300, height: 'auto' },
      properties: {
        alignment: 'right',
        backgroundColor: '#1f2937',
        borderColor: '#dc2626',
        borderWidth: 3,
        padding: 20,
        fontSize: 11,
        labelFontWeight: 600,
        valueFontWeight: 700,
        labelColor: '#ffffff',
        valueColor: '#ffffff',
        marginTop: 20,
        marginBottom: 25,
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showGrandTotal: true,
        grandTotalColor: '#eab308',
        grandTotalFontSize: 16,
        grandTotalBackgroundColor: '#374151',
        grandTotalPadding: 10,
      },
    },
    {
      id: 'bold-terms',
      type: 'textBlock',
      order: 7,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'IMPORTANT TERMS',
        labelFontSize: 13,
        labelFontWeight: 700,
        labelColor: '#1f2937',
        labelBackgroundColor: '#fed7aa',
        labelPadding: 8,
        content: '{{policies}}',
        fontSize: 9,
        fontWeight: 400,
        color: '#4b5563',
        alignment: 'left',
        marginTop: 25,
        marginBottom: 20,
        backgroundColor: '#fef3c7',
        padding: 12,
        showBorder: true,
        borderColor: '#eab308',
        borderWidth: 2,
      },
    },
    {
      id: 'bold-signature',
      type: 'signature',
      order: 8,
      position: 'auto',
      size: { width: 'auto', height: 100 },
      properties: {
        layout: 'dual',
        showDate: true,
        lineColor: '#1f2937',
        lineWidth: 2,
        fontSize: 10,
        fontWeight: 700,
        textColor: '#1f2937',
        marginTop: 35,
      },
    },
  ],
};

// ==========================================
// 6. ELEGANT TEMPLATE
// ==========================================

/**
 * Elegant Template - Refined, sophisticated design with premium feel
 * Ideal for luxury brands and high-end services
 */
const elegantTemplate: TemplateJSON = {
  metadata: {
    version: '1.0',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    },
  },
  theme: {
    colors: {
      primary: '#7c3aed',      // Purple
      secondary: '#a78bfa',    // Light purple
      textPrimary: '#1f2937',  // Dark gray
      textSecondary: '#6b7280', // Medium gray
      background: '#faf5ff',   // Light purple tint
    },
    fonts: {
      heading: {
        family: 'Times-Roman',
        size: 28,
        weight: 400,
      },
      body: {
        family: 'Helvetica',
        size: 10,
        weight: 400,
      },
      small: {
        family: 'Helvetica',
        size: 8,
        weight: 400,
      },
    },
  },
  elements: [
    {
      id: 'elegant-logo',
      type: 'logo',
      order: 1,
      position: 'auto',
      size: { width: 'auto', height: 65 },
      properties: {
        alignment: 'center',
        maxHeight: 65,
        maxWidth: 200,
        marginBottom: 20,
      },
    },
    {
      id: 'elegant-header',
      type: 'header',
      order: 2,
      position: 'auto',
      size: { width: 'auto', height: 55 },
      properties: {
        title: 'Quotation',
        alignment: 'center',
        fontSize: 28,
        fontWeight: 400,
        color: '#7c3aed',
        backgroundColor: 'transparent',
        showLogo: false,
        fontFamily: 'Times-Roman', // Serif for elegant feel
        marginBottom: 10,
      },
    },
    {
      id: 'elegant-divider-1',
      type: 'divider',
      order: 3,
      position: 'auto',
      size: { width: 'auto', height: 1 },
      properties: {
        color: '#a78bfa',
        style: 'solid',
        width: 60, // Percentage - centered divider
        alignment: 'center',
        marginTop: 5,
        marginBottom: 25,
      },
    },
    {
      id: 'elegant-quote-info',
      type: 'textBlock',
      order: 4,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        layout: 'columns',
        columns: [
          {
            width: 50,
            content: 'Quote Number\n{{quoteNumber}}',
            fontSize: 9,
            labelFontWeight: 600,
          },
          {
            width: 50,
            content: 'Date\n{{date}}',
            alignment: 'right',
            fontSize: 9,
            labelFontWeight: 600,
          },
        ],
        fontSize: 10,
        fontWeight: 400,
        color: '#4b5563',
        marginBottom: 25,
      },
    },
    {
      id: 'elegant-client-details',
      type: 'textBlock',
      order: 5,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'Prepared For',
        labelFontSize: 11,
        labelFontWeight: 600,
        labelColor: '#7c3aed',
        content: '{{clientName}}\n{{clientAddress}}\n{{clientEmail}}\n{{clientPhone}}',
        fontSize: 10,
        fontWeight: 400,
        color: '#374151',
        alignment: 'left',
        marginBottom: 30,
        showBorder: false,
        lineHeight: 1.5,
      },
    },
    {
      id: 'elegant-item-table',
      type: 'table',
      order: 6,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        showBorders: true,
        borderColor: '#ddd6fe',
        borderWidth: 1,
        headerBackgroundColor: '#f5f3ff',
        headerTextColor: '#5b21b6',
        headerFontWeight: 600,
        headerFontSize: 10,
        rowBackgroundColor: '#ffffff',
        alternateRowColor: '#faf5ff',
        rowTextColor: '#374151',
        fontSize: 10,
        cellPadding: 10,
        columns: [
          { key: 'description', label: 'Description', width: 40 },
          { key: 'quantity', label: 'Quantity', width: 12, alignment: 'center' },
          { key: 'rate', label: 'Unit Price', width: 16, alignment: 'right' },
          { key: 'discount', label: 'Discount', width: 14, alignment: 'right' },
          { key: 'total', label: 'Amount', width: 18, alignment: 'right' },
        ],
        showCategoryGroups: false,
      },
    },
    {
      id: 'elegant-summary',
      type: 'summaryBox',
      order: 7,
      position: 'auto',
      size: { width: 280, height: 'auto' },
      properties: {
        alignment: 'right',
        backgroundColor: '#f5f3ff',
        borderColor: '#a78bfa',
        borderWidth: 1,
        padding: 18,
        fontSize: 10,
        labelFontWeight: 500,
        valueFontWeight: 600,
        marginTop: 20,
        marginBottom: 30,
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showGrandTotal: true,
        grandTotalColor: '#7c3aed',
        grandTotalFontSize: 14,
        grandTotalFontWeight: 700,
        rowSpacing: 6,
      },
    },
    {
      id: 'elegant-divider-2',
      type: 'divider',
      order: 8,
      position: 'auto',
      size: { width: 'auto', height: 1 },
      properties: {
        color: '#ddd6fe',
        style: 'solid',
        marginTop: 10,
        marginBottom: 20,
      },
    },
    {
      id: 'elegant-terms',
      type: 'textBlock',
      order: 9,
      position: 'auto',
      size: { width: 'auto', height: 'auto' },
      properties: {
        label: 'Terms & Conditions',
        labelFontSize: 11,
        labelFontWeight: 600,
        labelColor: '#7c3aed',
        content: '{{policies}}',
        fontSize: 9,
        fontWeight: 400,
        color: '#4b5563',
        alignment: 'left',
        lineHeight: 1.5,
        marginBottom: 25,
      },
    },
    {
      id: 'elegant-signature',
      type: 'signature',
      order: 10,
      position: 'auto',
      size: { width: 'auto', height: 90 },
      properties: {
        layout: 'dual',
        showDate: true,
        lineColor: '#a78bfa',
        lineWidth: 1,
        fontSize: 9,
        fontWeight: 500,
        textColor: '#4b5563',
        marginTop: 35,
      },
    },
  ],
};

// ==========================================
// EXPORT DEFAULT TEMPLATES
// ==========================================

/**
 * Array of default professional templates
 * Ready to be used for database seeding and template selection
 */
export const DEFAULT_TEMPLATES: Array<{
  name: string;
  description: string;
  category: TemplateCategory;
  isDefault: boolean;
  templateJson: TemplateJSON;
}> = [
  {
    name: 'Modern',
    description: 'Clean, minimalist design with blue accents. Perfect for technology companies and modern businesses.',
    category: 'modern',
    isDefault: true, // This is the default template
    templateJson: modernTemplate,
  },
  {
    name: 'Classic',
    description: 'Traditional formal business style with gold accents. Ideal for established businesses and corporate environments.',
    category: 'business',
    isDefault: false,
    templateJson: classicTemplate,
  },
  {
    name: 'Professional',
    description: 'Corporate structured layout with slate colors. Suitable for professional services and B2B transactions.',
    category: 'business',
    isDefault: false,
    templateJson: professionalTemplate,
  },
  {
    name: 'Minimalist',
    description: 'Ultra-clean, typography-driven monochrome design. Perfect for creative professionals and modern startups.',
    category: 'minimalist',
    isDefault: false,
    templateJson: minimalistTemplate,
  },
  {
    name: 'Bold',
    description: 'Eye-catching design with strong visual hierarchy and vibrant colors. Great for creative agencies and marketing materials.',
    category: 'bold',
    isDefault: false,
    templateJson: boldTemplate,
  },
  {
    name: 'Elegant',
    description: 'Refined, sophisticated design with purple tones and premium feel. Ideal for luxury brands and high-end services.',
    category: 'elegant',
    isDefault: false,
    templateJson: elegantTemplate,
  },
];
