'use client';

import React, { useState } from 'react';
import { Calculator } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DimensionsCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCalculate: (result: number) => void;
  initialQuantity?: number;
  unit: string;
}

export function DimensionsCalculator({
  open,
  onOpenChange,
  onCalculate,
  initialQuantity = 0,
  unit,
}: DimensionsCalculatorProps) {
  const [length, setLength] = useState<string>('');
  const [width, setWidth] = useState<string>('');

  const calculatedArea = (parseFloat(length) || 0) * (parseFloat(width) || 0);

  const handleApply = () => {
    if (calculatedArea > 0) {
      onCalculate(calculatedArea);
      onOpenChange(false);
      // Reset values
      setLength('');
      setWidth('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setLength('');
    setWidth('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculate Area ({unit})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="length">Length (ft)</Label>
              <Input
                id="length"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width (ft)</Label>
              <Input
                id="width"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
              />
            </div>
          </div>

          {/* Calculation Display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-900 mb-1">Area:</div>
            <div className="font-mono text-lg font-semibold text-blue-700">
              {length || '0'} × {width || '0'} = {calculatedArea.toFixed(2)} {unit}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              disabled={calculatedArea <= 0}
            >
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
