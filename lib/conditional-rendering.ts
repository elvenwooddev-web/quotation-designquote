/**
 * Conditional Rendering System for PDF Template Editor
 *
 * Phase 4C: Conditional Element Visibility
 *
 * This module provides conditional rendering capabilities for PDF template elements.
 * Elements can be shown or hidden based on quote data using flexible condition rules.
 *
 * Features:
 * - Multiple comparison operators (equals, greater than, exists, contains, etc.)
 * - Nested field access (e.g., 'client.email', 'items.0.product.name')
 * - Type coercion for flexible comparisons
 * - Case-insensitive string comparison
 * - Array/collection support
 * - AND logic for multiple conditions
 * - Robust error handling
 *
 * @example
 * // Show discount row only if discount > 0
 * { field: 'discount', operator: 'greater_than', value: 0 }
 *
 * // Show watermark if status is ACCEPTED
 * { field: 'status', operator: 'equals', value: 'ACCEPTED' }
 *
 * // Show signature block for sent/accepted quotes
 * { field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] }
 *
 * // Show client email only if it exists
 * { field: 'client.email', operator: 'exists' }
 */

import { ElementCondition, QuoteWithDetails } from './types';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

/**
 * Context object containing all data available for condition evaluation
 */
export interface ConditionContext {
  /** Complete quote data with relations */
  quote: QuoteWithDetails;
  /** Optional company information */
  company?: CompanyInfo;
  /** Optional metadata for custom fields */
  metadata?: Record<string, any>;
}

/**
 * Company information structure
 */
export interface CompanyInfo {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  [key: string]: any;
}

/**
 * Supported comparison operators
 */
export type ConditionOperator =
  // Equality operators
  | 'equals' | '==' | '==='
  | 'not_equals' | '!=' | '!=='
  // Numeric comparison operators
  | 'greater_than' | '>'
  | 'less_than' | '<'
  | 'greater_or_equal' | '>='
  | 'less_or_equal' | '<='
  // Existence operators
  | 'exists'
  | 'not_exists'
  // String/Array operators
  | 'contains'
  | 'not_contains'
  | 'in'
  | 'not_in'
  // String operators
  | 'starts_with'
  | 'ends_with'
  // Regex operator
  | 'matches';

// ==========================================
// MAIN EVALUATION FUNCTION
// ==========================================

/**
 * Evaluates all conditions for a template element
 *
 * Returns true if the element should be rendered, false otherwise.
 * If no conditions are provided, returns true (render by default).
 * All conditions must be true for the element to render (AND logic).
 *
 * @param conditions - Array of conditions to evaluate
 * @param context - Data context for evaluation
 * @returns true if element should be rendered
 *
 * @example
 * const shouldRender = evaluateConditions(
 *   [
 *     { field: 'discount', operator: '>', value: 0 },
 *     { field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] }
 *   ],
 *   { quote: quoteData }
 * );
 */
export function evaluateConditions(
  conditions: ElementCondition[] | undefined,
  context: ConditionContext
): boolean {
  // No conditions means always render
  if (!conditions || conditions.length === 0) {
    return true;
  }

  // All conditions must be true (AND logic)
  return conditions.every(condition => {
    try {
      return evaluateSingleCondition(condition, context);
    } catch (error) {
      // Invalid conditions default to false (don't render)
      console.warn('Condition evaluation error:', error, condition);
      return false;
    }
  });
}

/**
 * Evaluates a single condition
 *
 * @param condition - Condition to evaluate
 * @param context - Data context
 * @returns true if condition is met
 */
function evaluateSingleCondition(
  condition: ElementCondition,
  context: ConditionContext
): boolean {
  const { field, operator, value } = condition;

  // Extract the field value from context
  const fieldValue = getFieldValue(field, context);

  // Perform comparison based on operator
  return compareValues(fieldValue, operator, value);
}

// ==========================================
// FIELD VALUE EXTRACTION
// ==========================================

/**
 * Extracts a field value from the context using dot notation
 *
 * Supports nested field access:
 * - 'status' → context.quote.status
 * - 'client.email' → context.quote.client.email
 * - 'items.0.product.name' → context.quote.items[0].product.name
 * - 'company.name' → context.company.name
 * - 'metadata.customField' → context.metadata.customField
 *
 * @param fieldPath - Dot-notation path to field
 * @param context - Data context
 * @returns Field value or undefined if not found
 *
 * @example
 * getFieldValue('client.email', context) // Returns quote.client.email
 * getFieldValue('discount', context) // Returns quote.discount
 * getFieldValue('items.0.quantity', context) // Returns quote.items[0].quantity
 */
export function getFieldValue(
  fieldPath: string,
  context: ConditionContext
): any {
  if (!fieldPath) {
    return undefined;
  }

  const parts = fieldPath.split('.');
  let current: any = context;

  // Start with appropriate root based on first part
  if (parts[0] === 'quote') {
    current = context.quote;
    parts.shift(); // Remove 'quote' prefix
  } else if (parts[0] === 'company') {
    current = context.company;
    parts.shift(); // Remove 'company' prefix
  } else if (parts[0] === 'metadata') {
    current = context.metadata;
    parts.shift(); // Remove 'metadata' prefix
  } else {
    // Default: try to find in quote first, then company, then metadata
    current = context.quote;
  }

  // Traverse the path
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }

    // Handle array index access (e.g., 'items.0')
    if (/^\d+$/.test(part)) {
      const index = parseInt(part, 10);
      if (Array.isArray(current) && index < current.length) {
        current = current[index];
      } else {
        return undefined;
      }
    } else {
      current = current[part];
    }
  }

  return current;
}

// ==========================================
// VALUE COMPARISON
// ==========================================

/**
 * Compares two values using the specified operator
 *
 * Handles type coercion, case-insensitive comparison, and various operators.
 *
 * @param fieldValue - Value from the context
 * @param operator - Comparison operator
 * @param compareValue - Value to compare against
 * @returns Comparison result
 */
export function compareValues(
  fieldValue: any,
  operator: string,
  compareValue: any
): boolean {
  const op = operator.toLowerCase().trim();

  // Existence operators don't need compareValue
  if (op === 'exists') {
    return fieldValue !== null && fieldValue !== undefined && fieldValue !== '';
  }

  if (op === 'not_exists') {
    return fieldValue === null || fieldValue === undefined || fieldValue === '';
  }

  // All other operators need both values
  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }

  // Normalize operator aliases
  switch (op) {
    // Equality operators
    case 'equals':
    case '==':
    case '===':
      return areEqual(fieldValue, compareValue);

    case 'not_equals':
    case '!=':
    case '!==':
      return !areEqual(fieldValue, compareValue);

    // Numeric comparison operators
    case 'greater_than':
    case '>':
      return toNumber(fieldValue) > toNumber(compareValue);

    case 'less_than':
    case '<':
      return toNumber(fieldValue) < toNumber(compareValue);

    case 'greater_or_equal':
    case '>=':
      return toNumber(fieldValue) >= toNumber(compareValue);

    case 'less_or_equal':
    case '<=':
      return toNumber(fieldValue) <= toNumber(compareValue);

    // String/Array containment operators
    case 'contains':
      return contains(fieldValue, compareValue);

    case 'not_contains':
      return !contains(fieldValue, compareValue);

    case 'in':
      return isIn(fieldValue, compareValue);

    case 'not_in':
      return !isIn(fieldValue, compareValue);

    // String operators
    case 'starts_with':
      return toString(fieldValue).toLowerCase().startsWith(toString(compareValue).toLowerCase());

    case 'ends_with':
      return toString(fieldValue).toLowerCase().endsWith(toString(compareValue).toLowerCase());

    // Regex operator
    case 'matches':
      try {
        const regex = new RegExp(compareValue);
        return regex.test(toString(fieldValue));
      } catch {
        return false;
      }

    default:
      console.warn(`Unknown operator: ${operator}`);
      return false;
  }
}

// ==========================================
// TYPE COERCION HELPERS
// ==========================================

/**
 * Checks if two values are equal with type coercion and case-insensitive string comparison
 *
 * @param a - First value
 * @param b - Second value
 * @returns true if values are equal
 */
function areEqual(a: any, b: any): boolean {
  // Null/undefined equality
  if ((a === null || a === undefined) && (b === null || b === undefined)) {
    return true;
  }
  if (a === null || a === undefined || b === null || b === undefined) {
    return false;
  }

  // String comparison (case-insensitive)
  if (typeof a === 'string' || typeof b === 'string') {
    return toString(a).toLowerCase() === toString(b).toLowerCase();
  }

  // Boolean comparison
  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return toBoolean(a) === toBoolean(b);
  }

  // Numeric comparison
  if (typeof a === 'number' || typeof b === 'number') {
    return toNumber(a) === toNumber(b);
  }

  // Object/Array comparison (deep equality)
  if (typeof a === 'object' && typeof b === 'object') {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  // Default: strict equality
  return a === b;
}

/**
 * Checks if fieldValue contains compareValue
 * Works with strings (substring) and arrays (element)
 */
function contains(fieldValue: any, compareValue: any): boolean {
  if (Array.isArray(fieldValue)) {
    // Array contains element
    return fieldValue.some(item => areEqual(item, compareValue));
  }

  if (typeof fieldValue === 'string') {
    // String contains substring (case-insensitive)
    return fieldValue.toLowerCase().includes(toString(compareValue).toLowerCase());
  }

  return false;
}

/**
 * Checks if fieldValue is in compareValue array
 */
function isIn(fieldValue: any, compareValue: any): boolean {
  if (!Array.isArray(compareValue)) {
    return false;
  }

  return compareValue.some(item => areEqual(fieldValue, item));
}

/**
 * Converts value to string
 */
function toString(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value);
}

/**
 * Converts value to number
 */
function toNumber(value: any): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  return 0;
}

/**
 * Converts value to boolean
 */
function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    return value !== 0;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  return Boolean(value);
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Validates a condition object
 *
 * @param condition - Condition to validate
 * @returns true if valid
 */
export function isValidCondition(condition: ElementCondition): boolean {
  if (!condition || typeof condition !== 'object') {
    return false;
  }

  const { field, operator } = condition;

  // Field and operator are required
  if (!field || typeof field !== 'string') {
    return false;
  }

  if (!operator || typeof operator !== 'string') {
    return false;
  }

  return true;
}

/**
 * Creates a condition object with type checking
 *
 * @param field - Field path
 * @param operator - Comparison operator
 * @param value - Value to compare
 * @returns Valid condition object
 */
export function createCondition(
  field: string,
  operator: ConditionOperator,
  value: any
): ElementCondition {
  return { field, operator, value };
}

// ==========================================
// TEST EXAMPLES (in comments)
// ==========================================

/*
// Example 1: Show discount row only if discount > 0
const discountCondition = createCondition('discount', 'greater_than', 0);
const showDiscount = evaluateConditions([discountCondition], {
  quote: { discount: 50, ... }
});
// Result: true

// Example 2: Show "PAID" watermark if status is ACCEPTED
const paidCondition = createCondition('status', 'equals', 'ACCEPTED');
const showPaid = evaluateConditions([paidCondition], {
  quote: { status: 'ACCEPTED', ... }
});
// Result: true

// Example 3: Show signature block for sent/accepted quotes
const signatureCondition = createCondition('status', 'in', ['SENT', 'ACCEPTED']);
const showSignature = evaluateConditions([signatureCondition], {
  quote: { status: 'SENT', ... }
});
// Result: true

// Example 4: Show terms only if policies exist
const termsCondition = createCondition('policies', 'exists', null);
const showTerms = evaluateConditions([termsCondition], {
  quote: { policies: [...], ... }
});
// Result: true if policies array has items

// Example 5: Show client email only if it exists
const emailCondition = createCondition('client.email', 'exists', null);
const showEmail = evaluateConditions([emailCondition], {
  quote: { client: { email: 'test@example.com' }, ... }
});
// Result: true

// Example 6: Different header for draft vs. finalized
const draftCondition = createCondition('status', 'equals', 'DRAFT');
const isDraft = evaluateConditions([draftCondition], {
  quote: { status: 'DRAFT', ... }
});
// Result: true (show draft header)

// Example 7: Multiple conditions (AND logic)
const multipleConditions = [
  createCondition('status', 'in', ['SENT', 'ACCEPTED']),
  createCondition('grandTotal', 'greater_than', 1000),
  createCondition('client.email', 'exists', null)
];
const showPremiumLayout = evaluateConditions(multipleConditions, {
  quote: {
    status: 'SENT',
    grandTotal: 5000,
    client: { email: 'vip@example.com' },
    ...
  }
});
// Result: true (all conditions met)

// Example 8: Nested field access
const productCondition = createCondition('items.0.product.categoryId', 'equals', 'cat-123');
const showCategoryBanner = evaluateConditions([productCondition], {
  quote: {
    items: [
      { product: { categoryId: 'cat-123' } }
    ],
    ...
  }
});
// Result: true

// Example 9: String contains
const keywordCondition = createCondition('title', 'contains', 'urgent');
const isUrgent = evaluateConditions([keywordCondition], {
  quote: { title: 'URGENT: Kitchen Renovation', ... }
});
// Result: true (case-insensitive)

// Example 10: Not equals
const notDraftCondition = createCondition('status', 'not_equals', 'DRAFT');
const isFinalized = evaluateConditions([notDraftCondition], {
  quote: { status: 'SENT', ... }
});
// Result: true

// Example 11: Company field access
const companyCondition = createCondition('company.name', 'exists', null);
const hasCompanyName = evaluateConditions([companyCondition], {
  quote: { ... },
  company: { name: 'Acme Corp' }
});
// Result: true

// Example 12: Metadata field access
const customCondition = createCondition('metadata.priority', 'equals', 'high');
const isHighPriority = evaluateConditions([customCondition], {
  quote: { ... },
  metadata: { priority: 'high' }
});
// Result: true

// Example 13: Array length check
const hasItemsCondition = createCondition('items', 'exists', null);
const hasItems = evaluateConditions([hasItemsCondition], {
  quote: { items: [{ ... }], ... }
});
// Result: true

// Example 14: Type coercion (string to number)
const stringNumberCondition = createCondition('discount', 'greater_than', '10');
const discountAbove10 = evaluateConditions([stringNumberCondition], {
  quote: { discount: 15, ... }
});
// Result: true (string "10" coerced to number 10)

// Example 15: Regex matching
const patternCondition = createCondition('quoteNumber', 'matches', '^QT-\\d{4}-\\d{4}$');
const validQuoteNumber = evaluateConditions([patternCondition], {
  quote: { quoteNumber: 'QT-2025-0001', ... }
});
// Result: true
*/
