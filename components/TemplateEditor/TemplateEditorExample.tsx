'use client';

import React, { useState } from 'react';
import { TemplateElement } from '@/lib/types';
import ElementToolbar from './ElementToolbar';
import Canvas from './Canvas';

/**
 * Example usage of the drag-and-drop template editor
 * This component demonstrates how to integrate ElementToolbar and Canvas
 * with React state management
 */
export default function TemplateEditorExample() {
  const [elements, setElements] = useState<TemplateElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);

  const handleElementsChange = (newElements: TemplateElement[]) => {
    setElements(newElements);
  };

  const handleSelectElement = (element: TemplateElement | null) => {
    setSelectedElement(element);
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Sidebar - Element Toolbar */}
      <ElementToolbar />

      {/* Main Canvas - Drop Zone */}
      <Canvas
        elements={elements}
        selectedElement={selectedElement}
        onElementsChange={handleElementsChange}
        onSelectElement={handleSelectElement}
      />

      {/* Right Sidebar - Properties Panel (Placeholder) */}
      <div className="w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">Properties</h2>
        {selectedElement ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Selected: <span className="font-medium">{selectedElement.type}</span>
            </p>
            <pre className="text-xs bg-gray-50 p-3 rounded border border-gray-200 overflow-auto">
              {JSON.stringify(selectedElement, null, 2)}
            </pre>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Select an element to edit its properties
          </p>
        )}
      </div>
    </div>
  );
}
