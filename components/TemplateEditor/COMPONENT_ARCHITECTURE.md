# Template Editor Component Architecture

## Component Hierarchy

```
TemplateEditor (Main Orchestrator)
├── EditorTopBar
│   ├── Template Name Input
│   ├── Undo/Redo Buttons (disabled)
│   ├── Preview Button
│   └── Save Button
│
├── ElementToolbar (Left Sidebar - 256px)
│   ├── Data Elements
│   │   ├── Client Details
│   │   ├── Item Table
│   │   └── Summary Box
│   ├── Content Elements
│   │   ├── Header
│   │   ├── Logo
│   │   ├── Text Block
│   │   └── Signature Block
│   └── Layout Elements
│       ├── Divider
│       └── Spacer
│
├── Canvas / TemplateCanvas (Center - flex-1)
│   ├── Empty State (when no elements)
│   └── Elements List
│       └── DraggableElement (repeated)
│           ├── Drag Handle (GripVertical)
│           ├── Element Icon
│           ├── Element Label
│           ├── Order Badge
│           └── Delete Button (on hover)
│
└── PropertyPanel (Right Sidebar - 320px)
    ├── Element Properties Form
    └── Dynamic Inputs (based on element type)
```

## Data Flow

### Adding New Element
```
ElementToolbar
  │ (user drags element)
  │ onDragStart → sets dataTransfer JSON
  ↓
Canvas
  │ onDragOver → highlights drop zone
  │ onDrop → receives element type
  │ addNewElement() → creates TemplateElement
  ↓
TemplateEditor
  │ handleAddElement()
  │ setElements([...elements, newElement])
  │ setSelectedElement(newElement)
  ↓
Canvas (re-renders)
  └─→ DraggableElement (new element appears)
```

### Reordering Element
```
DraggableElement
  │ (user drags element)
  │ onDragStart → sets index + element data
  ↓
DraggableElement (drop target)
  │ onDragOver → allows drop
  │ onDrop → receives drag data
  │ calls onReorder(dragIndex, dropIndex)
  ↓
Canvas
  │ handleReorder()
  │ splice to reorder array
  │ update order properties
  │ onElementsChange(reordered)
  ↓
TemplateEditor
  │ setElements(reordered)
  ↓
Canvas (re-renders with new order)
```

### Selecting Element
```
DraggableElement
  │ (user clicks)
  │ onClick → calls onSelect(element)
  ↓
Canvas
  │ handleSelect()
  │ onSelectElement(element)
  ↓
TemplateEditor
  │ setSelectedElement(element)
  ↓
PropertyPanel (re-renders)
  └─→ Shows element properties
```

### Updating Element Properties
```
PropertyPanel
  │ (user edits property)
  │ onChange → calls onUpdateElement()
  ↓
TemplateEditor
  │ handleUpdateElement()
  │ setElements(updated array)
  │ setSelectedElement(updated element)
  ↓
Canvas (re-renders)
  └─→ DraggableElement (shows updated content)
```

### Deleting Element
```
DraggableElement
  │ (user clicks delete)
  │ onClick → calls onDelete(elementId)
  ↓
Canvas
  │ handleDelete()
  │ filters element from array
  │ reorders remaining elements
  │ onElementsChange(filtered)
  │ onSelectElement(null) if was selected
  ↓
TemplateEditor
  │ setElements(filtered)
  │ setSelectedElement(null)
  ↓
Canvas (re-renders)
  └─→ Element removed
```

## State Management

### TemplateEditor (Parent State)
```typescript
const [templateName, setTemplateName] = useState<string>()
const [category, setCategory] = useState<TemplateCategory>()
const [elements, setElements] = useState<TemplateElement[]>()
const [selectedElement, setSelectedElement] = useState<TemplateElement | null>()
const [saving, setSaving] = useState<boolean>()
```

### Canvas (Local State)
```typescript
const [isDraggedOver, setIsDraggedOver] = useState<boolean>()
```

### PropertyPanel (Local State)
```typescript
const [localProperties, setLocalProperties] = useState<Record<string, any>>()
```

## Props Interface

### ElementToolbar
```typescript
interface ElementToolbarProps {
  onDragStart?: (elementType: ElementType) => void;
}
```

### Canvas
```typescript
interface CanvasProps {
  elements: TemplateElement[];
  selectedElement: TemplateElement | null;
  onElementsChange: (elements: TemplateElement[]) => void;
  onSelectElement: (element: TemplateElement | null) => void;
}
```

### DraggableElement
```typescript
interface DraggableElementProps {
  element: TemplateElement;
  index: number;
  isSelected: boolean;
  onSelect: (element: TemplateElement) => void;
  onDelete: (elementId: string) => void;
  onReorder: (dragIndex: number, dropIndex: number) => void;
}
```

### PropertyPanel
```typescript
interface PropertyPanelProps {
  selectedElement: TemplateElement | null;
  onUpdateElement: (elementId: string, updates: Partial<TemplateElement>) => void;
}
```

## Event Handlers

### Drag Events
```typescript
// ElementToolbar - Starting drag
onDragStart(e: React.DragEvent<HTMLDivElement>)
  → e.dataTransfer.setData('application/json', JSON.stringify(elementType))

// Canvas - Accepting drop
onDragOver(e: React.DragEvent<HTMLDivElement>)
  → e.preventDefault()
  → e.dataTransfer.dropEffect = 'copy'

onDragLeave(e: React.DragEvent<HTMLDivElement>)
  → setIsDraggedOver(false)

onDrop(e: React.DragEvent<HTMLDivElement>)
  → e.preventDefault()
  → const data = JSON.parse(e.dataTransfer.getData('application/json'))
  → addNewElement(data)

// DraggableElement - Reordering
onDragStart(e: React.DragEvent<HTMLDivElement>)
  → e.dataTransfer.setData('application/json', JSON.stringify({ index, element }))

onDrop(e: React.DragEvent<HTMLDivElement>)
  → const { index: dragIndex } = JSON.parse(e.dataTransfer.getData('application/json'))
  → onReorder(dragIndex, dropIndex)
```

### Click Events
```typescript
// DraggableElement - Selection
onClick()
  → onSelect(element)

// DraggableElement - Deletion
onClick(e)
  → e.stopPropagation()
  → onDelete(element.id)
```

## File Dependencies

```
ElementToolbar.tsx
├── React
├── lucide-react (icons)
└── (exports ElementType interface)

DraggableElement.tsx
├── React
├── lucide-react (GripVertical, Trash2)
├── @/lib/types (TemplateElement)
└── ./ElementToolbar (ELEMENT_TYPES for icon lookup)

Canvas.tsx
├── React (+ useState)
├── lucide-react (FileStack, Plus)
├── @/lib/types (TemplateElement)
├── ./DraggableElement
└── ./ElementToolbar (ElementType)

TemplateCanvas.tsx (Alternative)
├── React
├── lucide-react (Trash2, GripVertical)
├── @/lib/types (TemplateElement)
└── ./ElementToolbar (ElementType)

TemplateEditor.tsx
├── React (+ useState, useEffect)
├── @/lib/types (PDFTemplate, TemplateElement, etc.)
├── ./EditorTopBar
├── ./ElementToolbar
├── ./TemplateCanvas
└── ./PropertyPanel

TemplateEditorExample.tsx
├── React (+ useState)
├── @/lib/types (TemplateElement)
├── ./ElementToolbar
└── ./Canvas
```

## CSS Classes (Tailwind)

### Layout
- `flex`, `flex-1`, `flex-col` - Flexbox layout
- `h-screen`, `w-64`, `w-80` - Sizing
- `overflow-y-auto` - Scrolling
- `p-4`, `p-6`, `p-8` - Padding
- `space-y-2`, `space-y-3`, `gap-2`, `gap-3` - Spacing

### Colors
- `bg-white`, `bg-gray-50`, `bg-gray-100` - Backgrounds
- `text-gray-900`, `text-gray-600`, `text-gray-500` - Text colors
- `border-gray-200`, `border-gray-300` - Border colors
- `bg-blue-50`, `border-blue-400`, `text-blue-600` - Selection/hover
- `text-red-600`, `hover:text-red-600` - Delete action

### Interactions
- `cursor-pointer`, `cursor-move` - Cursors
- `hover:border-blue-400`, `hover:bg-blue-50` - Hover states
- `transition-all duration-200` - Smooth transitions
- `opacity-0 group-hover:opacity-100` - Reveal on hover

### Borders
- `border`, `border-2`, `border-dashed` - Border styles
- `rounded-lg`, `rounded-full` - Border radius

## TypeScript Types Summary

### Core Types (from @/lib/types)
```typescript
type PageSize = 'A4' | 'Letter' | 'Legal'
type Orientation = 'portrait' | 'landscape'
type TemplateCategory = 'business' | 'modern' | 'creative' | 'elegant' | 'bold' | 'minimalist' | 'custom'

interface TemplateElement {
  id: string
  type: string
  order: number
  position: { x: number; y: number } | 'auto'
  size: { width: number | 'auto'; height: number | 'auto' }
  properties: Record<string, any>
  conditions?: ElementCondition[]
  pageBreak?: 'before' | 'after' | 'avoid' | 'auto'
}

interface TemplateJSON {
  metadata: TemplateMetadata
  theme: TemplateTheme
  elements: TemplateElement[]
}

interface PDFTemplate {
  id: string
  name: string
  description: string | null
  category: TemplateCategory
  isDefault: boolean
  isPublic: boolean
  templateJson: TemplateJSON
  thumbnail: string | null
  createdBy: string | null
  createdAt: Date | string
  updatedAt: Date | string
  version: number
}
```

### Component-Specific Types
```typescript
// ElementToolbar
interface ElementType {
  id: string
  type: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  category: 'layout' | 'content' | 'data'
  description: string
}
```

## Performance Optimizations

### Current
- ✅ Efficient array operations (splice for reorder)
- ✅ Minimal re-renders (only affected components)
- ✅ CSS transitions (hardware accelerated)
- ✅ Event delegation where possible

### Future
- ⚠️ React.memo for DraggableElement
- ⚠️ useMemo for sorted/filtered arrays
- ⚠️ useCallback for event handlers
- ⚠️ Virtual scrolling for large element lists
- ⚠️ Debounced property updates

## Accessibility Features

### Implemented
- ✅ Semantic HTML elements
- ✅ ARIA labels on buttons
- ✅ Title attributes for tooltips
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Visual focus indicators
- ✅ Sufficient color contrast

### Future
- ⚠️ Keyboard-only drag-drop alternative
- ⚠️ Screen reader announcements for state changes
- ⚠️ ARIA live regions for dynamic updates
- ⚠️ Comprehensive keyboard shortcuts
- ⚠️ Focus management for modals

## Browser Compatibility

### Tested
- ✅ Chrome 120+ (Windows, macOS)
- ✅ Edge 120+ (Windows)
- ✅ Firefox 121+ (Windows, macOS)
- ✅ Safari 17+ (macOS)

### Known Issues
- ⚠️ Mobile drag-drop (touch events not fully supported)
- ⚠️ IE11 not supported (React 19 requirement)

## File Sizes

```
ElementToolbar.tsx       223 lines  ~6 KB
DraggableElement.tsx     145 lines  ~4 KB
Canvas.tsx               265 lines  ~8 KB
TemplateEditorExample    58 lines   ~2 KB
───────────────────────────────────────────
Total                    691 lines  ~20 KB
```

## Component Reusability

### Standalone Components
- ✅ ElementToolbar - Can be used independently
- ✅ Canvas - Can be used with different state management
- ✅ DraggableElement - Can be used in other contexts

### Coupled Components
- ⚠️ PropertyPanel - Tightly coupled to element types
- ⚠️ TemplateEditor - Orchestrator, not reusable

## Testing Strategy

### Unit Tests (Recommended)
```typescript
// ElementToolbar
- Renders all element types
- Draggable attributes set correctly
- onDragStart callback fires
- Categories displayed correctly

// DraggableElement
- Renders element correctly
- Selection highlighting works
- Delete button appears on hover
- Drag handlers fire correctly

// Canvas
- Empty state renders
- Accepts new elements
- Reordering works correctly
- Deletion updates state
```

### Integration Tests (Recommended)
```typescript
// Full workflow
- Drag from toolbar to canvas
- Reorder multiple elements
- Select and edit properties
- Delete elements
- Save template
```

### E2E Tests (Future)
```typescript
// User scenarios
- Create template from scratch
- Edit existing template
- Preview and save
- Load and modify
```

## Debug Tips

### Enable drag-drop debugging
```typescript
// Add to onDragStart
console.log('Dragging:', e.dataTransfer.getData('application/json'))

// Add to onDrop
console.log('Dropped:', e.dataTransfer.getData('application/json'))

// Add to reorder
console.log('Reorder:', { dragIndex, dropIndex, before: elements, after: reordered })
```

### Visual debugging
```css
/* Add to Canvas */
.debug-drop-zone {
  outline: 2px solid red;
  outline-offset: -2px;
}

/* Add to DraggableElement */
.debug-dragging {
  opacity: 0.5;
  transform: scale(0.95);
}
```

## Conclusion

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Unidirectional data flow
- ✅ Type-safe interfaces
- ✅ Reusable components
- ✅ Maintainable codebase
- ✅ Scalable for future features
