'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useQuoteStore } from '@/lib/store';
import { calculateQuoteTotals, formatCurrency } from '@/lib/calculations';

export function Summary() {
  const items = useQuoteStore((state) => state.items);
  const discountMode = useQuoteStore((state) => state.discountMode);
  const overallDiscount = useQuoteStore((state) => state.overallDiscount);
  const taxRate = useQuoteStore((state) => state.taxRate);
  const setOverallDiscount = useQuoteStore((state) => state.setOverallDiscount);

  const calculations = useMemo(() => {
    if (items.length === 0) {
      return {
        subtotal: 0,
        discount: 0,
        taxableAmount: 0,
        tax: 0,
        grandTotal: 0,
        categoryContributions: [],
      };
    }

    return calculateQuoteTotals(
      items as any,
      discountMode,
      overallDiscount,
      taxRate
    );
  }, [items, discountMode, overallDiscount, taxRate]);

  const showOverallDiscount = discountMode === 'OVERALL' || discountMode === 'BOTH';

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">
              3
            </span>
            Summary & Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(calculations.subtotal)}</span>
            </div>

            {showOverallDiscount && (
              <div className="flex justify-between items-center text-sm gap-4">
                <span className="text-gray-600">Discount</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={overallDiscount}
                    onChange={(e) =>
                      setOverallDiscount(parseFloat(e.target.value) || 0)
                    }
                    className="w-20 h-8 text-sm"
                    data-testid="overall-discount-input"
                  />
                  <span className="text-xs">%</span>
                  <span className="font-medium text-red-600 w-24 text-right">
                    - {formatCurrency(calculations.discount)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (GST {taxRate}%)</span>
              <span className="font-medium">{formatCurrency(calculations.tax)}</span>
            </div>

            <div className="border-t pt-3 flex justify-between text-base font-bold">
              <span>Grand Total</span>
              <span className="text-blue-600">
                {formatCurrency(calculations.grandTotal)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Contributions */}
      {calculations.categoryContributions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Category Contributions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {calculations.categoryContributions.map((contrib) => (
                <div key={contrib.categoryName} className="flex justify-between text-sm">
                  <span className="text-gray-700">{contrib.categoryName}</span>
                  <span className="font-medium">{formatCurrency(contrib.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}



