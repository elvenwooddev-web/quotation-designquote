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
      [field]: parseFloat(value) || 0,
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
            {Object.entries(groupedItems).map(([categoryName, categoryItems]) => (
              <div key={categoryName}>
                {/* Category Header */}
                <div className="bg-blue-50 px-4 py-2 rounded-t-md border border-b-0">
                  <h3 className="font-semibold text-blue-900">{categoryName}</h3>
                  <div className="flex justify-end mt-2">
                    <div className="text-sm font-semibold text-blue-900">
                      {formatCurrency(
                        categoryItems.reduce(
                          (sum, item) =>
                            sum +
                            calculateLineTotal(
                              item.quantity,
                              item.rate,
                              showLineDiscount ? item.discount : 0
                            ),
                          0
                        )
                      )}
                    </div>
                  </div>
                </div>

                {/* Items */}
                {categoryItems.map((item) => {
                  const lineTotal = calculateLineTotal(
                    item.quantity,
                    item.rate,
                    showLineDiscount ? item.discount : 0
                  );

                  return (
                    <div
                      key={item.id}
                      className="border border-t-0 p-4 hover:bg-gray-50"
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
                            <p className="text-sm text-gray-500">
                              {item.product?.unit || 'pcs'}
                            </p>
                          </div>

                          <div>
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
                              className="text-sm"
                            />
                          </div>

                          {/* Input Fields */}
                          <div className="grid grid-cols-6 gap-3">
                            {isAreaUnit(item.product?.unit) && (
                              <>
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Length (ft)
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
                                    className="text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium text-gray-600 block mb-1">
                                    Width (ft)
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
                                    className="text-sm"
                                  />
                                </div>
                              </>
                            )}
                            <div>
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Quantity
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItem(item.id, {
                                    quantity: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="text-sm"
                                readOnly={isAreaUnit(item.product?.unit)}
                                title={isAreaUnit(item.product?.unit) ? 'Auto-calculated from Length × Width' : ''}
                              />
                            </div>

                            <div>
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Rate (₹)
                              </label>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.rate}
                                onChange={(e) =>
                                  updateItem(item.id, {
                                    rate: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="text-sm"
                              />
                            </div>

                            {showLineDiscount && (
                              <div>
                                <label className="text-xs font-medium text-gray-600 block mb-1">
                                  Discount (%)
                                </label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={item.discount}
                                  onChange={(e) =>
                                    updateItem(item.id, {
                                      discount: parseFloat(e.target.value) || 0,
                                    })
                                  }
                                  className="text-sm"
                                />
                              </div>
                            )}

                            <div>
                              <label className="text-xs font-medium text-gray-600 block mb-1">
                                Line Total (₹)
                              </label>
                              <div className="h-9 flex items-center px-3 bg-gray-50 rounded-md border border-input text-sm font-semibold">
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
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}



