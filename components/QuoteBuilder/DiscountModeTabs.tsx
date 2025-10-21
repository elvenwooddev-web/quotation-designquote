'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuoteStore } from '@/lib/store';
import { DiscountMode } from '@/lib/types';
import { cn } from '@/lib/utils';

const modes = [
  { value: 'LINE_ITEM' as DiscountMode, label: 'Line Item Discount' },
  { value: 'OVERALL' as DiscountMode, label: 'Overall Discount' },
  { value: 'BOTH' as DiscountMode, label: 'Both' },
];

export function DiscountModeTabs() {
  const discountMode = useQuoteStore((state) => state.discountMode);
  const setDiscountMode = useQuoteStore((state) => state.setDiscountMode);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-700">Discount Mode</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setDiscountMode(mode.value)}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
                discountMode === mode.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}



