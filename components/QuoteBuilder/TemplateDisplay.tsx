'use client';

import React from 'react';
import { FileText, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PDFTemplate } from '@/lib/types';

interface TemplateDisplayProps {
  template?: PDFTemplate;
  onChangeTemplate: () => void;
  loading?: boolean;
}

export function TemplateDisplay({ template, onChangeTemplate, loading }: TemplateDisplayProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-200 rounded animate-pulse">
          <FileText className="w-6 h-6 text-gray-400" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-12 h-12 bg-amber-100 rounded">
            <FileText className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-amber-900">No template selected</p>
            <p className="text-xs text-amber-700">Select a template for this quote</p>
          </div>
        </div>
        <Button
          onClick={onChangeTemplate}
          variant="outline"
          size="sm"
          className="border-amber-300 hover:bg-amber-100"
        >
          Select Template
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-center gap-3">
        {template.thumbnail ? (
          <img
            src={template.thumbnail}
            alt={template.name}
            className="w-12 h-12 object-cover rounded border border-blue-300"
          />
        ) : (
          <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded">
            <FileText className="w-6 h-6 text-blue-600" />
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-blue-900">{template.name}</p>
            <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full capitalize">
              {template.category}
            </span>
          </div>
          {template.description && (
            <p className="text-xs text-blue-700 mt-0.5">{template.description}</p>
          )}
        </div>
      </div>
      <Button
        onClick={onChangeTemplate}
        variant="outline"
        size="sm"
        className="border-blue-300 hover:bg-blue-100"
      >
        <Edit2 className="w-3 h-3 mr-1" />
        Change
      </Button>
    </div>
  );
}
