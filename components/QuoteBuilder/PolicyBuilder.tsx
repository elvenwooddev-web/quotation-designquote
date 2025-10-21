'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useQuoteStore } from '@/lib/store';

export function PolicyBuilder() {
  const policies = useQuoteStore((state) => state.policies);
  const updatePolicy = useQuoteStore((state) => state.updatePolicy);

  // Get the first policy's description as the terms content
  const termsContent = policies.find(p => p.isActive)?.description || '';

  const handleTermsChange = (value: string) => {
    // Update the first policy's description
    if (policies.length > 0) {
      updatePolicy(policies[0].type, { description: value, isActive: true });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">
            4
          </span>
          Terms and Conditions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Add terms and conditions for this quotation:
        </p>

        <Textarea
          value={termsContent}
          onChange={(e) => handleTermsChange(e.target.value)}
          placeholder="Enter terms and conditions here..."
          rows={12}
          className="text-sm font-mono"
        />

        <p className="text-xs text-gray-500">
          These terms will appear on the quotation PDF
        </p>
      </CardContent>
    </Card>
  );
}
