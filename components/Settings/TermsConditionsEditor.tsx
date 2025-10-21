'use client';

import { RichTextEditor } from '@/components/ui/rich-text-editor';

interface TermsConditionsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TermsConditionsEditor({ value, onChange }: TermsConditionsEditorProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms & Conditions</h3>
      <p className="text-sm text-gray-600 mb-6">
        Define the terms and conditions for your quotations and contracts.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Default Terms</label>
        <RichTextEditor
          value={value}
          onChange={onChange}
          placeholder="Enter your default terms and conditions..."
          className="w-full"
        />
      </div>
    </div>
  );
}
