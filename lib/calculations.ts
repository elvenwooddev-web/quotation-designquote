import { DiscountMode } from '@prisma/client';
import { QuoteItemWithProduct, QuoteCalculations, CategoryContribution } from './types';

export function calculateLineTotal(
  quantity: number,
  rate: number,
  discount: number = 0
): number {
  const subtotal = quantity * rate;
  const discountAmount = (subtotal * discount) / 100;
  return subtotal - discountAmount;
}

export function calculateQuoteTotals(
  items: QuoteItemWithProduct[],
  discountMode: DiscountMode,
  overallDiscount: number = 0,
  taxRate: number = 18
): QuoteCalculations {
  // Calculate subtotal (sum of all line totals before overall discount)
  const subtotal = items.reduce((sum, item) => {
    if (discountMode === 'LINE_ITEM' || discountMode === 'BOTH') {
      return sum + calculateLineTotal(item.quantity, item.rate, item.discount);
    } else {
      return sum + (item.quantity * item.rate);
    }
  }, 0);

  // Calculate discount
  let discount = 0;
  if (discountMode === 'OVERALL' || discountMode === 'BOTH') {
    discount = (subtotal * overallDiscount) / 100;
  }

  // Calculate taxable amount
  const taxableAmount = subtotal - discount;

  // Calculate tax
  const tax = (taxableAmount * taxRate) / 100;

  // Calculate grand total
  const grandTotal = taxableAmount + tax;

  // Calculate category contributions
  const categoryMap = new Map<string, number>();
  
  items.forEach(item => {
    const categoryName = item.product.category.name;
    let itemTotal = 0;
    
    if (discountMode === 'LINE_ITEM' || discountMode === 'BOTH') {
      itemTotal = calculateLineTotal(item.quantity, item.rate, item.discount);
    } else {
      itemTotal = item.quantity * item.rate;
    }
    
    // Apply proportional overall discount if applicable
    if (discountMode === 'OVERALL' || discountMode === 'BOTH') {
      const proportion = itemTotal / subtotal;
      itemTotal -= discount * proportion;
    }
    
    const current = categoryMap.get(categoryName) || 0;
    categoryMap.set(categoryName, current + itemTotal);
  });

  const categoryContributions: CategoryContribution[] = Array.from(categoryMap.entries())
    .map(([categoryName, total]) => ({ categoryName, total }))
    .sort((a, b) => b.total - a.total);

  return {
    subtotal,
    discount,
    taxableAmount,
    tax,
    grandTotal,
    categoryContributions,
  };
}

export function formatCurrency(amount: number, currency: string = '₹'): string {
  return `${currency} ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function generateQuoteNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `QT-${year}${month}-${random}`;
}



