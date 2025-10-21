'use client';

import { useState, useEffect } from 'react';
import { getAvailableConversions, getUnitCategory, getCommonUnits, convertUnit } from '@/lib/unit-conversions';
import { Input } from './input';
import { Label } from './label';
import { Select } from './select';

interface UnitConverterProps {
  value: number;
  unit: string;
  onValueChange: (value: number) => void;
  onUnitChange: (unit: string) => void;
  className?: string;
}

export function UnitConverter({ value, unit, onValueChange, onUnitChange, className = '' }: UnitConverterProps) {
  const [convertedValue, setConvertedValue] = useState<number>(value);
  const [convertedUnit, setConvertedUnit] = useState<string>(unit);
  const [availableUnits, setAvailableUnits] = useState<string[]>([]);

  useEffect(() => {
    if (unit) {
      const conversions = getAvailableConversions(unit);
      const category = getUnitCategory(unit);
      const commonUnits = category !== 'other' ? getCommonUnits(category) : [];

      // Combine available conversions with common units for the category
      const allUnits = [...new Set([...conversions, ...commonUnits, unit])];
      setAvailableUnits(allUnits);
    }
  }, [unit]);

  const handleUnitChange = (newUnit: string) => {
    if (newUnit === unit) return;
    
    const converted = convertUnit(value, unit, newUnit);
    if (converted !== null) {
      setConvertedValue(converted);
      setConvertedUnit(newUnit);
      onValueChange(converted);
      onUnitChange(newUnit);
    }
  };

  const handleValueChange = (newValue: number) => {
    setConvertedValue(newValue);
    onValueChange(newValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            type="number"
            value={convertedValue}
            onChange={(e) => handleValueChange(Number(e.target.value))}
            step="0.01"
            min="0"
          />
        </div>
        <div>
          <Label htmlFor="unit">Unit</Label>
          <Select
            id="unit"
            value={convertedUnit}
            onChange={(e) => handleUnitChange(e.target.value)}
          >
            {availableUnits.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>
      </div>
      
      {unit !== convertedUnit && (
        <div className="text-xs text-gray-500">
          Converted from {value} {unit} to {convertedValue.toFixed(2)} {convertedUnit}
        </div>
      )}
    </div>
  );
}
