// Unit conversion utilities based on UOM (Unit of Measure)

export interface UnitConversion {
  from: string;
  to: string;
  factor: number;
}

// Common unit conversions for different measurement types
export const UNIT_CONVERSIONS: UnitConversion[] = [
  // Area conversions (sq ft, sq m, sq yd, sq in)
  { from: 'sq ft', to: 'sq m', factor: 0.092903 },
  { from: 'sq m', to: 'sq ft', factor: 10.7639 },
  { from: 'sq ft', to: 'sq yd', factor: 0.111111 },
  { from: 'sq yd', to: 'sq ft', factor: 9 },
  { from: 'sq ft', to: 'sq in', factor: 144 },
  { from: 'sq in', to: 'sq ft', factor: 0.00694444 },
  
  // Linear conversions (ft, m, yd, in, cm)
  { from: 'ft', to: 'm', factor: 0.3048 },
  { from: 'm', to: 'ft', factor: 3.28084 },
  { from: 'ft', to: 'yd', factor: 0.333333 },
  { from: 'yd', to: 'ft', factor: 3 },
  { from: 'ft', to: 'in', factor: 12 },
  { from: 'in', to: 'ft', factor: 0.0833333 },
  { from: 'm', to: 'cm', factor: 100 },
  { from: 'cm', to: 'm', factor: 0.01 },
  { from: 'in', to: 'cm', factor: 2.54 },
  { from: 'cm', to: 'in', factor: 0.393701 },
  
  // Volume conversions (cu ft, cu m, cu yd, cu in, liters, gallons)
  { from: 'cu ft', to: 'cu m', factor: 0.0283168 },
  { from: 'cu m', to: 'cu ft', factor: 35.3147 },
  { from: 'cu ft', to: 'cu yd', factor: 0.037037 },
  { from: 'cu yd', to: 'cu ft', factor: 27 },
  { from: 'cu ft', to: 'cu in', factor: 1728 },
  { from: 'cu in', to: 'cu ft', factor: 0.000578704 },
  { from: 'cu m', to: 'liters', factor: 1000 },
  { from: 'liters', to: 'cu m', factor: 0.001 },
  { from: 'gallons', to: 'liters', factor: 3.78541 },
  { from: 'liters', to: 'gallons', factor: 0.264172 },
  
  // Weight conversions (kg, lbs, g, oz)
  { from: 'kg', to: 'lbs', factor: 2.20462 },
  { from: 'lbs', to: 'kg', factor: 0.453592 },
  { from: 'kg', to: 'g', factor: 1000 },
  { from: 'g', to: 'kg', factor: 0.001 },
  { from: 'lbs', to: 'oz', factor: 16 },
  { from: 'oz', to: 'lbs', factor: 0.0625 },
  
  // Time conversions (hrs, days, weeks, months)
  { from: 'hrs', to: 'days', factor: 0.0416667 },
  { from: 'days', to: 'hrs', factor: 24 },
  { from: 'days', to: 'weeks', factor: 0.142857 },
  { from: 'weeks', to: 'days', factor: 7 },
  { from: 'weeks', to: 'months', factor: 0.230137 },
  { from: 'months', to: 'weeks', factor: 4.34524 },
];

// Get conversion factor between two units
export function getConversionFactor(fromUnit: string, toUnit: string): number | null {
  if (fromUnit === toUnit) return 1;
  
  const conversion = UNIT_CONVERSIONS.find(
    conv => conv.from === fromUnit && conv.to === toUnit
  );
  
  if (conversion) return conversion.factor;
  
  // Try reverse conversion
  const reverseConversion = UNIT_CONVERSIONS.find(
    conv => conv.from === toUnit && conv.to === fromUnit
  );
  
  if (reverseConversion) return 1 / reverseConversion.factor;
  
  return null;
}

// Convert a value from one unit to another
export function convertUnit(value: number, fromUnit: string, toUnit: string): number | null {
  const factor = getConversionFactor(fromUnit, toUnit);
  if (factor === null) return null;
  
  return value * factor;
}

// Get all possible conversions for a given unit
export function getAvailableConversions(unit: string): string[] {
  const conversions = UNIT_CONVERSIONS
    .filter(conv => conv.from === unit)
    .map(conv => conv.to);
  
  const reverseConversions = UNIT_CONVERSIONS
    .filter(conv => conv.to === unit)
    .map(conv => conv.from);
  
  return [...new Set([...conversions, ...reverseConversions])];
}

// Categorize units by measurement type
export function getUnitCategory(unit: string): 'area' | 'linear' | 'volume' | 'weight' | 'time' | 'piece' | 'other' {
  const areaUnits = ['sq ft', 'sq m', 'sq yd', 'sq in', 'sq cm', 'sq mm'];
  const linearUnits = ['ft', 'm', 'yd', 'in', 'cm', 'mm', 'km', 'miles'];
  const volumeUnits = ['cu ft', 'cu m', 'cu yd', 'cu in', 'liters', 'gallons', 'ml'];
  const weightUnits = ['kg', 'lbs', 'g', 'oz', 'tons'];
  const timeUnits = ['hrs', 'days', 'weeks', 'months', 'years'];
  const pieceUnits = ['pcs', 'pieces', 'units', 'items', 'nos', 'each'];
  
  if (areaUnits.includes(unit.toLowerCase())) return 'area';
  if (linearUnits.includes(unit.toLowerCase())) return 'linear';
  if (volumeUnits.includes(unit.toLowerCase())) return 'volume';
  if (weightUnits.includes(unit.toLowerCase())) return 'weight';
  if (timeUnits.includes(unit.toLowerCase())) return 'time';
  if (pieceUnits.includes(unit.toLowerCase())) return 'piece';
  
  return 'other';
}

// Get common units for a category
export function getCommonUnits(category: 'area' | 'linear' | 'volume' | 'weight' | 'time' | 'piece'): string[] {
  const unitCategories = {
    area: ['sq ft', 'sq m', 'sq yd'],
    linear: ['ft', 'm', 'yd', 'in', 'cm'],
    volume: ['cu ft', 'cu m', 'liters', 'gallons'],
    weight: ['kg', 'lbs', 'g'],
    time: ['hrs', 'days', 'weeks'],
    piece: ['pcs', 'pieces', 'units']
  };
  
  return unitCategories[category] || [];
}
