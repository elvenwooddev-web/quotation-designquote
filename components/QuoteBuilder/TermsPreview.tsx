'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuoteStore } from '@/lib/store';

export function TermsPreview() {
  const policies = useQuoteStore((state) => state.policies);

  const activeTerms = policies
    .filter((p) => p.isActive)
    .sort((a, b) => a.order - b.order);

  if (activeTerms.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Real-time Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="font-semibold text-sm mb-3 text-gray-900">
            Terms and Conditions for Quotation:
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {activeTerms.map((policy, index) => (
              <li key={`${policy.type}-${policy.order}`} className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <div>
                  <span className="font-medium">{policy.title}:</span>{' '}
                  {policy.description}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}



