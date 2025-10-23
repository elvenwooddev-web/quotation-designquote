/**
 * Indian Standard Units of Measure (UOM) for Home Interior Industry
 * Comprehensive list organized by measurement type
 */

export interface UOMOption {
  value: string;
  label: string;
  category: 'area' | 'linear' | 'volume' | 'weight' | 'quantity' | 'special' | string;
}

/**
 * Complete list of Indian standard UOMs for home interior industry
 * Sorted alphabetically for easy searching
 */
export const INDIAN_STANDARD_UOMS: UOMOption[] = [
  // Area Measurements
  { value: 'sq cm', label: 'sq cm - Square Centimeter', category: 'area' },
  { value: 'sq ft', label: 'sq ft - Square Feet', category: 'area' },
  { value: 'sq inch', label: 'sq inch - Square Inch', category: 'area' },
  { value: 'sq m', label: 'sq m - Square Meter', category: 'area' },

  // Linear Measurements
  { value: 'cm', label: 'cm - Centimeter', category: 'linear' },
  { value: 'ft', label: 'ft - Feet', category: 'linear' },
  { value: 'inch', label: 'inch - Inch', category: 'linear' },
  { value: 'm', label: 'm - Meter', category: 'linear' },
  { value: 'mm', label: 'mm - Millimeter', category: 'linear' },
  { value: 'RFT', label: 'RFT - Running Feet', category: 'linear' },
  { value: 'RM', label: 'RM - Running Meter', category: 'linear' },

  // Volume Measurements
  { value: 'cu ft', label: 'cu ft - Cubic Feet', category: 'volume' },
  { value: 'cu m', label: 'cu m - Cubic Meter', category: 'volume' },
  { value: 'cum', label: 'cum - Cubic Meter (Construction)', category: 'volume' },
  { value: 'gallon', label: 'gallon - Gallon', category: 'volume' },
  { value: 'liter', label: 'liter - Liter', category: 'volume' },

  // Weight Measurements
  { value: 'gm', label: 'gm - Gram', category: 'weight' },
  { value: 'kg', label: 'kg - Kilogram', category: 'weight' },
  { value: 'quintal', label: 'quintal - Quintal', category: 'weight' },
  { value: 'ton', label: 'ton - Tonne', category: 'weight' },

  // Quantity/Count Measurements
  { value: 'bag', label: 'bag - Bag', category: 'quantity' },
  { value: 'box', label: 'box - Box', category: 'quantity' },
  { value: 'bundle', label: 'bundle - Bundle', category: 'quantity' },
  { value: 'carton', label: 'carton - Carton', category: 'quantity' },
  { value: 'coil', label: 'coil - Coil', category: 'quantity' },
  { value: 'nos', label: 'nos - Numbers', category: 'quantity' },
  { value: 'pack', label: 'pack - Pack', category: 'quantity' },
  { value: 'pair', label: 'pair - Pair', category: 'quantity' },
  { value: 'panel', label: 'panel - Panel', category: 'quantity' },
  { value: 'pcs', label: 'pcs - Pieces', category: 'quantity' },
  { value: 'roll', label: 'roll - Roll', category: 'quantity' },
  { value: 'set', label: 'set - Set', category: 'quantity' },
  { value: 'sheet', label: 'sheet - Sheet', category: 'quantity' },
  { value: 'slab', label: 'slab - Slab', category: 'quantity' },
  { value: 'tile', label: 'tile - Tile', category: 'quantity' },
  { value: 'unit', label: 'unit - Unit', category: 'quantity' },

  // Special Measurements (Indian specific)
  { value: 'brass', label: 'brass - Brass (Timber)', category: 'special' },
  { value: 'sqm of shuttering', label: 'sqm of shuttering - Square Meter of Shuttering', category: 'special' },
].sort((a, b) => a.value.localeCompare(b.value));

/**
 * Get all UOM values as a simple string array
 */
export const UOM_VALUES = INDIAN_STANDARD_UOMS.map(uom => uom.value);

/**
 * Get all UOM labels as a simple string array
 */
export const UOM_LABELS = INDIAN_STANDARD_UOMS.map(uom => uom.label);

/**
 * Find UOM option by value
 */
export function findUOMByValue(value: string): UOMOption | undefined {
  return INDIAN_STANDARD_UOMS.find(uom => uom.value === value);
}

/**
 * Check if a UOM value is valid
 */
export function isValidUOM(value: string): boolean {
  return UOM_VALUES.includes(value);
}

/**
 * Search UOMs by query string
 */
export function searchUOMs(query: string): UOMOption[] {
  if (!query || query.trim() === '') {
    return INDIAN_STANDARD_UOMS;
  }

  const lowerQuery = query.toLowerCase();
  return INDIAN_STANDARD_UOMS.filter(uom =>
    uom.value.toLowerCase().includes(lowerQuery) ||
    uom.label.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get UOMs by category
 */
export function getUOMsByCategory(category: UOMOption['category']): UOMOption[] {
  return INDIAN_STANDARD_UOMS.filter(uom => uom.category === category);
}
