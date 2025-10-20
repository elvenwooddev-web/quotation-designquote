'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Eye, Undo, Redo, Loader2, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditorTopBarProps {
  templateName: string;
  onTemplateNameChange: (name: string) => void;
  onSave: () => void;
  onPreview: () => void;
  onExport?: () => void;
  saving: boolean;
}

export default function EditorTopBar({
  templateName,
  onTemplateNameChange,
  onSave,
  onPreview,
  onExport,
  saving,
}: EditorTopBarProps) {
  const router = useRouter();
  const [isEditingName, setIsEditingName] = useState(false);
  const [localName, setLocalName] = useState(templateName);

  const handleNameBlur = () => {
    setIsEditingName(false);
    if (localName.trim()) {
      onTemplateNameChange(localName.trim());
    } else {
      setLocalName(templateName);
    }
  };

  const handleNameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setLocalName(templateName);
      setIsEditingName(false);
    }
  };

  return (
    <div className="border-b bg-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Back to Templates Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/templates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Template Name Input */}
        <div className="flex items-center gap-2">
          {isEditingName ? (
            <Input
              value={localName}
              onChange={(e) => setLocalName(e.target.value)}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
              className="w-64"
              placeholder="Template name"
            />
          ) : (
            <h1
              className="text-xl font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => setIsEditingName(true)}
              title="Click to edit"
            >
              {templateName || 'Untitled Template'}
            </h1>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Undo/Redo Buttons (Disabled for MVP) */}
        <Button
          variant="ghost"
          size="sm"
          disabled
          className="flex items-center gap-2 opacity-50 cursor-not-allowed"
          title="Undo (Coming soon)"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          disabled
          className="flex items-center gap-2 opacity-50 cursor-not-allowed"
          title="Redo (Coming soon)"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2" />

        {/* Export Button */}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center gap-2"
            title="Export template as JSON file"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}

        {/* Preview Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onPreview}
          className="flex items-center gap-2"
        >
          <Eye className="h-4 w-4" />
          Preview
        </Button>

        {/* Save Button */}
        <Button
          variant="default"
          size="sm"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Template
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
