'use client';

import React from 'react';
import {
  Type,
  Image,
  Table,
  FileText,
  User,
  Calculator,
  PenTool,
  Minus,
  MoveVertical,
  QrCode,
  BarChart,
} from 'lucide-react';

/**
 * Element type definition for the toolbar
 */
export interface ElementType {
  id: string;
  type: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'layout' | 'content' | 'data';
  description: string;
}

/**
 * Available element types for the PDF template
 */
export const ELEMENT_TYPES: ElementType[] = [
  // Data Elements
  {
    id: 'client-details',
    type: 'clientDetails',
    label: 'Client Details',
    icon: User,
    category: 'data',
    description: 'Client name, address, contact information',
  },
  {
    id: 'item-table',
    type: 'itemTable',
    label: 'Item Table',
    icon: Table,
    category: 'data',
    description: 'Quotation items with pricing',
  },
  {
    id: 'summary-box',
    type: 'summaryBox',
    label: 'Summary Box',
    icon: Calculator,
    category: 'data',
    description: 'Subtotal, discount, tax, and total',
  },
  {
    id: 'chart',
    type: 'chart',
    label: 'Chart',
    icon: BarChart,
    category: 'data',
    description: 'Visual breakdown of quote categories',
  },
  // Content Elements
  {
    id: 'header',
    type: 'header',
    label: 'Header',
    icon: Type,
    category: 'content',
    description: 'Section heading or title',
  },
  {
    id: 'logo',
    type: 'logo',
    label: 'Logo',
    icon: Image,
    category: 'content',
    description: 'Company logo or image',
  },
  {
    id: 'text-block',
    type: 'textBlock',
    label: 'Text Block',
    icon: FileText,
    category: 'content',
    description: 'Custom text content',
  },
  {
    id: 'signature-block',
    type: 'signatureBlock',
    label: 'Signature Block',
    icon: PenTool,
    category: 'content',
    description: 'Signature lines for approval',
  },
  {
    id: 'qr-code',
    type: 'qrCode',
    label: 'QR Code',
    icon: QrCode,
    category: 'content',
    description: 'QR code for payment link or verification',
  },
  // Layout Elements
  {
    id: 'divider',
    type: 'divider',
    label: 'Divider',
    icon: Minus,
    category: 'layout',
    description: 'Horizontal line separator',
  },
  {
    id: 'spacer',
    type: 'spacer',
    label: 'Spacer',
    icon: MoveVertical,
    category: 'layout',
    description: 'Vertical spacing element',
  },
];

interface ElementToolbarProps {
  onDragStart?: (elementType: ElementType) => void;
}

/**
 * ElementToolbar component displays draggable element types
 * organized by category for building PDF templates
 */
export default function ElementToolbar({ onDragStart }: ElementToolbarProps) {
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    elementType: ElementType
  ) => {
    // Set the element type data for the drop handler
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify(elementType));

    // Optional callback
    if (onDragStart) {
      onDragStart(elementType);
    }
  };

  // Group elements by category
  const layoutElements = ELEMENT_TYPES.filter((el) => el.category === 'layout');
  const contentElements = ELEMENT_TYPES.filter((el) => el.category === 'content');
  const dataElements = ELEMENT_TYPES.filter((el) => el.category === 'data');

  return (
    <div className="w-64 border-r border-gray-200 bg-white p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-gray-900">Elements</h2>

      {/* Data Elements */}
      <div className="mb-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Data
        </h3>
        <div className="space-y-2">
          {dataElements.map((element) => (
            <ElementCard
              key={element.id}
              element={element}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>

      {/* Content Elements */}
      <div className="mb-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Content
        </h3>
        <div className="space-y-2">
          {contentElements.map((element) => (
            <ElementCard
              key={element.id}
              element={element}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>

      {/* Layout Elements */}
      <div className="mb-6">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
          Layout
        </h3>
        <div className="space-y-2">
          {layoutElements.map((element) => (
            <ElementCard
              key={element.id}
              element={element}
              onDragStart={handleDragStart}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ElementCardProps {
  element: ElementType;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, element: ElementType) => void;
}

/**
 * Individual draggable element card
 */
function ElementCard({ element, onDragStart }: ElementCardProps) {
  const Icon = element.icon;

  return (
    <div
      draggable={true}
      onDragStart={(e) => onDragStart(e, element)}
      className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-white cursor-move hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm transition-all group"
      title={element.description}
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 group-hover:text-blue-900">
          {element.label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
          {element.description}
        </p>
      </div>
    </div>
  );
}
