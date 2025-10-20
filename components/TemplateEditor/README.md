# PDF Template Editor - Drag & Drop Components

## Phase 2B: Draggable Element Components

This implementation provides native HTML5 drag-and-drop functionality for building PDF templates in the Intelli-Quoter application.

## Components

### 1. ElementToolbar.tsx
**Purpose**: Displays available element types as draggable cards organized by category.

**Features**:
- 9 element types across 3 categories (Data, Content, Layout)
- Each card shows icon, label, and description
- Native HTML5 drag-and-drop using `draggable={true}`
- Hover effects for visual feedback
- Data transfer using JSON format

**Element Types**:

**Data Elements**:
- Client Details (User icon) - Client name, address, contact information
- Item Table (Table icon) - Quotation items with pricing
- Summary Box (Calculator icon) - Subtotal, discount, tax, and total

**Content Elements**:
- Header (Type icon) - Section heading or title
- Logo (Image icon) - Company logo or image
- Text Block (FileText icon) - Custom text content
- Signature Block (PenTool icon) - Signature lines for approval

**Layout Elements**:
- Divider (Minus icon) - Horizontal line separator
- Spacer (MoveVertical icon) - Vertical spacing element

**Usage**:
```tsx
import { ElementToolbar } from '@/components/TemplateEditor';

<ElementToolbar onDragStart={(elementType) => console.log('Dragging:', elementType)} />
```

### 2. Canvas.tsx
**Purpose**: Drop zone for elements with support for adding, reordering, and deleting elements.

**Features**:
- Empty state with visual instructions
- Drag-over visual feedback (border highlight, background change)
- Accepts new elements from toolbar
- Displays dropped elements in order
- Helper text for user guidance
- Default properties for each element type

**State Management**:
- `elements`: Array of dropped template elements
- `selectedElement`: Currently selected element for editing
- `isDraggedOver`: Visual feedback during drag operations

**Event Handlers**:
- `onDragOver`: Highlights drop zone
- `onDragLeave`: Removes highlight when drag exits
- `onDrop`: Adds new element or handles reordering

**Usage**:
```tsx
import { Canvas } from '@/components/TemplateEditor';

<Canvas
  elements={elements}
  selectedElement={selectedElement}
  onElementsChange={(newElements) => setElements(newElements)}
  onSelectElement={(element) => setSelectedElement(element)}
/>
```

### 3. DraggableElement.tsx
**Purpose**: Wrapper component for dropped elements with drag handle, delete button, and selection highlighting.

**Features**:
- Drag handle (GripVertical icon) for reordering
- Delete button (appears on hover)
- Selection highlighting (blue border and background)
- Order badge showing element position
- Element icon and type label
- Click to select for editing

**Props**:
- `element`: TemplateElement data
- `index`: Position in elements array
- `isSelected`: Boolean for selection state
- `onSelect`: Callback when element is clicked
- `onDelete`: Callback for delete button
- `onReorder`: Callback for drag-and-drop reordering

**Usage**:
```tsx
import { DraggableElement } from '@/components/TemplateEditor';

<DraggableElement
  element={element}
  index={0}
  isSelected={selectedElement?.id === element.id}
  onSelect={(el) => setSelectedElement(el)}
  onDelete={(id) => handleDelete(id)}
  onReorder={(from, to) => handleReorder(from, to)}
/>
```

### 4. TemplateEditorExample.tsx
**Purpose**: Complete example showing how to integrate all components with React state.

**Demonstrates**:
- State management with useState hooks
- Integration of ElementToolbar and Canvas
- Properties panel placeholder
- Three-column layout (toolbar, canvas, properties)

**Usage**:
```tsx
import TemplateEditorExample from '@/components/TemplateEditor/TemplateEditorExample';

export default function TemplatePage() {
  return <TemplateEditorExample />;
}
```

## Drag & Drop Flow

### Adding New Elements
1. User drags element card from ElementToolbar
2. Canvas highlights with blue border/background
3. User drops element on Canvas
4. Canvas creates new TemplateElement with:
   - Unique ID (type-timestamp)
   - Element type
   - Auto-incremented order
   - Default properties
5. Element appears in canvas as DraggableElement

### Reordering Elements
1. User drags DraggableElement by drag handle
2. User drops on another DraggableElement
3. Canvas reorders array using splice
4. All elements get updated order values
5. Canvas re-renders with new order

### Deleting Elements
1. User hovers over DraggableElement
2. Delete button (Trash2 icon) appears
3. User clicks delete button
4. Element is filtered from array
5. Remaining elements are reordered
6. Selection is cleared if deleted element was selected

### Selecting Elements
1. User clicks on DraggableElement
2. Element receives selection highlighting
3. `onSelectElement` callback fires
4. Properties panel updates (to be implemented)

## Data Structures

### ElementType (Toolbar)
```typescript
interface ElementType {
  id: string;              // e.g., 'client-details'
  type: string;            // e.g., 'clientDetails'
  label: string;           // e.g., 'Client Details'
  icon: React.ComponentType;
  category: 'layout' | 'content' | 'data';
  description: string;
}
```

### TemplateElement (Canvas/Types)
```typescript
interface TemplateElement {
  id: string;                    // Unique identifier
  type: string;                  // Element type
  order: number;                 // Rendering order
  position: { x: number; y: number } | 'auto';
  size: {
    width: number | 'auto';
    height: number | 'auto';
  };
  properties: Record<string, any>;  // Element-specific config
  conditions?: ElementCondition[];  // Optional visibility rules
  pageBreak?: 'before' | 'after' | 'avoid' | 'auto';
}
```

## Default Properties

Each element type has sensible defaults defined in `Canvas.tsx`:

**header**: text, fontSize (24), fontWeight (600), align
**logo**: url, width (150), height (50), align
**itemTable**: showHeaders, showBorders, alternateRows
**textBlock**: text, fontSize (12), lineHeight (1.5)
**clientDetails**: showEmail, showPhone, showAddress
**summaryBox**: showSubtotal, showDiscount, showTax, showTotal, boxStyle
**signatureBlock**: numberOfSignatures (2), showDate, showPrintName
**divider**: thickness (1), color (#E5E7EB), style
**spacer**: height (20)

## Visual Feedback

### Hover States
- **ElementToolbar cards**: Blue border, blue background, shadow
- **DraggableElement**: Gray border highlight, shadow
- **Delete button**: Opacity 0 to 100%, red on hover

### Drag States
- **Canvas dragged over**: Blue border, blue background, shadow
- **Empty state**: Icon changes from FileStack to Plus
- **Drop hint**: Dashed blue border box appears

### Selection
- **Selected element**: Blue border, blue background, darker text

## TypeScript Integration

All components use proper TypeScript types from `@/lib/types`:
- `TemplateElement`
- `ElementCondition`
- Full type safety for props and state

## Styling

Uses Tailwind CSS 4 with:
- Responsive spacing and sizing
- Smooth transitions (`transition-all duration-200`)
- Consistent color palette (gray-50 to gray-900, blue-50 to blue-900)
- Utility classes for layouts (flex, grid)

## Icons

Uses lucide-react for all icons:
- Type, Image, Table, FileText, User, Calculator, PenTool (elements)
- Minus, MoveVertical (layout)
- GripVertical, Trash2, FileStack, Plus (UI)

## Next Steps

To complete the template editor:

1. **Properties Panel** (Phase 2C)
   - Dynamic forms based on element type
   - Real-time property updates
   - Validation for required fields

2. **Preview Panel** (Phase 2D)
   - Live PDF preview
   - Zoom controls
   - Page navigation

3. **Save/Load** (Phase 2E)
   - Save template to database
   - Load existing templates
   - Template versioning

4. **Advanced Features**
   - Undo/redo functionality
   - Copy/paste elements
   - Element grouping
   - Conditional visibility UI

## Files Created

```
components/TemplateEditor/
├── ElementToolbar.tsx          # Draggable element types
├── Canvas.tsx                  # Drop zone and element container
├── DraggableElement.tsx        # Wrapper for dropped elements
├── TemplateEditorExample.tsx   # Integration example
├── index.tsx                   # Component exports
└── README.md                   # This file
```

## Dependencies

- React 19.1.0
- TypeScript 5
- lucide-react (icons)
- Tailwind CSS 4 (styling)
- @/lib/types (type definitions)

## Browser Compatibility

Native HTML5 drag-and-drop is supported in:
- Chrome/Edge (all recent versions)
- Firefox (all recent versions)
- Safari (all recent versions)

No external drag-and-drop library required for MVP.
