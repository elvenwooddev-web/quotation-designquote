# Conditional Rendering System

**Phase 4C: Conditional Element Visibility for PDF Template Editor**

## Overview

The conditional rendering system allows PDF template elements to be shown or hidden based on quote data. This enables dynamic templates that adapt to different quote states, values, and conditions.

## Features

- **12 Comparison Operators**: equals, not equals, greater than, less than, contains, exists, in, and more
- **Nested Field Access**: Access deeply nested fields using dot notation (e.g., `client.email`, `items.0.product.name`)
- **Type Coercion**: Automatic type conversion for flexible comparisons (string "0" === number 0)
- **Case-Insensitive Strings**: String comparisons ignore case
- **Array Support**: Check if values are in arrays or arrays contain values
- **AND Logic**: Multiple conditions must all be true
- **Error Handling**: Invalid conditions safely default to false (hide element)

## Installation

The module is located at `lib/conditional-rendering.ts`. Import the functions you need:

```typescript
import {
  evaluateConditions,
  createCondition,
  getFieldValue,
  type ConditionContext
} from '@/lib/conditional-rendering';
```

## Quick Start

### Basic Example

```typescript
import { evaluateConditions } from '@/lib/conditional-rendering';

// Show element only if discount > 0
const shouldRender = evaluateConditions(
  [{ field: 'discount', operator: 'greater_than', value: 0 }],
  { quote: quoteData }
);
```

### Template Integration

```typescript
// In your template element definition
{
  id: 'discount-row',
  type: 'summaryRow',
  order: 5,
  properties: { label: 'Discount', field: 'discount' },
  conditions: [
    { field: 'discount', operator: 'greater_than', value: 0 }
  ]
}

// When rendering
if (evaluateConditions(element.conditions, { quote })) {
  // Render the element
  renderElement(element);
}
```

## API Reference

### Main Functions

#### `evaluateConditions(conditions, context)`

Evaluates all conditions for a template element. Returns `true` if element should be rendered.

**Parameters:**
- `conditions` (ElementCondition[] | undefined) - Array of conditions to evaluate
- `context` (ConditionContext) - Data context containing quote, company, and metadata

**Returns:** `boolean` - true if element should be rendered

**Behavior:**
- No conditions = always render (returns `true`)
- Empty array = always render (returns `true`)
- All conditions must be true (AND logic)
- Invalid conditions default to `false`

**Example:**
```typescript
const shouldRender = evaluateConditions(
  [
    { field: 'status', operator: 'equals', value: 'SENT' },
    { field: 'grandTotal', operator: '>', value: 1000 }
  ],
  { quote }
);
```

#### `createCondition(field, operator, value)`

Helper function to create a type-safe condition object.

**Parameters:**
- `field` (string) - Field path using dot notation
- `operator` (ConditionOperator) - Comparison operator
- `value` (any) - Value to compare against

**Returns:** `ElementCondition`

**Example:**
```typescript
const condition = createCondition('discount', 'greater_than', 0);
```

#### `getFieldValue(fieldPath, context)`

Extracts a field value from the context using dot notation.

**Parameters:**
- `fieldPath` (string) - Dot-notation path to field
- `context` (ConditionContext) - Data context

**Returns:** `any` - Field value or undefined if not found

**Example:**
```typescript
const email = getFieldValue('client.email', context);
const categoryId = getFieldValue('items.0.product.categoryId', context);
```

#### `compareValues(fieldValue, operator, compareValue)`

Compares two values using the specified operator.

**Parameters:**
- `fieldValue` (any) - Value from the context
- `operator` (string) - Comparison operator
- `compareValue` (any) - Value to compare against

**Returns:** `boolean` - Comparison result

#### `isValidCondition(condition)`

Validates a condition object.

**Parameters:**
- `condition` (ElementCondition) - Condition to validate

**Returns:** `boolean` - true if valid

## Operators

### Equality Operators

| Operator | Aliases | Description | Example |
|----------|---------|-------------|---------|
| `equals` | `==`, `===` | Value equality (case-insensitive for strings) | `{ field: 'status', operator: 'equals', value: 'SENT' }` |
| `not_equals` | `!=`, `!==` | Value inequality | `{ field: 'status', operator: '!=', value: 'DRAFT' }` |

### Numeric Comparison Operators

| Operator | Aliases | Description | Example |
|----------|---------|-------------|---------|
| `greater_than` | `>` | Numeric greater than | `{ field: 'grandTotal', operator: '>', value: 1000 }` |
| `less_than` | `<` | Numeric less than | `{ field: 'discount', operator: '<', value: 100 }` |
| `greater_or_equal` | `>=` | Greater than or equal | `{ field: 'taxRate', operator: '>=', value: 10 }` |
| `less_or_equal` | `<=` | Less than or equal | `{ field: 'items.length', operator: '<=', value: 5 }` |

### Existence Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `exists` | Field is not null/undefined/empty | `{ field: 'client.email', operator: 'exists' }` |
| `not_exists` | Field is null/undefined/empty | `{ field: 'client.phone', operator: 'not_exists' }` |

### String/Array Operators

| Operator | Description | Example |
|----------|-------------|---------|
| `contains` | String contains substring or array contains element | `{ field: 'title', operator: 'contains', value: 'urgent' }` |
| `not_contains` | String/array does not contain | `{ field: 'title', operator: 'not_contains', value: 'draft' }` |
| `in` | Value is in array | `{ field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] }` |
| `not_in` | Value not in array | `{ field: 'status', operator: 'not_in', value: ['DRAFT', 'REJECTED'] }` |
| `starts_with` | String starts with value | `{ field: 'quoteNumber', operator: 'starts_with', value: 'QT-' }` |
| `ends_with` | String ends with value | `{ field: 'client.email', operator: 'ends_with', value: '.com' }` |
| `matches` | String matches regex pattern | `{ field: 'quoteNumber', operator: 'matches', value: '^QT-\\d{4}-\\d{4}$' }` |

## Field Access Patterns

### Direct Quote Fields

Access fields directly on the quote object:

```typescript
// Simple fields
{ field: 'status', operator: 'equals', value: 'SENT' }
{ field: 'discount', operator: '>', value: 0 }
{ field: 'grandTotal', operator: '>=', value: 5000 }
```

### Nested Fields (Dot Notation)

Access nested objects using dot notation:

```typescript
// Client fields
{ field: 'client.email', operator: 'exists' }
{ field: 'client.name', operator: 'equals', value: 'John Doe' }

// Product fields
{ field: 'items.0.product.name', operator: 'contains', value: 'Cabinet' }
{ field: 'items.0.product.categoryId', operator: 'equals', value: 'cat-123' }

// Category fields
{ field: 'items.0.product.category.name', operator: 'equals', value: 'Kitchen' }
```

### Array Index Access

Access array elements by index:

```typescript
// First item
{ field: 'items.0.quantity', operator: '>', value: 1 }

// Second item
{ field: 'items.1.rate', operator: '<', value: 1000 }

// First policy
{ field: 'policies.0.type', operator: 'equals', value: 'WARRANTY' }
```

### Company Fields

Access company information:

```typescript
{ field: 'company.name', operator: 'exists' }
{ field: 'company.logo', operator: 'exists' }
```

### Metadata Fields

Access custom metadata:

```typescript
{ field: 'metadata.priority', operator: 'equals', value: 'high' }
{ field: 'metadata.salesPerson', operator: 'exists' }
```

## Common Use Cases

### 1. Show Discount Row Only if Discount Exists

```typescript
{
  id: 'discount-row',
  type: 'summaryRow',
  conditions: [
    { field: 'discount', operator: 'greater_than', value: 0 }
  ]
}
```

### 2. Show "PAID" Watermark for Accepted Quotes

```typescript
{
  id: 'paid-watermark',
  type: 'watermark',
  properties: { text: 'PAID' },
  conditions: [
    { field: 'status', operator: 'equals', value: 'ACCEPTED' }
  ]
}
```

### 3. Show Signature Block for Sent/Accepted Quotes

```typescript
{
  id: 'signature-block',
  type: 'signature',
  conditions: [
    { field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] }
  ]
}
```

### 4. Show Terms Only if Policies Exist

```typescript
{
  id: 'terms-section',
  type: 'textBlock',
  properties: { content: '{{policies}}' },
  conditions: [
    { field: 'policies', operator: 'exists' }
  ]
}
```

### 5. Show Client Email Only if Available

```typescript
{
  id: 'client-email',
  type: 'textBlock',
  properties: { content: '{{clientEmail}}' },
  conditions: [
    { field: 'client.email', operator: 'exists' }
  ]
}
```

### 6. Different Header for Draft vs Finalized

```typescript
// Draft header
{
  id: 'draft-header',
  type: 'header',
  properties: { title: 'DRAFT QUOTATION' },
  conditions: [
    { field: 'status', operator: 'equals', value: 'DRAFT' }
  ]
}

// Final header
{
  id: 'final-header',
  type: 'header',
  properties: { title: 'QUOTATION' },
  conditions: [
    { field: 'status', operator: 'not_equals', value: 'DRAFT' }
  ]
}
```

### 7. Premium Layout for High-Value Quotes

```typescript
{
  id: 'premium-banner',
  type: 'textBlock',
  properties: { content: 'Premium Client Package' },
  conditions: [
    { field: 'grandTotal', operator: '>', value: 10000 }
  ]
}
```

### 8. Multiple Conditions (AND Logic)

```typescript
{
  id: 'vip-section',
  type: 'textBlock',
  conditions: [
    { field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] },
    { field: 'grandTotal', operator: '>', value: 5000 },
    { field: 'client.email', operator: 'exists' }
  ]
  // All three conditions must be true
}
```

### 9. Category-Specific Elements

```typescript
{
  id: 'kitchen-banner',
  type: 'textBlock',
  properties: { content: 'Kitchen Installation Services Available' },
  conditions: [
    { field: 'items.0.product.category.name', operator: 'equals', value: 'Kitchen' }
  ]
}
```

### 10. Urgent Quote Badge

```typescript
{
  id: 'urgent-badge',
  type: 'badge',
  properties: { text: 'URGENT', color: 'red' },
  conditions: [
    { field: 'title', operator: 'contains', value: 'urgent' }
  ]
}
```

## Type Coercion

The system automatically converts types for comparison:

### String to Number

```typescript
// These are equivalent:
{ field: 'discount', operator: '>', value: 100 }
{ field: 'discount', operator: '>', value: '100' }
```

### String to Boolean

```typescript
// String values converted to boolean
'true', '1', 'yes' → true
'false', '0', 'no' → false
```

### Case-Insensitive Strings

```typescript
// These match:
'SENT' === 'sent' === 'Sent'
'URGENT' contains 'urgent'
```

## Error Handling

The system handles errors gracefully:

### Invalid Conditions

```typescript
// Invalid condition → returns false (hide element)
{ field: '', operator: 'equals', value: 'test' } // Invalid: empty field
{ field: 'status', operator: '', value: 'SENT' } // Invalid: empty operator
```

### Non-Existent Fields

```typescript
// Field doesn't exist → returns undefined → condition fails
{ field: 'nonExistentField', operator: 'exists' } // Returns false
```

### Invalid Operators

```typescript
// Unknown operator → logs warning, returns false
{ field: 'status', operator: 'invalid', value: 'SENT' } // Returns false
```

## Context Structure

### ConditionContext Interface

```typescript
interface ConditionContext {
  quote: QuoteWithDetails;      // Required: Complete quote data
  company?: CompanyInfo;         // Optional: Company information
  metadata?: Record<string, any>; // Optional: Custom metadata
}
```

### QuoteWithDetails Type

```typescript
interface QuoteWithDetails extends Quote {
  client: Client | null;
  items: QuoteItemWithProduct[];
  policies: PolicyClause[];
}
```

## Performance Considerations

- **Nested Field Access**: Cached during evaluation (no repeated traversal)
- **Type Coercion**: Happens once per comparison
- **Error Handling**: Try-catch only around condition evaluation
- **Default Behavior**: No conditions = immediate return (fast)

## Testing

Run the test suite to see examples:

```bash
npx tsx lib/conditional-rendering.test.ts
```

The test file includes:
- 23 unit tests covering all operators
- 8 practical use case examples
- Edge case handling
- Validation tests

## Integration Example

### Template Engine Integration

```typescript
import { evaluateConditions } from '@/lib/conditional-rendering';
import type { TemplateElement } from '@/lib/types';

function renderTemplate(
  template: TemplateJSON,
  quote: QuoteWithDetails,
  company?: CompanyInfo
) {
  const context = { quote, company };

  // Filter elements based on conditions
  const visibleElements = template.elements.filter(element =>
    evaluateConditions(element.conditions, context)
  );

  // Render only visible elements
  return visibleElements.map(element => renderElement(element));
}
```

### React Component Integration

```typescript
import { evaluateConditions } from '@/lib/conditional-rendering';

function PDFPreview({ template, quote, company }) {
  const context = { quote, company };

  return (
    <div>
      {template.elements.map(element => {
        // Check if element should be visible
        if (!evaluateConditions(element.conditions, context)) {
          return null; // Hide element
        }

        // Render element
        return <ElementRenderer key={element.id} element={element} />;
      })}
    </div>
  );
}
```

## Best Practices

### 1. Use Specific Conditions

```typescript
// Good: Specific condition
{ field: 'discount', operator: '>', value: 0 }

// Avoid: Overly complex conditions
{ field: 'items.0.product.category.parent.name', operator: 'equals', value: 'Parent' }
```

### 2. Provide Fallbacks

```typescript
// Always have a default element if conditional one doesn't show
{
  // Conditional element
  id: 'premium-header',
  conditions: [{ field: 'grandTotal', operator: '>', value: 10000 }]
},
{
  // Default element (no conditions)
  id: 'standard-header',
  conditions: [{ field: 'grandTotal', operator: '<=', value: 10000 }]
}
```

### 3. Use Helper Functions

```typescript
// Good: Use createCondition for type safety
const condition = createCondition('status', 'equals', 'SENT');

// Avoid: Manual object creation
const condition = { field: 'status', operator: 'equals', value: 'SENT' };
```

### 4. Validate Conditions

```typescript
import { isValidCondition } from '@/lib/conditional-rendering';

const condition = createCondition('status', 'equals', 'SENT');
if (isValidCondition(condition)) {
  // Safe to use
}
```

### 5. Group Related Conditions

```typescript
// Good: Group related conditions in one element
{
  id: 'signature',
  conditions: [
    { field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] },
    { field: 'grandTotal', operator: '>', value: 0 }
  ]
}

// Avoid: Split into multiple elements with overlapping logic
```

## Troubleshooting

### Condition Not Working

1. Check field path: `console.log(getFieldValue('your.field', context))`
2. Verify operator spelling: Use autocomplete with `ConditionOperator` type
3. Check value type: Ensure value matches expected type
4. Test condition: `console.log(evaluateConditions([condition], context))`

### Element Always Hidden

1. Verify condition logic: Are all conditions true?
2. Check data availability: Does the field exist in context?
3. Test without conditions: Remove conditions temporarily

### Type Mismatch Errors

1. Use type coercion: String "100" vs number 100 are handled automatically
2. Check null/undefined: Use `exists`/`not_exists` operators
3. Validate input: Use `isValidCondition` before evaluation

## Future Enhancements

Potential future additions:
- OR logic support (currently only AND)
- Custom operator registration
- Computed fields (e.g., `items.length`)
- Date/time comparisons
- Template variable support in conditions

## License

Part of the Intelli-Quoter project.
