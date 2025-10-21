/**
 * Variable Interpolation System for PDF Template Editor
 * Phase 4A: Variable Interpolation
 *
 * This module provides utilities for parsing and replacing {{variable}} placeholders
 * with actual quote data in PDF templates. It supports company info, client info,
 * quote data, calculations, and metadata variables with type-safe TypeScript support.
 *
 * Features:
 * - Case-insensitive variable matching
 * - Fallback values for missing data
 * - Automatic currency formatting
 * - Date/time formatting
 * - Nested object access
 * - Escape sequence support
 * - Type-safe context
 */

import { QuoteWithDetails, TemplateJSON, TemplateElement } from './types';

// ==========================================
// TYPES & INTERFACES
// ==========================================

/**
 * Company information interface
 * Contains business details for the quote provider
 */
export interface CompanyInfo {
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  logoUrl: string | null;
}

/**
 * Variable context for interpolation
 * Contains all data needed to populate template variables
 */
export interface VariableContext {
  /** Company/business information (optional) */
  company?: CompanyInfo;
  /** Quote data with details, items, and client */
  quote: QuoteWithDetails;
  /** Optional custom currency formatter */
  formatCurrency?: (amount: number) => string;
}

/**
 * Available variable definition
 * Describes a supported template variable
 */
export interface VariableDefinition {
  /** Variable key (e.g., 'companyName') */
  key: string;
  /** Human-readable label */
  label: string;
  /** Variable category */
  category: 'company' | 'quote' | 'client' | 'financial' | 'metadata';
  /** Description of the variable */
  description: string;
  /** Example value */
  example: string;
}

// ==========================================
// CONSTANTS
// ==========================================

/** Regular expression to match {{variable}} patterns */
const VARIABLE_REGEX = /\{\{([^}]+)\}\}/g;

/** Regular expression to match escaped \{\{ \}\} patterns */
const ESCAPED_OPEN_REGEX = /\\{\\{/g;
const ESCAPED_CLOSE_REGEX = /\\}\\}/g;

/** Placeholder for escaped braces during processing */
const ESCAPE_PLACEHOLDER_OPEN = '__ESCAPED_OPEN__';
const ESCAPE_PLACEHOLDER_CLOSE = '__ESCAPED_CLOSE__';

/** Default fallback value for missing data */
const DEFAULT_FALLBACK = 'N/A';

/** Default currency symbol */
const DEFAULT_CURRENCY = '₹';

// ==========================================
// AVAILABLE VARIABLES
// ==========================================

/**
 * Returns a list of all supported template variables
 * Useful for displaying available variables in the UI
 */
export function getAvailableVariables(): VariableDefinition[] {
  return [
    // Company Variables
    {
      key: 'companyName',
      label: 'Company Name',
      category: 'company',
      description: 'The name of your company or business',
      example: 'Acme Corporation',
    },
    {
      key: 'companyEmail',
      label: 'Company Email',
      category: 'company',
      description: 'Your business email address',
      example: 'info@acme.com',
    },
    {
      key: 'companyPhone',
      label: 'Company Phone',
      category: 'company',
      description: 'Your business phone number',
      example: '+1 234 567 8900',
    },
    {
      key: 'companyWebsite',
      label: 'Company Website',
      category: 'company',
      description: 'Your business website URL',
      example: 'www.acme.com',
    },
    {
      key: 'companyAddress',
      label: 'Company Address',
      category: 'company',
      description: 'Your business address',
      example: '123 Main St, City, Country',
    },
    {
      key: 'logoUrl',
      label: 'Logo URL',
      category: 'company',
      description: 'URL to your company logo',
      example: '/images/logo.png',
    },

    // Quote Variables
    {
      key: 'quoteNumber',
      label: 'Quote Number',
      category: 'quote',
      description: 'Unique identifier for this quote',
      example: 'Q-2024-001',
    },
    {
      key: 'quoteDate',
      label: 'Quote Date',
      category: 'quote',
      description: 'Date when the quote was created',
      example: 'January 15, 2024',
    },
    {
      key: 'quoteTitle',
      label: 'Quote Title',
      category: 'quote',
      description: 'Title or description of the quote',
      example: 'Office Furniture Quote',
    },
    {
      key: 'quoteStatus',
      label: 'Quote Status',
      category: 'quote',
      description: 'Current status of the quote',
      example: 'DRAFT',
    },

    // Client Variables
    {
      key: 'clientName',
      label: 'Client Name',
      category: 'client',
      description: 'Name of the client',
      example: 'John Doe',
    },
    {
      key: 'clientEmail',
      label: 'Client Email',
      category: 'client',
      description: 'Client email address',
      example: 'john@example.com',
    },
    {
      key: 'clientPhone',
      label: 'Client Phone',
      category: 'client',
      description: 'Client phone number',
      example: '+1 234 567 8900',
    },
    {
      key: 'clientAddress',
      label: 'Client Address',
      category: 'client',
      description: 'Client mailing address',
      example: '456 Oak Ave, City, Country',
    },

    // Financial Variables
    {
      key: 'subtotal',
      label: 'Subtotal',
      category: 'financial',
      description: 'Total before discounts and tax',
      example: '₹10,000.00',
    },
    {
      key: 'discount',
      label: 'Discount',
      category: 'financial',
      description: 'Total discount amount',
      example: '₹500.00',
    },
    {
      key: 'tax',
      label: 'Tax',
      category: 'financial',
      description: 'Total tax amount',
      example: '₹1,710.00',
    },
    {
      key: 'taxRate',
      label: 'Tax Rate',
      category: 'financial',
      description: 'Tax rate percentage',
      example: '18%',
    },
    {
      key: 'grandTotal',
      label: 'Grand Total',
      category: 'financial',
      description: 'Final amount including all charges',
      example: '₹11,210.00',
    },
    {
      key: 'currency',
      label: 'Currency',
      category: 'financial',
      description: 'Currency symbol',
      example: '₹',
    },

    // Metadata Variables
    {
      key: 'itemCount',
      label: 'Item Count',
      category: 'metadata',
      description: 'Total number of line items',
      example: '5',
    },
    {
      key: 'categoryCount',
      label: 'Category Count',
      category: 'metadata',
      description: 'Number of unique categories',
      example: '3',
    },
    {
      key: 'currentDate',
      label: 'Current Date',
      category: 'metadata',
      description: 'Today\'s date',
      example: 'January 20, 2024',
    },
    {
      key: 'currentTime',
      label: 'Current Time',
      category: 'metadata',
      description: 'Current time',
      example: '10:30 AM',
    },
  ];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Formats a date to a human-readable string
 * @param date - Date object or ISO string
 * @param format - Format type ('short', 'long', 'iso')
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date('2024-01-15'), 'long') // "January 15, 2024"
 * formatDate('2024-01-15T10:30:00Z', 'short') // "01/15/2024"
 */
export function formatDate(date: Date | string, format: 'short' | 'long' | 'iso' = 'long'): string {
  if (!date) return DEFAULT_FALLBACK;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return DEFAULT_FALLBACK;
  }

  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    case 'iso':
      return dateObj.toISOString().split('T')[0];
    default:
      return dateObj.toLocaleDateString();
  }
}

/**
 * Formats a time to a human-readable string
 * @param date - Date object or ISO string
 * @param format - Format type ('12h', '24h')
 * @returns Formatted time string
 *
 * @example
 * formatTime(new Date(), '12h') // "10:30 AM"
 * formatTime(new Date(), '24h') // "10:30"
 */
export function formatTime(date: Date | string = new Date(), format: '12h' | '24h' = '12h'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return DEFAULT_FALLBACK;
  }

  if (format === '12h') {
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
}

/**
 * Formats a number as currency
 * @param amount - Number to format
 * @param currency - Currency symbol (default: ₹)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // "₹1,234.56"
 * formatCurrency(1000, '$') // "$1,000.00"
 */
export function formatCurrency(amount: number, currency: string = DEFAULT_CURRENCY): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency}0.00`;
  }

  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${currency}${formatted}`;
}

/**
 * Sanitizes text for safe output in PDFs
 * Escapes special characters and handles null/undefined
 * @param text - Text to sanitize
 * @returns Sanitized text
 *
 * @example
 * sanitizeText('Hello\nWorld') // "Hello World"
 * sanitizeText(null) // "N/A"
 */
export function sanitizeText(text: string | null | undefined): string {
  if (text == null || text === '') {
    return DEFAULT_FALLBACK;
  }

  return String(text)
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
    .trim();
}

/**
 * Normalizes a variable name to lowercase for case-insensitive matching
 * @param varName - Variable name to normalize
 * @returns Normalized variable name
 *
 * @example
 * normalizeVariableName('CompanyName') // 'companyname'
 * normalizeVariableName('  clientEmail  ') // 'clientemail'
 */
function normalizeVariableName(varName: string): string {
  return varName.trim().toLowerCase();
}

// ==========================================
// VARIABLE RESOLUTION
// ==========================================

/**
 * Resolves a variable value from the context
 * Handles nested object access and provides fallback values
 * @param varName - Variable name to resolve
 * @param context - Variable context with quote and company data
 * @returns Resolved value or fallback
 */
function resolveVariable(varName: string, context: VariableContext): string {
  const normalizedName = normalizeVariableName(varName);
  const { company, quote } = context;

  // Company variables
  if (normalizedName === 'companyname') {
    return sanitizeText(company?.name);
  }
  if (normalizedName === 'companyemail') {
    return sanitizeText(company?.email);
  }
  if (normalizedName === 'companyphone') {
    return sanitizeText(company?.phone);
  }
  if (normalizedName === 'companywebsite') {
    return sanitizeText(company?.website);
  }
  if (normalizedName === 'companyaddress') {
    return sanitizeText(company?.address);
  }
  if (normalizedName === 'logourl') {
    return sanitizeText(company?.logoUrl);
  }

  // Quote variables
  if (normalizedName === 'quotenumber') {
    return sanitizeText(quote.quoteNumber);
  }
  if (normalizedName === 'quotedate' || normalizedName === 'date') {
    return formatDate(quote.createdAt, 'long');
  }
  if (normalizedName === 'quotetitle') {
    return sanitizeText(quote.title);
  }
  if (normalizedName === 'quotestatus' || normalizedName === 'status') {
    return sanitizeText(quote.status);
  }

  // Client variables
  if (normalizedName === 'clientname') {
    return sanitizeText(quote.client?.name);
  }
  if (normalizedName === 'clientemail') {
    return sanitizeText(quote.client?.email);
  }
  if (normalizedName === 'clientphone') {
    return sanitizeText(quote.client?.phone);
  }
  if (normalizedName === 'clientaddress') {
    return sanitizeText(quote.client?.address);
  }

  // Financial variables
  const currencyFormatter = context.formatCurrency || formatCurrency;

  if (normalizedName === 'subtotal') {
    return currencyFormatter(quote.subtotal);
  }
  if (normalizedName === 'discount') {
    return currencyFormatter(quote.discount);
  }
  if (normalizedName === 'tax') {
    return currencyFormatter(quote.tax);
  }
  if (normalizedName === 'taxrate') {
    return `${quote.taxRate}%`;
  }
  if (normalizedName === 'grandtotal') {
    return currencyFormatter(quote.grandTotal);
  }
  if (normalizedName === 'currency') {
    return DEFAULT_CURRENCY;
  }

  // Metadata variables
  if (normalizedName === 'itemcount') {
    return String(quote.items?.length || 0);
  }
  if (normalizedName === 'categorycount') {
    const uniqueCategories = new Set(
      quote.items?.map(item => item.product?.category?.id).filter(Boolean) || []
    );
    return String(uniqueCategories.size);
  }
  if (normalizedName === 'currentdate') {
    return formatDate(new Date(), 'long');
  }
  if (normalizedName === 'currenttime') {
    return formatTime(new Date(), '12h');
  }

  // Variable not found - return the original placeholder
  return `{{${varName}}}`;
}

// ==========================================
// INTERPOLATION FUNCTIONS
// ==========================================

/**
 * Replaces {{variable}} placeholders in text with actual values
 * Supports case-insensitive matching and escaped braces
 *
 * @param text - Text containing variable placeholders
 * @param context - Variable context with quote and company data
 * @returns Text with variables replaced
 *
 * @example
 * interpolateVariables('Quote #{{quoteNumber}}', context)
 * // "Quote #Q-2024-001"
 *
 * interpolateVariables('Total: {{grandTotal}}', context)
 * // "Total: ₹11,210.00"
 *
 * interpolateVariables('Escaped: \\{\\{variable\\}\\}', context)
 * // "Escaped: {{variable}}"
 */
export function interpolateVariables(text: string, context: VariableContext): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Replace escaped braces with placeholders
  let processed = text
    .replace(ESCAPED_OPEN_REGEX, ESCAPE_PLACEHOLDER_OPEN)
    .replace(ESCAPED_CLOSE_REGEX, ESCAPE_PLACEHOLDER_CLOSE);

  // Replace variables
  processed = processed.replace(VARIABLE_REGEX, (match, varName) => {
    return resolveVariable(varName, context);
  });

  // Restore escaped braces
  processed = processed
    .replace(new RegExp(ESCAPE_PLACEHOLDER_OPEN, 'g'), '{{')
    .replace(new RegExp(ESCAPE_PLACEHOLDER_CLOSE, 'g'), '}}');

  return processed;
}

/**
 * Recursively processes an object and interpolates all string values
 * @param obj - Object to process
 * @param context - Variable context
 * @returns Object with interpolated values
 */
function interpolateObject(obj: any, context: VariableContext): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return interpolateVariables(obj, context);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => interpolateObject(item, context));
  }

  if (typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = interpolateObject(obj[key], context);
      }
    }
    return result;
  }

  return obj;
}

/**
 * Processes an entire template and interpolates all variables
 * Handles template metadata, theme, and all element properties
 *
 * @param template - Template JSON configuration
 * @param context - Variable context with quote and company data
 * @returns Template with all variables interpolated
 *
 * @example
 * const processedTemplate = interpolateTemplate(template, {
 *   company: { name: 'Acme Corp', ... },
 *   quote: quoteData
 * });
 */
export function interpolateTemplate(
  template: TemplateJSON,
  context: VariableContext
): TemplateJSON {
  // Create a deep copy to avoid mutating the original
  const templateCopy = JSON.parse(JSON.stringify(template));

  // Interpolate all string values in the template
  return interpolateObject(templateCopy, context) as TemplateJSON;
}

/**
 * Processes a single template element and interpolates its properties
 * Useful for live preview and individual element updates
 *
 * @param element - Template element to process
 * @param context - Variable context
 * @returns Element with interpolated properties
 *
 * @example
 * const processedElement = interpolateElement(headerElement, context);
 */
export function interpolateElement(
  element: TemplateElement,
  context: VariableContext
): TemplateElement {
  const elementCopy = JSON.parse(JSON.stringify(element));
  return interpolateObject(elementCopy, context) as TemplateElement;
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Extracts all variable names used in a text string
 * Useful for validating templates and showing used variables
 *
 * @param text - Text to extract variables from
 * @returns Array of unique variable names
 *
 * @example
 * extractVariables('Hello {{name}}, total: {{total}}')
 * // ['name', 'total']
 */
export function extractVariables(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  const matches = text.matchAll(VARIABLE_REGEX);
  const variables = Array.from(matches, match => match[1].trim());

  // Return unique variables
  return Array.from(new Set(variables));
}

/**
 * Validates if all variables in a text string are supported
 * Returns list of unsupported variables
 *
 * @param text - Text to validate
 * @returns Array of unsupported variable names
 *
 * @example
 * validateVariables('{{companyName}} {{invalidVar}}')
 * // ['invalidVar']
 */
export function validateVariables(text: string): string[] {
  const variables = extractVariables(text);
  const supportedVars = new Set(
    getAvailableVariables().map(v => normalizeVariableName(v.key))
  );

  return variables.filter(v => !supportedVars.has(normalizeVariableName(v)));
}

/**
 * Checks if a template uses any variables
 *
 * @param template - Template to check
 * @returns True if template contains variables
 */
export function hasVariables(template: TemplateJSON): boolean {
  const templateStr = JSON.stringify(template);
  return VARIABLE_REGEX.test(templateStr);
}

// ==========================================
// TESTING EXAMPLES (in comments)
// ==========================================

/*
UNIT TEST EXAMPLES:

// Test 1: Basic variable interpolation
const context: VariableContext = {
  company: {
    name: 'Acme Corp',
    email: 'info@acme.com',
    phone: '+1234567890',
    website: 'www.acme.com',
    address: '123 Main St',
    logoUrl: '/logo.png',
  },
  quote: {
    quoteNumber: 'Q-2024-001',
    title: 'Test Quote',
    status: 'DRAFT',
    subtotal: 10000,
    discount: 500,
    tax: 1710,
    taxRate: 18,
    grandTotal: 11210,
    createdAt: new Date('2024-01-15'),
    client: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+9876543210',
      address: '456 Oak Ave',
    },
    items: [
      { product: { category: { id: '1' } } },
      { product: { category: { id: '2' } } },
    ],
  } as any,
};

// Test basic interpolation
console.assert(
  interpolateVariables('Hello {{companyName}}!', context) === 'Hello Acme Corp!',
  'Basic variable interpolation failed'
);

// Test case insensitivity
console.assert(
  interpolateVariables('{{CompanyName}} {{COMPANYNAME}}', context) === 'Acme Corp Acme Corp',
  'Case insensitive matching failed'
);

// Test currency formatting
console.assert(
  interpolateVariables('Total: {{grandTotal}}', context).includes('₹'),
  'Currency formatting failed'
);

// Test fallback for missing data
console.assert(
  interpolateVariables('{{missingVar}}', context) === '{{missingVar}}',
  'Fallback for missing variable failed'
);

// Test escaped braces
console.assert(
  interpolateVariables('Use \\{\\{variable\\}\\} syntax', context) === 'Use {{variable}} syntax',
  'Escaped braces failed'
);

// Test metadata variables
console.assert(
  interpolateVariables('Items: {{itemCount}}', context) === 'Items: 2',
  'Item count failed'
);

console.assert(
  interpolateVariables('Categories: {{categoryCount}}', context) === 'Categories: 2',
  'Category count failed'
);

// Test date formatting
const dateText = interpolateVariables('Date: {{quoteDate}}', context);
console.assert(
  dateText.includes('January'),
  'Date formatting failed'
);

// Test variable extraction
const extracted = extractVariables('{{name}} and {{email}}');
console.assert(
  extracted.length === 2 && extracted.includes('name') && extracted.includes('email'),
  'Variable extraction failed'
);

// Test variable validation
const invalid = validateVariables('{{companyName}} {{invalidVar}}');
console.assert(
  invalid.length === 1 && invalid[0] === 'invalidVar',
  'Variable validation failed'
);

console.log('All tests passed!');
*/
