'use client';

import React, { useState, useEffect } from 'react';
import { X, FileText, Check, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PDFTemplate, TemplateCategory } from '@/lib/types';

interface TemplateSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectTemplate: (template: PDFTemplate) => void;
  currentTemplateId?: string;
}

export function TemplateSelectorDialog({
  open,
  onOpenChange,
  onSelectTemplate,
  currentTemplateId,
}: TemplateSelectorDialogProps) {
  const [templates, setTemplates] = useState<PDFTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(currentTemplateId);

  useEffect(() => {
    if (open) {
      fetchTemplates();
      setSelectedTemplateId(currentTemplateId);
    }
  }, [open, currentTemplateId]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      const data = await response.json();

      // Map database response to frontend format
      const mappedTemplates = data.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        isDefault: t.isdefault || t.isDefault,
        isPublic: t.ispublic || t.isPublic,
        templateJson: t.template_json || t.templateJson,
        thumbnail: t.thumbnail,
        createdBy: t.createdby || t.createdBy,
        createdAt: t.createdat || t.createdAt,
        updatedAt: t.updatedat || t.updatedAt,
        version: t.version,
      }));

      setTemplates(mappedTemplates);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories: Array<{ value: TemplateCategory | 'all'; label: string }> = [
    { value: 'all', label: 'All Templates' },
    { value: 'modern', label: 'Modern' },
    { value: 'business', label: 'Business' },
    { value: 'elegant', label: 'Elegant' },
    { value: 'minimalist', label: 'Minimalist' },
    { value: 'creative', label: 'Creative' },
    { value: 'bold', label: 'Bold' },
    { value: 'custom', label: 'Custom' },
  ];

  const filteredTemplates =
    selectedCategory === 'all'
      ? templates
      : templates.filter((t) => t.category === selectedCategory);

  const handleSelectTemplate = (template: PDFTemplate) => {
    setSelectedTemplateId(template.id);
  };

  const handleConfirm = () => {
    const template = templates.find((t) => t.id === selectedTemplateId);
    if (template) {
      onSelectTemplate(template);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Select PDF Template
          </DialogTitle>
        </DialogHeader>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="aspect-[8.5/11] bg-gray-200 rounded mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FileText className="w-12 h-12 mb-2 opacity-50" />
              <p>No templates found in this category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className={`border rounded-lg p-4 text-left transition-all hover:shadow-md ${
                    selectedTemplateId === template.id
                      ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Thumbnail or Placeholder */}
                  <div className="relative aspect-[8.5/11] bg-gray-100 rounded mb-3 flex items-center justify-center overflow-hidden">
                    {template.thumbnail ? (
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-gray-400" />
                    )}

                    {/* Selection Indicator */}
                    {selectedTemplateId === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}

                    {/* Default Badge */}
                    {template.isDefault && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Default
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{template.category}</p>
                  {template.description && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedTemplateId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Use Selected Template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
