import { Category, Product, Client, Quote, QuoteItem, PolicyClause, DiscountMode, QuoteStatus, PolicyType } from '@prisma/client';

export type {
  Category,
  Product,
  Client,
  Quote,
  QuoteItem,
  PolicyClause,
  DiscountMode,
  QuoteStatus,
  PolicyType,
};

export interface QuoteItemWithProduct extends QuoteItem {
  product: Product & { category: Category };
}

export interface QuoteWithDetails extends Quote {
  client: Client | null;
  items: QuoteItemWithProduct[];
  policies: PolicyClause[];
}

export interface CategoryContribution {
  categoryName: string;
  total: number;
}

export interface QuoteCalculations {
  subtotal: number;
  discount: number;
  taxableAmount: number;
  tax: number;
  grandTotal: number;
  categoryContributions: CategoryContribution[];
}

export interface QuoteItemInput {
  productId: string;
  quantity: number;
  rate: number;
  discount: number;
  description?: string;
  dimensions?: Record<string, any>;
}

export interface PolicyInput {
  type: PolicyType;
  title: string;
  description: string;
  isActive: boolean;
}



