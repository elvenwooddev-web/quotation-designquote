'use client';

import React, { useState, useEffect } from 'react';
import { useQuoteStore } from '@/lib/store';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export function QuotePreview() {
  // Get all data from the store
  const title = useQuoteStore((state) => state.title);
  const client = useQuoteStore((state) => state.client);
  const items = useQuoteStore((state) => state.items);
  const discountMode = useQuoteStore((state) => state.discountMode);
  const overallDiscount = useQuoteStore((state) => state.overallDiscount);
  const taxRate = useQuoteStore((state) => state.taxRate);
  const getSubtotal = useQuoteStore((state) => state.getSubtotal);
  const getDiscountAmount = useQuoteStore((state) => state.getDiscountAmount);
  const getTaxAmount = useQuoteStore((state) => state.getTaxAmount);
  const getGrandTotal = useQuoteStore((state) => state.getGrandTotal);

  // Fetch terms and conditions from settings
  const [terms, setTerms] = useState<string>('');

  // Fetch company info and logo from settings
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'Your Company Name',
    email: 'info@company.com',
    phone: '(555) 123-4567',
    address: '123 Business Street, City, State 12345',
    website: '',
  });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch terms
        const termsResponse = await fetch('/api/settings/terms');
        if (termsResponse.ok) {
          const termsData = await termsResponse.json();
          // Strip HTML tags and convert to plain text
          const plainText = (termsData.content || '')
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .trim();
          setTerms(plainText);
        }

        // Fetch company info
        const companyResponse = await fetch('/api/settings/company');
        if (companyResponse.ok) {
          const companyData = await companyResponse.json();
          setCompanyInfo({
            companyName: companyData.companyName || 'Your Company Name',
            email: companyData.email || 'info@company.com',
            phone: companyData.phone || '(555) 123-4567',
            address: companyData.address || '123 Business Street, City, State 12345',
            website: companyData.website || '',
          });
          setLogoUrl(companyData.logoUrl || null);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const tax = getTaxAmount();
  const grandTotal = getGrandTotal();

  return (
    <Card className="h-full bg-white shadow-lg">
      <ScrollArea className="h-full">
        <div className="p-8 space-y-6" style={{ minHeight: '297mm', maxWidth: '210mm', margin: '0 auto' }}>
          {/* Header */}
          <div className="border-b-2 border-blue-600 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-blue-600">QUOTATION</h1>
                <p className="text-sm text-gray-500 mt-1">Quote Date: {formatDate(new Date())}</p>
              </div>
              <div className="text-right">
                <Badge variant="outline" className="text-lg px-3 py-1">
                  DRAFT
                </Badge>
              </div>
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-gray-50 p-4 rounded-lg relative">
            <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase">FROM</h2>
            {/* Company Logo - Positioned absolutely in top-right */}
            <div className="absolute top-4 right-4">
              {logoUrl ? (
                <img src={logoUrl} alt={companyInfo.companyName} className="max-w-40 max-h-40 object-contain" />
              ) : (
                <div className="w-40 h-40 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-4xl">
                    {companyInfo.companyName.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            {/* Company Details */}
            <div className="text-sm pr-44">
              <p className="font-semibold">{companyInfo.companyName}</p>
              {companyInfo.address && <p className="text-gray-600">{companyInfo.address}</p>}
              {companyInfo.email && <p className="text-gray-600">Email: {companyInfo.email}</p>}
              {companyInfo.phone && <p className="text-gray-600">Phone: {companyInfo.phone}</p>}
              {companyInfo.website && <p className="text-gray-600">Web: {companyInfo.website}</p>}
            </div>
          </div>

          {/* Quote Details & Client Info */}
          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Quote Details */}
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase">QUOTE DETAILS</h2>
              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="text-gray-500 w-32">Quote Title:</span>
                  <span className="font-medium flex-1">{title || 'Untitled Quote'}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Quote Number:</span>
                  <span className="font-medium flex-1">QT-{new Date().getFullYear()}-DRAFT</span>
                </div>
                <div className="flex">
                  <span className="text-gray-500 w-32">Valid Until:</span>
                  <span className="font-medium flex-1">
                    {formatDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))}
                  </span>
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase">BILL TO</h2>
              {client ? (
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">{client.name}</p>
                  {client.company && <p className="text-gray-600">{client.company}</p>}
                  <p className="text-gray-600">{client.email}</p>
                  {client.phone && <p className="text-gray-600">{client.phone}</p>}
                  {client.address && <p className="text-gray-600">{client.address}</p>}
                </div>
              ) : (
                <p className="text-sm text-gray-400 italic">No client selected</p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase">QUOTATION ITEMS</h2>
            {items.length > 0 ? (
              (() => {
                // Group items by category
                const groupedItems = items.reduce((acc, item) => {
                  const categoryName = item.product?.category?.name || 'Uncategorized';
                  if (!acc[categoryName]) {
                    acc[categoryName] = [];
                  }
                  acc[categoryName].push(item);
                  return acc;
                }, {} as Record<string, typeof items>);

                let itemNumber = 0;

                return (
                  <div className="space-y-4">
                    {Object.entries(groupedItems).map(([categoryName, categoryItems]) => {
                      const categorySubtotal = categoryItems.reduce((sum, item) => {
                        const lineTotal = item.quantity * item.rate * (1 - item.discount / 100);
                        return sum + lineTotal;
                      }, 0);

                      return (
                        <div key={categoryName}>
                          {/* Category Header */}
                          <div className="bg-blue-50 px-4 py-2 rounded-t-lg border border-blue-200">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold text-blue-900">{categoryName}</h3>
                            </div>
                          </div>

                          {/* Category Items Table */}
                          <div className="border border-t-0 border-blue-200 overflow-hidden">
                            <table className="w-full table-fixed">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="text-left text-xs font-semibold text-gray-600 p-3 w-12">#</th>
                                  <th className="text-left text-xs font-semibold text-gray-600 p-3">Item</th>
                                  <th className="text-right text-xs font-semibold text-gray-600 p-3 w-16">Qty</th>
                                  <th className="text-right text-xs font-semibold text-gray-600 p-3 w-28">Rate</th>
                                  {(discountMode === 'LINE_ITEM' || discountMode === 'BOTH') && (
                                    <th className="text-right text-xs font-semibold text-gray-600 p-3 w-20">Discount</th>
                                  )}
                                  <th className="text-right text-xs font-semibold text-gray-600 p-3 w-28">Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {categoryItems.map((item) => {
                                  itemNumber++;
                                  const lineTotal = item.quantity * item.rate * (1 - item.discount / 100);
                                  return (
                                    <tr key={item.id} className="border-t">
                                      <td className="p-3 text-sm">{itemNumber}</td>
                                      <td className="p-3">
                                        <div className="flex items-start gap-3">
                                          {/* Product Image */}
                                          {item.product?.imageUrl && (
                                            <div className="flex-shrink-0">
                                              <img
                                                src={item.product.imageUrl}
                                                alt={item.product.name}
                                                className="w-16 h-16 object-cover rounded-md border border-gray-200"
                                              />
                                            </div>
                                          )}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium break-words">{item.product?.name || 'Unknown Item'}</p>
                                            {item.description && (
                                              <p className="text-xs text-gray-500 mt-1 break-words">{item.description}</p>
                                            )}
                                            {item.dimensions && Object.keys(item.dimensions).length > 0 && (
                                              <p className="text-xs text-gray-500 mt-1">
                                                {item.dimensions.length && item.dimensions.width ? (
                                                  <>L: {item.dimensions.length} ft × W: {item.dimensions.width} ft ({(item.dimensions.length * item.dimensions.width).toFixed(2)} sq.ft)</>
                                                ) : (
                                                  <>Dimensions: {Object.entries(item.dimensions)
                                                    .map(([key, value]) => `${key}: ${value}`)
                                                    .join(', ')}</>
                                                )}
                                              </p>
                                            )}
                                          </div>
                                        </div>
                                      </td>
                                      <td className="p-3 text-right text-sm align-top">{item.quantity}</td>
                                      <td className="p-3 text-right text-sm align-top">{formatCurrency(item.rate)}</td>
                                      {(discountMode === 'LINE_ITEM' || discountMode === 'BOTH') && (
                                        <td className="p-3 text-right text-sm align-top">{item.discount}%</td>
                                      )}
                                      <td className="p-3 text-right text-sm font-medium align-top">{formatCurrency(lineTotal)}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Category Footer with Subtotal */}
                          <div className="bg-gray-50 px-4 py-3 rounded-b-lg border-x border-b border-blue-200">
                            <div className="flex justify-end">
                              <span className="text-sm font-semibold text-gray-700">
                                Category Subtotal: <span className="text-blue-700 text-base ml-2">{formatCurrency(categorySubtotal)}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()
            ) : (
              <div className="border rounded-lg p-8 text-center text-gray-400 italic">
                No items added to quote
              </div>
            )}
          </div>

          {/* Totals Section */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>

              {(discountMode === 'OVERALL' || discountMode === 'BOTH') && discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Discount ({overallDiscount}%):</span>
                  <span className="font-medium text-red-600">-{formatCurrency(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax ({taxRate}%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Grand Total:</span>
                <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Terms & Conditions */}
          {terms && (
            <div className="bg-gray-50 p-4 rounded-lg mt-8">
              <h2 className="text-sm font-semibold text-gray-600 mb-2 uppercase">TERMS & CONDITIONS</h2>
              <div className="text-xs text-gray-600 space-y-1">
                {terms.split('\n').filter(line => line.trim()).map((line, index) => (
                  <p key={index}>• {line.trim()}</p>
                ))}
              </div>
            </div>
          )}

          {/* Signature Section */}
          <div className="mt-12 pt-8">
            <h2 className="text-sm font-semibold text-gray-600 mb-6 uppercase">SIGNATURES</h2>
            <div className="grid grid-cols-2 gap-12">
              {/* Company Signature */}
              <div>
                <div className="border-t-2 border-gray-300 pt-2 mb-1">
                  <p className="text-sm font-medium text-gray-700">{companyInfo.companyName}</p>
                  <p className="text-xs text-gray-500">Authorized Signatory</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Date: _________________</p>
              </div>

              {/* Client Signature */}
              <div>
                <div className="border-t-2 border-gray-300 pt-2 mb-1">
                  <p className="text-sm font-medium text-gray-700">{client?.name || 'Client Name'}</p>
                  <p className="text-xs text-gray-500">Client Signature</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">Date: _________________</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-8 border-t mt-8">
            <p className="text-xs text-gray-500">
              Thank you for your business! For any questions, please contact us.
            </p>
          </div>
        </div>
      </ScrollArea>
    </Card>
  );
}