# Conditional Rendering Quick Reference

## Import

```typescript
import { evaluateConditions, createCondition } from '@/lib/conditional-rendering';
```

## Basic Usage

```typescript
// Evaluate conditions
const shouldRender = evaluateConditions(
  [{ field: 'discount', operator: '>', value: 0 }],
  { quote }
);

// Create condition
const condition = createCondition('status', 'equals', 'SENT');
```

## Operators Cheat Sheet

| Operator | Symbol | Use Case |
|----------|--------|----------|
| `equals` | `==` | `status === 'SENT'` |
| `not_equals` | `!=` | `status !== 'DRAFT'` |
| `greater_than` | `>` | `total > 1000` |
| `less_than` | `<` | `discount < 100` |
| `greater_or_equal` | `>=` | `tax >= 10` |
| `less_or_equal` | `<=` | `items <= 5` |
| `exists` | - | `email !== null` |
| `not_exists` | - | `phone === null` |
| `contains` | - | `title includes 'urgent'` |
| `not_contains` | - | `title excludes 'draft'` |
| `in` | - | `status in ['SENT', 'ACCEPTED']` |
| `not_in` | - | `status not in ['DRAFT']` |
| `starts_with` | - | `number starts with 'QT-'` |
| `ends_with` | - | `email ends with '.com'` |
| `matches` | - | Regex pattern match |

## Field Access

```typescript
'status'                           // Direct field
'client.email'                     // Nested object
'items.0.product.name'            // Array index
'company.name'                    // Company data
'metadata.priority'               // Metadata
```

## Common Patterns

### Show if exists
```typescript
{ field: 'client.email', operator: 'exists' }
```

### Show if greater than zero
```typescript
{ field: 'discount', operator: '>', value: 0 }
```

### Show for specific status
```typescript
{ field: 'status', operator: 'in', value: ['SENT', 'ACCEPTED'] }
```

### Hide for drafts
```typescript
{ field: 'status', operator: '!=', value: 'DRAFT' }
```

### Multiple conditions (AND)
```typescript
conditions: [
  { field: 'status', operator: 'equals', value: 'SENT' },
  { field: 'total', operator: '>', value: 1000 }
]
```

## Template Integration

```typescript
{
  id: 'element-id',
  type: 'textBlock',
  properties: { ... },
  conditions: [
    { field: 'fieldName', operator: 'operatorName', value: compareValue }
  ]
}
```

## Context Structure

```typescript
const context = {
  quote: quoteWithDetails,    // Required
  company: companyInfo,        // Optional
  metadata: { ... }            // Optional
};
```

## Default Behavior

- No conditions = Always render
- Empty array = Always render
- All conditions must be true (AND logic)
- Invalid condition = Don't render (safe default)
