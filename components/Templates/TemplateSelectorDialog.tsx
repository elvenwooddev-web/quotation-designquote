'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PDFTemplate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { TemplateSelector } from './TemplateSelector';

interface TemplateSelectorDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (templateId: string, template: PDFTemplate) => void;
  currentTemplateId?: string | null;
  title?: string;
}

export function TemplateSelectorDialog({
  open,
  onClose,
  onSelect,
  currentTemplateId,
  title = 'Select Template',
}: TemplateSelectorDialogProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    currentTemplateId || null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);

  // Update selected template when current template changes
  useEffect(() => {
    setSelectedTemplateId(currentTemplateId || null);
  }, [currentTemplateId]);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleCancel();
      }
    };

    if (open) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleTemplateSelect = (templateId: string, template: PDFTemplate) => {
    setSelectedTemplateId(templateId);
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplateId && selectedTemplate) {
      onSelect(selectedTemplateId, selectedTemplate);
      onClose();
    }
  };

  const handleCancel = () => {
    // Reset to current template
    setSelectedTemplateId(currentTemplateId || null);
    setSelectedTemplate(null);
    onClose();
  };

  if (!open) return null;

  const hasChanges = selectedTemplateId !== currentTemplateId;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a PDF template for your quote
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <TemplateSelector
            selectedTemplateId={selectedTemplateId}
            onSelect={handleTemplateSelect}
            showPreview={true}
            compact={false}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {selectedTemplate ? (
              <>
                Selected: <span className="font-medium">{selectedTemplate.name}</span>
              </>
            ) : (
              'No template selected'
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={!selectedTemplateId}
            >
              {hasChanges ? 'Select Template' : 'Confirm'}
            </Button>
          </div>
        </div>

        {/* Keyboard shortcuts hint */}
        <div className="px-6 py-2 border-t bg-gray-50 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>
              <kbd className="px-2 py-1 bg-white border rounded text-xs">Arrow keys</kbd> to
              navigate
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white border rounded text-xs">Enter</kbd> to select
            </span>
            <span>
              <kbd className="px-2 py-1 bg-white border rounded text-xs">Esc</kbd> to close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
