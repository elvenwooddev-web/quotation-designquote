'use client';

import { useState, useEffect } from 'react';
import { Type, Image, Table, FileText, GripVertical } from 'lucide-react';

interface TemplateElement {
  id: string;
  type: 'header' | 'logo' | 'itemTable' | 'textBlock';
  label: string;
}

const availableElements: TemplateElement[] = [
  { id: 'header', type: 'header', label: 'Header' },
  { id: 'logo', type: 'logo', label: 'Logo' },
  { id: 'itemTable', type: 'itemTable', label: 'Item Table' },
  { id: 'textBlock', type: 'textBlock', label: 'Text Block' },
];

interface PDFTemplateEditorProps {
  value: TemplateElement[];
  onChange: (value: TemplateElement[]) => void;
}

export function PDFTemplateEditor({ value, onChange }: PDFTemplateEditorProps) {
  const [droppedElements, setDroppedElements] = useState<TemplateElement[]>(
    Array.isArray(value) ? value : []
  );
  const [draggedOver, setDraggedOver] = useState(false);

  // Sync state when value prop changes
  useEffect(() => {
    if (Array.isArray(value)) {
      setDroppedElements(value);
    }
  }, [value]);

  const handleDragStart = (e: React.DragEvent, element: TemplateElement) => {
    e.dataTransfer.setData('element', JSON.stringify(element));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(true);
  };

  const handleDragLeave = () => {
    setDraggedOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedOver(false);

    const elementData = e.dataTransfer.getData('element');
    if (elementData) {
      const element = JSON.parse(elementData);
      const newElement = { ...element, id: `${element.type}-${Date.now()}` };
      const updated = [...droppedElements, newElement];
      setDroppedElements(updated);
      onChange(updated);
    }
  };

  const getElementIcon = (type: string) => {
    switch (type) {
      case 'header':
        return <Type className="h-4 w-4" />;
      case 'logo':
        return <Image className="h-4 w-4" />;
      case 'itemTable':
        return <Table className="h-4 w-4" />;
      case 'textBlock':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Editor</h3>
      <p className="text-sm text-gray-600 mb-6">Customize your quotation template.</p>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg min-h-[300px] p-8 mb-6 transition-colors ${
          draggedOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        }`}
      >
        {droppedElements.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-dashed border-gray-300 flex items-center justify-center mb-4">
              <GripVertical className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">Drag & Drop Elements</p>
            <p className="text-xs text-gray-500">
              Drag elements from the panel to add them to your template.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {droppedElements.map((element) => (
              <div
                key={element.id}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg"
              >
                <GripVertical className="h-4 w-4 text-gray-400" />
                {getElementIcon(element.type)}
                <span className="text-sm font-medium text-gray-900">{element.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Elements Panel */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Elements</h4>
        <div className="grid grid-cols-2 gap-3">
          {availableElements.map((element) => (
            <div
              key={element.id}
              draggable
              onDragStart={(e) => handleDragStart(e, element)}
              className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-move hover:bg-gray-100 transition-colors"
            >
              {getElementIcon(element.type)}
              <span className="text-sm font-medium text-gray-700">{element.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
