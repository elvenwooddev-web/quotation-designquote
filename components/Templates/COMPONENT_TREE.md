# Template Selector Component Tree

Visual reference for the component hierarchy and data flow.

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                  TemplateSelectorDialog                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Dialog Header (Title + Close)                         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   TemplateSelector                     │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Search Input [Search by name...]               │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Category Filter [All Categories ▼]             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ Results Count: "X templates found"             │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │           Template Grid (3 columns)            │  │  │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐     │  │  │
│  │  │  │ Template  │ │ Template  │ │ Template  │     │  │  │
│  │  │  │   Card    │ │   Card    │ │   Card    │     │  │  │
│  │  │  └───────────┘ └───────────┘ └───────────┘     │  │  │
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐     │  │  │
│  │  │  │ Template  │ │ Template  │ │ Template  │     │  │  │
│  │  │  │   Card    │ │   Card    │ │   Card    │     │  │  │
│  │  │  └───────────┘ └───────────┘ └───────────┘     │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │ PDFPreviewModal (when preview clicked)         │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Dialog Footer (Selected: X | Cancel | Confirm)       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## TemplateCard Anatomy

```
┌────────────────────────────────────────┐
│  ┌──────────────────────────────────┐  │ ← Checkmark badge (if selected)
│  │                                  │  │
│  │        Thumbnail Image           │  │ ← Thumbnail (or placeholder icon)
│  │      (or placeholder icon)       │  │
│  │                                  │  │
│  │   [Preview Button on hover]      │  │ ← Preview button overlay
│  └──────────────────────────────────┘  │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ Template Name              ⭐    │  │ ← Star if default
│  └──────────────────────────────────┘  │
│                                         │
│  Description text (if not compact)      │
│                                         │
│  [Category] [Default]                   │ ← Category + Default badges
│                                         │
│  A4 • portrait                 Public   │ ← Metadata
└────────────────────────────────────────┘
```

## Data Flow

### 1. Initial Load

```
User Opens Dialog
       ↓
TemplateSelectorDialog renders
       ↓
TemplateSelector mounts
       ↓
useEffect triggers
       ↓
fetch('/api/templates')
       ↓
API returns PDFTemplate[]
       ↓
setTemplates(data)
       ↓
Render grid of TemplateCard
```

### 2. Search & Filter Flow

```
User types in search
       ↓
setSearchQuery(value)
       ↓
filteredTemplates recalculates
  - Filter by name match
  - Filter by category
       ↓
sortedTemplates sorts
  - Default first
  - Then alphabetical
       ↓
Grid re-renders with filtered cards
```

### 3. Selection Flow

```
User clicks TemplateCard
       ↓
onSelect() callback fires
       ↓
handleTemplateSelect(id, template)
       ↓
setSelectedTemplateId(id)
       ↓
setSelectedTemplate(template)
       ↓
Card shows selected state
  - Blue border
  - Checkmark badge
       ↓
User clicks "Confirm"
       ↓
Dialog onSelect(id, template)
       ↓
Parent component receives selection
       ↓
Dialog closes
```

### 4. Preview Flow

```
User hovers over TemplateCard
       ↓
Preview button appears
       ↓
User clicks Preview
       ↓
onPreview(templateId) callback
       ↓
setPreviewTemplateId(id)
       ↓
PDFPreviewModal opens
       ↓
Modal fetches: /api/templates/{id}/preview
       ↓
Displays PDF in iframe
       ↓
User closes modal
       ↓
setPreviewTemplateId(null)
```

### 5. Keyboard Navigation Flow

```
User presses Arrow Key
       ↓
handleKeyDown event
       ↓
Calculate new focusedIndex
  - Right: +1
  - Left: -1
  - Down: +3 (next row)
  - Up: -3 (prev row)
       ↓
setFocusedIndex(newIndex)
       ↓
Card at index shows focus ring
       ↓
User presses Enter
       ↓
Select focused template
```

## Props Flow

### TemplateSelectorDialog → TemplateSelector

```typescript
<TemplateSelectorDialog
  open={true}
  currentTemplateId="abc123"
  onSelect={(id, template) => {...}}
>
  <TemplateSelector
    selectedTemplateId="abc123"    // Passed from dialog state
    onSelect={(id, template) => {  // Dialog's internal handler
      setSelectedTemplateId(id)
      setSelectedTemplate(template)
    }}
    showPreview={true}
    compact={false}
  />
</TemplateSelectorDialog>
```

### TemplateSelector → TemplateCard

```typescript
<TemplateSelector>
  {sortedTemplates.map(template => (
    <TemplateCard
      template={template}           // Full template object
      selected={template.id === selectedTemplateId}
      onSelect={() => handleSelect(template)}
      onPreview={() => handlePreview(template.id)}
      compact={compact}
    />
  ))}
</TemplateSelector>
```

## State Management

### TemplateSelectorDialog State

```typescript
// Selection state (internal)
const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);

// Lifecycle
- Initialized from currentTemplateId prop
- Updated on template selection
- Reset on cancel
- Confirmed on submit
```

### TemplateSelector State

```typescript
// Data state
const [templates, setTemplates] = useState<PDFTemplate[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Filter state
const [searchQuery, setSearchQuery] = useState('');
const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

// UI state
const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);
const [focusedIndex, setFocusedIndex] = useState<number>(-1);
```

### TemplateCard State

```typescript
// No internal state - fully controlled by props
// All interactions handled via callbacks
```

## Event Handling

### Click Events

```
TemplateCard (entire card)
  ├─ onClick → onSelect()
  │   └─ Parent: handleTemplateSelect(id, template)
  │
  └─ Preview Button
      └─ onClick (stopPropagation) → onPreview()
          └─ Parent: handlePreview(templateId)
```

### Keyboard Events

```
Window (when TemplateSelector mounted)
  ├─ ArrowRight → focusedIndex + 1
  ├─ ArrowLeft → focusedIndex - 1
  ├─ ArrowDown → focusedIndex + 3
  ├─ ArrowUp → focusedIndex - 3
  ├─ Enter → selectFocusedTemplate()
  └─ Escape → clearFocus()

Window (when Dialog open)
  └─ Escape → onClose()
```

### Input Events

```
Search Input
  └─ onChange → setSearchQuery(e.target.value)
      └─ Triggers filteredTemplates recalc

Category Select
  └─ onChange → setSelectedCategory(e.target.value)
      └─ Triggers filteredTemplates recalc
```

## Responsive Behavior

### Desktop (lg: ≥1024px)

```
┌─────────────────────────────────────────────┐
│  [Search.........]  [Category Filter ▼]    │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │Template │  │Template │  │Template │    │
│  │  Card   │  │  Card   │  │  Card   │    │
│  └─────────┘  └─────────┘  └─────────┘    │
│                                             │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │Template │  │Template │  │Template │    │
│  │  Card   │  │  Card   │  │  Card   │    │
│  └─────────┘  └─────────┘  └─────────┘    │
└─────────────────────────────────────────────┘

Grid: 3 columns (grid-cols-3)
Card: Full size (h-40)
```

### Tablet (md: ≥768px)

```
┌────────────────────────────────────┐
│  [Search............]              │
│  [Category Filter ▼]               │
│                                    │
│  ┌──────────┐  ┌──────────┐       │
│  │Template  │  │Template  │       │
│  │  Card    │  │  Card    │       │
│  └──────────┘  └──────────┘       │
│                                    │
│  ┌──────────┐  ┌──────────┐       │
│  │Template  │  │Template  │       │
│  │  Card    │  │  Card    │       │
│  └──────────┘  └──────────┘       │
└────────────────────────────────────┘

Grid: 2 columns (grid-cols-2)
Card: Full size (h-40)
```

### Mobile (default)

```
┌─────────────────────┐
│  [Search........]   │
│  [Category ▼]       │
│                     │
│  ┌───────────────┐  │
│  │   Template    │  │
│  │     Card      │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │   Template    │  │
│  │     Card      │  │
│  └───────────────┘  │
│                     │
│  ┌───────────────┐  │
│  │   Template    │  │
│  │     Card      │  │
│  └───────────────┘  │
└─────────────────────┘

Grid: 1 column (grid-cols-1)
Card: Full size (h-40)
Filters: Stacked
```

### Compact Mode

```
Grid: Always 2 columns
Card: Smaller (h-32)
Description: Hidden
Padding: Reduced
```

## Category Badge Colors

```
business     ███ bg-blue-100   text-blue-800
modern       ███ bg-purple-100 text-purple-800
creative     ███ bg-pink-100   text-pink-800
elegant      ███ bg-indigo-100 text-indigo-800
bold         ███ bg-red-100    text-red-800
minimalist   ███ bg-gray-100   text-gray-800
custom       ███ bg-green-100  text-green-800
```

## Loading States

### Skeleton Loading

```
┌────────────────────────────────────────────────┐
│  [████████████]  [████████]                   │ ← Skeleton filters
│                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌──────────┐│
│  │ ▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓ ││ ← Skeleton cards
│  │ ▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓▓▓▓ │ │ ▓▓▓▓▓▓▓ ││
│  │ ████       │ │ ████       │ │ ████     ││
│  │ ██         │ │ ██         │ │ ██       ││
│  └─────────────┘ └─────────────┘ └──────────┘│
└────────────────────────────────────────────────┘
```

### Error State

```
┌─────────────────────────┐
│         ⚠️              │
│  Failed to Load         │
│     Templates           │
│                         │
│  [Try Again Button]     │
└─────────────────────────┘
```

### Empty State

```
┌─────────────────────────┐
│         📄              │
│   No Templates Found    │
│                         │
│  Create your first      │
│  template to get        │
│  started.               │
└─────────────────────────┘
```

### No Results State

```
┌──────────────────────────────┐
│  [Search: "xyz"]  [All ▼]   │
│                              │
│         🔍                   │
│  No Templates Match          │
│    Your Search               │
│                              │
│  Try adjusting your          │
│  search criteria.            │
└──────────────────────────────┘
```

## File Dependencies

```
index.ts
  └─ Exports all components

TemplateCard.tsx
  ├─ @/lib/types (PDFTemplate)
  ├─ @/components/ui/button (Button)
  ├─ @/lib/utils (cn)
  └─ lucide-react (Check, Eye, Star)

TemplateSelector.tsx
  ├─ @/lib/types (PDFTemplate, TemplateCategory)
  ├─ @/components/ui/input (Input)
  ├─ @/components/PDFPreviewModal
  ├─ @/lib/utils (cn)
  ├─ lucide-react (Search, Filter, Loader2, FileX)
  └─ ./TemplateCard

TemplateSelectorDialog.tsx
  ├─ @/lib/types (PDFTemplate)
  ├─ @/components/ui/button (Button)
  ├─ lucide-react (X)
  └─ ./TemplateSelector
```

---

**Created**: Phase 6A - Template Selector Component Tree
**Last Updated**: 2025-10-20
