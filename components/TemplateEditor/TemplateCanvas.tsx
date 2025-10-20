'use client';

import React from 'react';
import { TemplateElement } from '@/lib/types';
import { ElementType } from './ElementToolbar';
import { Trash2, GripVertical } from 'lucide-react';

interface TemplateCanvasProps {
  elements: TemplateElement[];
  selectedElement: TemplateElement | null;
  onSelectElement: (element: TemplateElement) => void;
  onDeleteElement: (elementId: string) => void;
  onAddElement: (elementType: ElementType) => void;
  onReorderElement: (elementId: string, newOrder: number) => void;
}

export default function TemplateCanvas({
  elements,
  selectedElement,
  onSelectElement,
  onDeleteElement,
  onAddElement,
  onReorderElement,
}: TemplateCanvasProps) {
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const data = e.dataTransfer.getData('application/json');
      if (data) {
        const elementType = JSON.parse(data) as ElementType;
        onAddElement(elementType);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const sortedElements = [...elements].sort((a, b) => a.order - b.order);

  return (
    <div
      className="flex-1 bg-gray-100 p-8 overflow-y-auto"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {/* Canvas Paper */}
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 min-h-[1000px]">
        {elements.length === 0 ? (
          <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-2">Drag elements here to start building your template</p>
              <p className="text-sm">Elements will appear in the order you add them</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedElements.map((element, index) => (
              <ElementPreview
                key={element.id}
                element={element}
                isSelected={selectedElement?.id === element.id}
                onSelect={() => onSelectElement(element)}
                onDelete={() => onDeleteElement(element.id)}
                onMoveUp={() => {
                  if (index > 0) {
                    onReorderElement(element.id, sortedElements[index - 1].order);
                  }
                }}
                onMoveDown={() => {
                  if (index < sortedElements.length - 1) {
                    onReorderElement(element.id, sortedElements[index + 1].order);
                  }
                }}
                canMoveUp={index > 0}
                canMoveDown={index < sortedElements.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface ElementPreviewProps {
  element: TemplateElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function ElementPreview({
  element,
  isSelected,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: ElementPreviewProps) {
  const renderElementContent = () => {
    switch (element.type) {
      case 'header':
        return (
          <div
            className="font-bold"
            style={{
              fontSize: `${element.properties.fontSize || 16}px`,
              color: element.properties.color || '#000000',
              textAlign: element.properties.alignment || 'left',
            }}
          >
            {element.properties.text || 'Header Text'}
          </div>
        );

      case 'textBlock':
        return (
          <div
            style={{
              fontSize: `${element.properties.fontSize || 12}px`,
              color: element.properties.color || '#000000',
            }}
          >
            {element.properties.content || 'Text content goes here...'}
          </div>
        );

      case 'table':
        return (
          <div className="border rounded p-4 bg-gray-50">
            <div className="text-sm text-gray-600">
              Table Element
              {element.properties.showBorders && ' (with borders)'}
              {element.properties.alternatingRows && ' (alternating rows)'}
            </div>
          </div>
        );

      case 'divider':
        return (
          <div
            style={{
              height: `${element.properties.thickness || 1}px`,
              backgroundColor: element.properties.color || '#000000',
              borderStyle: element.properties.style === 'dashed' ? 'dashed' : 'solid',
              borderWidth: element.properties.style === 'dashed' ? '1px 0 0 0' : '0',
              borderColor: element.properties.color || '#000000',
            }}
          />
        );

      case 'spacer':
        return (
          <div
            className="bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-500"
            style={{ height: `${element.properties.height || 20}px` }}
          >
            Spacer ({element.properties.height || 20}px)
          </div>
        );

      case 'clientDetails':
        return (
          <div className="border rounded p-4 bg-blue-50">
            <div className="text-sm font-semibold text-blue-900 mb-2">Client Details</div>
            <div className="text-xs text-blue-700">
              Name, Address, Contact Information
            </div>
          </div>
        );

      case 'itemTable':
        return (
          <div className="border rounded p-4 bg-green-50">
            <div className="text-sm font-semibold text-green-900 mb-2">Item Table</div>
            <div className="text-xs text-green-700">
              Quotation Items with Pricing
            </div>
          </div>
        );

      case 'summaryBox':
        return (
          <div className="border rounded p-4 bg-purple-50">
            <div className="text-sm font-semibold text-purple-900 mb-2">Summary Box</div>
            <div className="text-xs text-purple-700">
              Subtotal, Discount, Tax, Total
            </div>
          </div>
        );

      case 'logo':
        return (
          <div className="border rounded p-4 bg-gray-50 flex items-center justify-center h-24">
            <div className="text-sm text-gray-600">Company Logo</div>
          </div>
        );

      case 'signatureBlock':
        return (
          <div className="border rounded p-4 bg-gray-50">
            <div className="text-sm font-semibold text-gray-900 mb-2">Signature Block</div>
            <div className="text-xs text-gray-700">
              Signature Lines for Approval
            </div>
          </div>
        );

      default:
        return (
          <div className="text-sm text-gray-500 capitalize">
            {element.type} element
          </div>
        );
    }
  };

  return (
    <div
      className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={onSelect}
    >
      {/* Element Controls */}
      {isSelected && (
        <div className="absolute -top-3 right-4 flex items-center gap-1 bg-white border border-gray-300 rounded-md shadow-sm">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp();
            }}
            disabled={!canMoveUp}
            className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move up"
          >
            <GripVertical className="h-4 w-4 rotate-180" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown();
            }}
            disabled={!canMoveDown}
            className="p-1 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move down"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-gray-300" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-red-100 text-red-600"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Element Badge */}
      <div className="absolute -top-3 left-4 px-2 py-0.5 bg-white border border-gray-300 rounded text-xs font-medium text-gray-700 capitalize">
        {element.type}
      </div>

      {/* Element Content */}
      <div className="mt-2">{renderElementContent()}</div>
    </div>
  );
}
