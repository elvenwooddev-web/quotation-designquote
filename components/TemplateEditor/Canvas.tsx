'use client';

import React, { useState } from 'react';
import { FileStack, Plus } from 'lucide-react';
import { TemplateElement } from '@/lib/types';
import DraggableElement from './DraggableElement';
import { ElementType } from './ElementToolbar';

interface CanvasProps {
  elements: TemplateElement[];
  selectedElement: TemplateElement | null;
  onElementsChange: (elements: TemplateElement[]) => void;
  onSelectElement: (element: TemplateElement | null) => void;
}

/**
 * Canvas component provides a drop zone for template elements
 * Handles adding new elements, reordering, and element selection
 */
export default function Canvas({
  elements,
  selectedElement,
  onElementsChange,
  onSelectElement,
}: CanvasProps) {
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggedOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only set to false if we're leaving the canvas entirely
    // Check if the related target is still within the canvas
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (
      x < rect.left ||
      x >= rect.right ||
      y < rect.top ||
      y >= rect.bottom
    ) {
      setIsDraggedOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggedOver(false);

    try {
      const data = e.dataTransfer.getData('application/json');
      const dragData = JSON.parse(data);

      // Check if this is a new element being added (from toolbar)
      if (dragData.type && !dragData.index) {
        const elementType: ElementType = dragData;
        addNewElement(elementType);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const addNewElement = (elementType: ElementType) => {
    const newElement: TemplateElement = {
      id: `${elementType.type}-${Date.now()}`,
      type: elementType.type,
      order: elements.length,
      position: 'auto',
      size: {
        width: 'auto',
        height: 'auto',
      },
      properties: getDefaultProperties(elementType.type),
    };

    onElementsChange([...elements, newElement]);
  };

  const handleDelete = (elementId: string) => {
    const filtered = elements.filter((el) => el.id !== elementId);
    // Reorder remaining elements
    const reordered = filtered.map((el, index) => ({
      ...el,
      order: index,
    }));
    onElementsChange(reordered);

    // Clear selection if deleted element was selected
    if (selectedElement?.id === elementId) {
      onSelectElement(null);
    }
  };

  const handleReorder = (dragIndex: number, dropIndex: number) => {
    const newElements = [...elements];
    const [draggedElement] = newElements.splice(dragIndex, 1);
    newElements.splice(dropIndex, 0, draggedElement);

    // Update order property for all elements
    const reordered = newElements.map((el, index) => ({
      ...el,
      order: index,
    }));

    onElementsChange(reordered);
  };

  const handleSelect = (element: TemplateElement) => {
    onSelectElement(element);
  };

  return (
    <div
      className="flex-1 p-8 overflow-y-auto bg-gray-50"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="max-w-4xl mx-auto">
        {/* Canvas Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Template Canvas</h2>
          <p className="text-sm text-gray-500 mt-1">
            Drag elements from the sidebar to build your template
          </p>
        </div>

        {/* Drop Zone / Elements Container */}
        <div
          className={`
            min-h-[600px] rounded-lg border-2 border-dashed bg-white p-6
            transition-all duration-200
            ${
              isDraggedOver
                ? 'border-blue-400 bg-blue-50 shadow-lg'
                : 'border-gray-300'
            }
          `}
        >
          {elements.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-[550px] text-center">
              <div
                className={`
                  rounded-full p-6 mb-4 transition-colors
                  ${isDraggedOver ? 'bg-blue-100' : 'bg-gray-100'}
                `}
              >
                {isDraggedOver ? (
                  <Plus className="w-12 h-12 text-blue-600" />
                ) : (
                  <FileStack className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {isDraggedOver ? 'Drop element here' : 'No elements yet'}
              </h3>
              <p className="text-sm text-gray-500 max-w-sm">
                {isDraggedOver
                  ? 'Release to add this element to your template'
                  : 'Drag elements from the sidebar to start building your PDF template'}
              </p>
            </div>
          ) : (
            // Elements List
            <div className="space-y-3">
              {elements.map((element, index) => (
                <DraggableElement
                  key={element.id}
                  element={element}
                  index={index}
                  isSelected={selectedElement?.id === element.id}
                  onSelect={handleSelect}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              ))}

              {/* Drop hint when dragging */}
              {isDraggedOver && (
                <div className="flex items-center justify-center h-20 border-2 border-dashed border-blue-400 rounded-lg bg-blue-50">
                  <p className="text-sm text-blue-600 font-medium">
                    Drop here to add element
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {elements.length > 0 && (
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Click an element to edit properties • Drag elements to reorder • Hover to delete
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Get default properties for a new element based on its type
 */
function getDefaultProperties(type: string): Record<string, any> {
  const defaults: Record<string, Record<string, any>> = {
    header: {
      text: 'New Header',
      fontSize: 24,
      fontWeight: 600,
      align: 'left',
    },
    logo: {
      url: '',
      width: 150,
      height: 50,
      align: 'left',
    },
    itemTable: {
      showHeaders: true,
      showBorders: true,
      alternateRows: true,
    },
    textBlock: {
      text: 'Enter your text here...',
      fontSize: 12,
      lineHeight: 1.5,
    },
    clientDetails: {
      showEmail: true,
      showPhone: true,
      showAddress: true,
    },
    summaryBox: {
      showSubtotal: true,
      showDiscount: true,
      showTax: true,
      showTotal: true,
      boxStyle: 'outlined',
    },
    signatureBlock: {
      numberOfSignatures: 2,
      showDate: true,
      showPrintName: true,
    },
    divider: {
      thickness: 1,
      color: '#E5E7EB',
      style: 'solid',
    },
    spacer: {
      height: 20,
    },
    qrCode: {
      data: '{{quoteNumber}}',
      size: 100,
      errorCorrectionLevel: 'M',
      backgroundColor: '#ffffff',
      foregroundColor: '#000000',
      margin: 4,
      label: 'Scan for details',
      labelFontSize: 9,
      alignment: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
    chart: {
      chartType: 'pie',
      dataSource: 'categories',
      title: 'Category Breakdown',
      titleFontSize: 12,
      showLegend: true,
      showValues: true,
      showPercentages: true,
      width: 200,
      height: 200,
      alignment: 'center',
      marginTop: 10,
      marginBottom: 10,
    },
  };

  return defaults[type] || {};
}
