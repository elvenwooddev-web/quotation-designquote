'use client';

import React, { useState, useEffect } from 'react';
import {
  PDFTemplate,
  TemplateElement,
  TemplateJSON,
  TemplateCategory,
} from '@/lib/types';
import EditorTopBar from './EditorTopBar';
import ElementToolbar, { ElementType } from './ElementToolbar';
import TemplateCanvas from './TemplateCanvas';
import PropertyPanel from './PropertyPanel';
import { PDFPreviewModal } from '@/components/PDFPreviewModal';
import { downloadTemplateAsFile } from '@/lib/template-export';

interface TemplateEditorProps {
  template: PDFTemplate;
  onSave: (template: PDFTemplate) => Promise<PDFTemplate>;
  onBack: () => void;
}

export function TemplateEditor({ template, onSave, onBack }: TemplateEditorProps) {
  // Template state
  const [templateName, setTemplateName] = useState(template.name);
  const [category, setCategory] = useState<TemplateCategory>(template.category);
  const [elements, setElements] = useState<TemplateElement[]>(template.templateJson.elements);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Update local state when template prop changes
  useEffect(() => {
    setTemplateName(template.name);
    setCategory(template.category);
    setElements(template.templateJson.elements);
  }, [template]);

  const handleAddElement = (elementType: ElementType) => {
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

    setElements([...elements, newElement]);
    setSelectedElement(newElement);
  };

  const handleDeleteElement = (elementId: string) => {
    const updatedElements = elements.filter((el) => el.id !== elementId);

    // Reorder remaining elements
    const reorderedElements = updatedElements.map((el, index) => ({
      ...el,
      order: index,
    }));

    setElements(reorderedElements);

    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleSelectElement = (element: TemplateElement) => {
    setSelectedElement(element);
  };

  const handleUpdateElement = (elementId: string, updates: Partial<TemplateElement>) => {
    setElements((prevElements) =>
      prevElements.map((el) =>
        el.id === elementId ? { ...el, ...updates } : el
      )
    );

    // Update selected element if it's the one being updated
    if (selectedElement?.id === elementId) {
      setSelectedElement((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const handleReorderElement = (elementId: string, newOrder: number) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const oldOrder = element.order;

    // Update orders for affected elements
    const updatedElements = elements.map((el) => {
      if (el.id === elementId) {
        return { ...el, order: newOrder };
      }

      if (oldOrder < newOrder) {
        // Moving down: shift elements up
        if (el.order > oldOrder && el.order <= newOrder) {
          return { ...el, order: el.order - 1 };
        }
      } else {
        // Moving up: shift elements down
        if (el.order >= newOrder && el.order < oldOrder) {
          return { ...el, order: el.order + 1 };
        }
      }

      return el;
    });

    setElements(updatedElements);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const templateJson: TemplateJSON = {
        ...template.templateJson,
        elements,
      };

      const updatedTemplate: PDFTemplate = {
        ...template,
        name: templateName,
        category,
        templateJson,
      };

      await onSave(updatedTemplate);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Open the PDF preview modal
    setShowPreview(true);
  };

  const handleExport = () => {
    // Create a template object with current state
    const templateJson: TemplateJSON = {
      ...template.templateJson,
      elements,
    };

    const currentTemplate: PDFTemplate = {
      ...template,
      name: templateName,
      category,
      templateJson,
    };

    // Download the template as JSON file
    downloadTemplateAsFile(currentTemplate);
  };

  return (
    <>
      <div className="flex flex-col h-screen">
        {/* Top Bar */}
        <EditorTopBar
          templateName={templateName}
          onTemplateNameChange={setTemplateName}
          onSave={handleSave}
          onPreview={handlePreview}
          onExport={handleExport}
          saving={saving}
        />

        {/* Main Editor Layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left: Element Toolbar */}
          <ElementToolbar />

          {/* Center: Canvas */}
          <TemplateCanvas
            elements={elements}
            selectedElement={selectedElement}
            onSelectElement={handleSelectElement}
            onDeleteElement={handleDeleteElement}
            onAddElement={handleAddElement}
            onReorderElement={handleReorderElement}
          />

          {/* Right: Property Panel */}
          <PropertyPanel
            selectedElement={selectedElement}
            onUpdateElement={handleUpdateElement}
          />
        </div>
      </div>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        templateId={template.id || undefined}
        template={!template.id ? {
          ...template,
          name: templateName,
          category: category,
          templateJson: {
            ...template.templateJson,
            elements: elements,
          },
        } : undefined}
        title={`Preview: ${templateName}`}
      />
    </>
  );
}

/**
 * Get default properties for a new element based on its type
 */
function getDefaultProperties(type: string): Record<string, any> {
  switch (type) {
    case 'header':
      return {
        text: 'Header Text',
        fontSize: 24,
        color: '#000000',
        alignment: 'left',
      };

    case 'textBlock':
      return {
        content: 'Enter your text content here...',
        fontSize: 12,
        color: '#000000',
      };

    case 'table':
      return {
        showBorders: true,
        alternatingRows: false,
      };

    case 'divider':
      return {
        thickness: 1,
        color: '#000000',
        style: 'solid',
      };

    case 'spacer':
      return {
        height: 20,
      };

    case 'clientDetails':
      return {
        showName: true,
        showAddress: true,
        showEmail: true,
        showPhone: true,
      };

    case 'itemTable':
      return {
        showHeaders: true,
        showItemCode: true,
        showDescription: true,
        showQuantity: true,
        showRate: true,
        showDiscount: true,
        showTotal: true,
      };

    case 'summaryBox':
      return {
        showSubtotal: true,
        showDiscount: true,
        showTax: true,
        showTotal: true,
      };

    case 'logo':
      return {
        imageUrl: '',
        maxWidth: 200,
        maxHeight: 100,
      };

    case 'signatureBlock':
      return {
        showDate: true,
        showTitle: true,
        lineCount: 2,
      };

    default:
      return {};
  }
}
