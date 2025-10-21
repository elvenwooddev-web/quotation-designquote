/**
 * Conditional Rendering Test Examples
 *
 * This file demonstrates how to use the conditional rendering system
 * with real-world examples and edge cases.
 */

import {
  evaluateConditions,
  getFieldValue,
  compareValues,
  createCondition,
  isValidCondition,
  type ConditionContext,
} from './conditional-rendering';
import type { QuoteWithDetails, QuoteStatus } from './types';

// ==========================================
// MOCK DATA FOR TESTING
// ==========================================

const mockQuote: Partial<QuoteWithDetails> = {
  id: 'quote-1',
  title: 'Kitchen Renovation Quote',
  quoteNumber: 'QT-2025-0001',
  status: 'SENT' as QuoteStatus,
  discount: 150,
  grandTotal: 5000,
  subtotal: 4500,
  tax: 650,
  taxRate: 13,
  overallDiscount: 150,
  client: {
    id: 'client-1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '555-1234',
    address: '123 Main St',
    source: 'website',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  items: [
    {
      id: 'item-1',
      quoteId: 'quote-1',
      productId: 'prod-1',
      description: 'Kitchen Cabinet',
      quantity: 5,
      rate: 500,
      discount: 50,
      lineTotal: 2250,
      order: 1,
      dimensions: { length: 10, width: 2 },
      createdAt: new Date(),
      updatedAt: new Date(),
      product: {
        id: 'prod-1',
        name: 'Kitchen Cabinet',
        description: 'Premium cabinet',
        unit: 'pcs',
        baseRate: 500,
        categoryId: 'cat-kitchen',
        imageUrl: null,
        itemCode: 'KC-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-kitchen',
          name: 'Kitchen',
          description: 'Kitchen items',
          imageUrl: null,
          order: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  ],
  policies: [
    {
      id: 'policy-1',
      quoteId: 'quote-1',
      type: 'WARRANTY',
      title: '1 Year Warranty',
      description: 'All products come with a 1-year warranty',
      isActive: true,
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockContext: ConditionContext = {
  quote: mockQuote as QuoteWithDetails,
  company: {
    name: 'Acme Corp',
    email: 'info@acme.com',
    phone: '555-0000',
    logo: 'https://example.com/logo.png',
  },
  metadata: {
    priority: 'high',
    salesPerson: 'Jane Smith',
    department: 'Sales',
  },
};

// ==========================================
// TEST CASES
// ==========================================

console.log('='.repeat(60));
console.log('CONDITIONAL RENDERING TEST SUITE');
console.log('='.repeat(60));

// Test 1: Show discount row only if discount > 0
console.log('\n1. Show discount row (discount > 0):');
const test1 = evaluateConditions(
  [createCondition('discount', 'greater_than', 0)],
  mockContext
);
console.log(`   Discount: ${mockQuote.discount}, Result: ${test1}`); // Expected: true

// Test 2: Show "PAID" watermark if status is ACCEPTED
console.log('\n2. Show PAID watermark (status === ACCEPTED):');
const test2 = evaluateConditions(
  [createCondition('status', 'equals', 'ACCEPTED')],
  mockContext
);
console.log(`   Status: ${mockQuote.status}, Result: ${test2}`); // Expected: false

// Test 3: Show signature block for sent/accepted quotes
console.log('\n3. Show signature (status in [SENT, ACCEPTED]):');
const test3 = evaluateConditions(
  [createCondition('status', 'in', ['SENT', 'ACCEPTED'])],
  mockContext
);
console.log(`   Status: ${mockQuote.status}, Result: ${test3}`); // Expected: true

// Test 4: Show terms only if policies exist
console.log('\n4. Show terms (policies exist):');
const test4 = evaluateConditions(
  [createCondition('policies', 'exists', null)],
  mockContext
);
console.log(`   Policies count: ${mockQuote.policies?.length}, Result: ${test4}`); // Expected: true

// Test 5: Show client email only if it exists
console.log('\n5. Show client email (client.email exists):');
const test5 = evaluateConditions(
  [createCondition('client.email', 'exists', null)],
  mockContext
);
console.log(`   Email: ${mockQuote.client?.email}, Result: ${test5}`); // Expected: true

// Test 6: Different header for draft vs. finalized
console.log('\n6. Is draft (status === DRAFT):');
const test6 = evaluateConditions(
  [createCondition('status', 'equals', 'DRAFT')],
  mockContext
);
console.log(`   Status: ${mockQuote.status}, Result: ${test6}`); // Expected: false

// Test 7: Multiple conditions (AND logic)
console.log('\n7. Multiple conditions (premium quote):');
const test7 = evaluateConditions(
  [
    createCondition('status', 'in', ['SENT', 'ACCEPTED']),
    createCondition('grandTotal', 'greater_than', 1000),
    createCondition('client.email', 'exists', null),
  ],
  mockContext
);
console.log(`   All conditions met: ${test7}`); // Expected: true

// Test 8: Nested field access
console.log('\n8. Nested field (items.0.product.categoryId):');
const categoryId = getFieldValue('items.0.product.categoryId', mockContext);
const test8 = evaluateConditions(
  [createCondition('items.0.product.categoryId', 'equals', 'cat-kitchen')],
  mockContext
);
console.log(`   Category ID: ${categoryId}, Result: ${test8}`); // Expected: true

// Test 9: String contains (case-insensitive)
console.log('\n9. String contains (title contains "kitchen"):');
const test9 = evaluateConditions(
  [createCondition('title', 'contains', 'kitchen')],
  mockContext
);
console.log(`   Title: "${mockQuote.title}", Result: ${test9}`); // Expected: true

// Test 10: Not equals
console.log('\n10. Not equals (status != DRAFT):');
const test10 = evaluateConditions(
  [createCondition('status', 'not_equals', 'DRAFT')],
  mockContext
);
console.log(`   Status: ${mockQuote.status}, Result: ${test10}`); // Expected: true

// Test 11: Company field access
console.log('\n11. Company name exists:');
const test11 = evaluateConditions(
  [createCondition('company.name', 'exists', null)],
  mockContext
);
console.log(`   Company: ${mockContext.company?.name}, Result: ${test11}`); // Expected: true

// Test 12: Metadata field access
console.log('\n12. Metadata priority (priority === high):');
const test12 = evaluateConditions(
  [createCondition('metadata.priority', 'equals', 'high')],
  mockContext
);
console.log(`   Priority: ${mockContext.metadata?.priority}, Result: ${test12}`); // Expected: true

// Test 13: Greater than or equal
console.log('\n13. Grand total >= 5000:');
const test13 = evaluateConditions(
  [createCondition('grandTotal', 'greater_or_equal', 5000)],
  mockContext
);
console.log(`   Grand Total: ${mockQuote.grandTotal}, Result: ${test13}`); // Expected: true

// Test 14: Type coercion (string to number)
console.log('\n14. Type coercion (discount > "100"):');
const test14 = evaluateConditions(
  [createCondition('discount', 'greater_than', '100')],
  mockContext
);
console.log(`   Discount: ${mockQuote.discount}, Result: ${test14}`); // Expected: true

// Test 15: Starts with
console.log('\n15. Quote number starts with "QT-":');
const test15 = evaluateConditions(
  [createCondition('quoteNumber', 'starts_with', 'QT-')],
  mockContext
);
console.log(`   Quote Number: ${mockQuote.quoteNumber}, Result: ${test15}`); // Expected: true

// Test 16: Not contains
console.log('\n16. Title does not contain "urgent":');
const test16 = evaluateConditions(
  [createCondition('title', 'not_contains', 'urgent')],
  mockContext
);
console.log(`   Title: "${mockQuote.title}", Result: ${test16}`); // Expected: true

// Test 17: Not in
console.log('\n17. Status not in [DRAFT, REJECTED]:');
const test17 = evaluateConditions(
  [createCondition('status', 'not_in', ['DRAFT', 'REJECTED'])],
  mockContext
);
console.log(`   Status: ${mockQuote.status}, Result: ${test17}`); // Expected: true

// Test 18: Less than
console.log('\n18. Tax rate < 15:');
const test18 = evaluateConditions(
  [createCondition('taxRate', 'less_than', 15)],
  mockContext
);
console.log(`   Tax Rate: ${mockQuote.taxRate}, Result: ${test18}`); // Expected: true

// Test 19: Field doesn't exist
console.log('\n19. Non-existent field:');
const test19 = evaluateConditions(
  [createCondition('nonExistentField', 'exists', null)],
  mockContext
);
console.log(`   Result: ${test19}`); // Expected: false

// Test 20: Invalid condition (should default to false)
console.log('\n20. Invalid operator:');
const test20 = compareValues(100, 'invalid_operator', 50);
console.log(`   Result: ${test20}`); // Expected: false

// Test 21: Validation test
console.log('\n21. Condition validation:');
const validCondition = createCondition('status', 'equals', 'SENT');
const invalidCondition = { field: '', operator: 'equals', value: 'test' };
console.log(`   Valid: ${isValidCondition(validCondition)}`); // Expected: true
console.log(`   Invalid: ${isValidCondition(invalidCondition as any)}`); // Expected: false

// Test 22: Empty conditions (should render)
console.log('\n22. Empty conditions (default render):');
const test22 = evaluateConditions([], mockContext);
console.log(`   Result: ${test22}`); // Expected: true

// Test 23: Undefined conditions (should render)
console.log('\n23. Undefined conditions (default render):');
const test23 = evaluateConditions(undefined, mockContext);
console.log(`   Result: ${test23}`); // Expected: true

console.log('\n' + '='.repeat(60));
console.log('TEST SUITE COMPLETE');
console.log('='.repeat(60));

// ==========================================
// PRACTICAL USE CASE EXAMPLES
// ==========================================

console.log('\n\nPRACTICAL USE CASES:');
console.log('='.repeat(60));

// Use Case 1: Conditional discount row in template
console.log('\n1. DISCOUNT ROW - Show only if discount > 0:');
const showDiscountRow = evaluateConditions(
  [{ field: 'discount', operator: '>', value: 0 }],
  mockContext
);
console.log(`   Show discount row: ${showDiscountRow}`);

// Use Case 2: Status-specific watermark
console.log('\n2. WATERMARK - Show "PAID" if status is ACCEPTED:');
const showPaidWatermark = evaluateConditions(
  [{ field: 'status', operator: 'equals', value: 'ACCEPTED' }],
  mockContext
);
console.log(`   Show PAID watermark: ${showPaidWatermark}`);

// Use Case 3: Signature block visibility
console.log('\n3. SIGNATURE - Show for SENT or ACCEPTED quotes:');
const showSignatureBlock = evaluateConditions(
  [{ field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] }],
  mockContext
);
console.log(`   Show signature block: ${showSignatureBlock}`);

// Use Case 4: Terms and conditions
console.log('\n4. TERMS - Show only if policies exist:');
const showTerms = evaluateConditions(
  [{ field: 'policies', operator: 'exists', value: null }],
  mockContext
);
console.log(`   Show terms: ${showTerms}`);

// Use Case 5: Client email field
console.log('\n5. CLIENT EMAIL - Show only if email exists:');
const showClientEmail = evaluateConditions(
  [{ field: 'client.email', operator: 'exists', value: null }],
  mockContext
);
console.log(`   Show client email: ${showClientEmail}`);

// Use Case 6: Draft vs finalized header
console.log('\n6. DRAFT HEADER - Different header for DRAFT status:');
const showDraftHeader = evaluateConditions(
  [{ field: 'status', operator: 'equals', value: 'DRAFT' }],
  mockContext
);
const showFinalHeader = evaluateConditions(
  [{ field: 'status', operator: 'not_equals', value: 'DRAFT' }],
  mockContext
);
console.log(`   Show draft header: ${showDraftHeader}`);
console.log(`   Show final header: ${showFinalHeader}`);

// Use Case 7: High-value quote special layout
console.log('\n7. PREMIUM LAYOUT - For quotes > $10,000:');
const showPremiumLayout = evaluateConditions(
  [{ field: 'grandTotal', operator: '>', value: 10000 }],
  mockContext
);
console.log(`   Show premium layout: ${showPremiumLayout}`);

// Use Case 8: Category-specific elements
console.log('\n8. CATEGORY BANNER - Show for specific category:');
const showKitchenBanner = evaluateConditions(
  [{ field: 'items.0.product.category.name', operator: 'equals', value: 'Kitchen' }],
  mockContext
);
console.log(`   Show kitchen banner: ${showKitchenBanner}`);

console.log('\n' + '='.repeat(60));
