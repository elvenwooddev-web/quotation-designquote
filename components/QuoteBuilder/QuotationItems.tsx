'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuoteStore } from '@/lib/store';
import { calculateLineTotal } from '@/lib/calculations';
import { formatCurrency } from '@/lib/calculations';

export function QuotationItems() {
  const items = useQuoteStore((state) => state.items);
  const discountMode = useQuoteStore((state) => state.discountMode);
  const updateItem = useQuoteStore((state) => state.updateItem);
  const removeItem = useQuoteStore((state) => state.removeItem);

  // Helper function to check if unit is area-based
  const isAreaUnit = (unit: string | undefined) => {
    if (!unit) return false;
    const areaUnits = ['sqft', 'sq.ft', 'sq ft', 'sq.m', 'sqm', 'sq.yard', 'sqyard'];
    return areaUnits.some(au => unit.toLowerCase().includes(au.toLowerCase()));
  };

  const handleDimensionChange = (itemId: string, field: 'length' | 'width', value: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const dimensions = item.dimensions || {};
    const newDimensions = {
      ...dimensions,
      [field]: value === '' ? 0 : parseFloat(value),
    };

    // Auto-calculate quantity if both length and width are present
    const length = newDimensions.length || 0;
    const width = newDimensions.width || 0;
    const calculatedQuantity = length * width;

    updateItem(itemId, {
      dimensions: newDimensions,
      quantity: calculatedQuantity > 0 ? calculatedQuantity : item.quantity,
    });
  };

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    const categoryName = item.product?.category?.name || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  const showLineDiscount = discountMode === 'LINE_ITEM' || discountMode === 'BOTH';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-sm">
            2
          </span>
          Quotation Items
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No items added yet. Select products from the catalog to add them to the quote.
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([categoryName, categoryItems]) => {
              const categorySubtotal = categoryItems.reduce(
                (sum, item) =>
                  sum +
                  calculateLineTotal(
                    item.quantity,
                    item.rate,
                    showLineDiscount ? item.discount : 0
                  ),
                0
              );

              return (
              <div key={categoryName}>
                {/* Category Header */}
                <div className="bg-blue-50 px-4 py-3 rounded-t-md border border-b-0 border-blue-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-blue-900 text-lg">{categoryName}</h3>
                  </div>
                </div>

                {/* Items */}
                {categoryItems.map((item, index) => {
                  const lineTotal = calculateLineTotal(
                    item.quantity,
                    item.rate,
                    showLineDiscount ? item.discount : 0
                  );
                  const isLastItem = index === categoryItems.length - 1;

                  return (
                    <div
                      key={item.id}
                      className="border border-t-0 border-blue-200 p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        {item.product?.imageUrl ? (
                          <div className="w-16 h-16 rounded bg-gray-200 flex-shrink-0">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded bg-gray-200 flex-shrink-0" />
                        )}

                        {/* Details */}
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {item.product?.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                {item.product?.category?.name || 'Uncategorized'}
                              </span>
                              <p className="text-sm text-gray-500">
                                {item.product?.unit || 'pcs'}
                              </p>
                            </div>
                            {item.dimensions && Object.keys(item.dimensions).length > 0 && (
                              <div className="mt-2 text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded inline-block">
                                {item.dimensions.length && item.dimensions.width ? (
                                  <>📐 L: {item.dimensions.length} ft × W: {item.dimensions.width} ft = {(item.dimensions.length * item.dimensions.width).toFixed(2)} sq.ft</>
                                ) : (
                                  <>Dimensions: {Object.entries(item.dimensions)
                                    .map(([key, value]) => `${key}: ${value}`)
                                    .join(', ')}</>
                                )}
                              </div>
                            )}
                          </div>

                          {/* All Input Fields in Single Grid */}
                          <div className="grid grid-cols-12 gap-2 items-end">
                            {/* Description Field */}
                            <div className="col-span-2">
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Description
                              </label>
                              <Input
                                type="text"
                                value={item.description || ''}
                                onChange={(e) =>
                                  updateItem(item.id, { description: e.target.value })
                                }
                                placeholder="Add description..."
                                className="text-sm h-9"
                              />
                            </div>

                            {/* Conditional Fields for Area Units */}
                            {isAreaUnit(item.product?.unit) ? (
                              <>
                                {/* Length Field */}
                                <div className="col-span-1">
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    L (ft)
                                  </label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.dimensions?.length || ''}
                                    onChange={(e) =>
                                      handleDimensionChange(item.id, 'length', e.target.value)
                                    }
                                    placeholder="0"
                                    className="text-sm h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    data-testid="item-length-input"
                                  />
                                </div>

                                {/* Width Field */}
                                <div className="col-span-1">
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    W (ft)
                                  </label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.dimensions?.width || ''}
                                    onChange={(e) =>
                                      handleDimensionChange(item.id, 'width', e.target.value)
                                    }
                                    placeholder="0"
                                    className="text-sm h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    data-testid="item-width-input"
                                  />
                                </div>

                                {/* Quantity Field (Auto-calculated) */}
                                <div className="col-span-2">
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Quantity
                                  </label>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={item.quantity || ''}
                                    className="text-sm h-9 bg-gray-50"
                                    readOnly
                                    title="Auto-calculated from Length × Width"
                                    data-testid="item-quantity-input"
                                  />
                                </div>
                              </>
                            ) : (
                              /* Quantity Field (Manual Entry) - Takes space of L, W, and Qty */
                              <div className="col-span-4">
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Quantity
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={item.quantity || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateItem(item.id, {
                                      quantity: value === '' ? 0 : parseFloat(value),
                                    });
                                  }}
                                  className="text-sm h-9"
                                  data-testid="item-quantity-input"
                                />
                              </div>
                            )}

                            {/* Rate Field */}
                            <div className="col-span-3">
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Rate (₹)
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate || ''}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  updateItem(item.id, {
                                    rate: value === '' ? 0 : parseFloat(value),
                                  });
                                }}
                                className="text-sm h-9 font-medium"
                                data-testid="item-rate-input"
                              />
                            </div>

                            {/* Discount Field (Conditional) */}
                            {showLineDiscount ? (
                              <div className="col-span-1">
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Disc (%)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={item.discount || ''}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    updateItem(item.id, {
                                      discount: value === '' ? 0 : parseFloat(value),
                                    });
                                  }}
                                  className="text-sm h-9"
                                  data-testid="item-discount-input"
                                />
                              </div>
                            ) : null}

                            {/* Line Total Field */}
                            <div className={showLineDiscount ? "col-span-2" : "col-span-3"}>
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Line Total (₹)
                              </label>
                              <div className="h-9 flex items-center px-3 bg-gray-50 rounded-md border border-gray-200 text-sm font-semibold">
                                {formatCurrency(lineTotal, '')}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          data-testid="remove-item-button"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Category Footer with Subtotal */}
                <div className="bg-gray-50 px-4 py-3 rounded-b-md border-x border-b border-blue-200">
                  <div className="flex justify-end">
                    <div className="text-sm font-semibold text-gray-700">
                      Category Subtotal: <span className="text-blue-700 text-base ml-2">{formatCurrency(categorySubtotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



