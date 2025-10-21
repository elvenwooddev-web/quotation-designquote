import { create } from 'zustand';
import { DiscountMode, Product, Client, PolicyType, Category, PDFTemplate } from './types';

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface QuoteItemStore {
  id: string;
  productId: string;
  product?: ProductWithCategory;
  quantity: number;
  rate: number;
  discount: number;
  description?: string;
  dimensions?: Record<string, any>;
}

export interface PolicyStore {
  type: PolicyType;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
}

interface QuoteStore {
  // Quote details
  quoteId?: string;
  title: string;
  clientId?: string;
  client?: Client;
  templateId?: string;
  template?: PDFTemplate;
  discountMode: DiscountMode;
  overallDiscount: number;
  taxRate: number;

  // Items
  items: QuoteItemStore[];

  // Policies
  policies: PolicyStore[];

  // Actions
  setTitle: (title: string) => void;
  setClient: (clientId?: string, client?: Client) => void;
  setTemplate: (templateId?: string, template?: PDFTemplate) => void;
  setDiscountMode: (mode: DiscountMode) => void;
  setOverallDiscount: (discount: number) => void;
  setTaxRate: (rate: number) => void;

  // Item actions
  addItem: (product: ProductWithCategory) => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, updates: Partial<QuoteItemStore>) => void;

  // Policy actions
  togglePolicy: (type: PolicyType) => void;
  updatePolicy: (type: PolicyType, updates: Partial<PolicyStore>) => void;
  addCustomPolicy: (policy: PolicyStore) => void;
  removeCustomPolicy: (type: PolicyType) => void;

  // Reset
  reset: () => void;
  loadQuote: (quote: any) => void;
}

const defaultPolicies: PolicyStore[] = [
  {
    type: 'WARRANTY',
    title: 'Standard Warranty (1-year)',
    description: 'All products come with a standard 1-year warranty covering manufacturing defects.',
    isActive: false,
    order: 1,
  },
  {
    type: 'WARRANTY',
    title: 'Extended Warranty (3-year)',
    description: 'Extended warranty available covering all parts and services for 3 years.',
    isActive: false,
    order: 2,
  },
  {
    type: 'RETURNS',
    title: 'No Returns Policy',
    description: 'All sales are final. No returns or exchanges will be accepted after the order has been confirmed.',
    isActive: false,
    order: 3,
  },
  {
    type: 'PAYMENT',
    title: 'Payment Terms: 50% Upfront',
    description: 'Payment terms: Full payment is required upon delivery and satisfactory installation.',
    isActive: false,
    order: 4,
  },
];

const initialTerms: PolicyStore[] = [
  {
    type: 'CUSTOM',
    title: 'All sales are final',
    description: 'All sales are final. No returns or exchanges will be accepted after the order has been confirmed.',
    isActive: true,
    order: 1,
  },
  {
    type: 'CUSTOM',
    title: 'Prices exclusive of GST',
    description: 'All prices are exclusive of GST (Goods and Services Tax) at 18% unless otherwise specified.',
    isActive: true,
    order: 2,
  },
  {
    type: 'CUSTOM',
    title: 'Payment terms',
    description: 'Full payment is required upon delivery and satisfactory installation.',
    isActive: true,
    order: 3,
  },
  {
    type: 'CUSTOM',
    title: 'Quotation validity',
    description: 'The quotation is valid for 30 days from the date of issue.',
    isActive: true,
    order: 4,
  },
  {
    type: 'CUSTOM',
    title: 'Delays in project completion',
    description: 'Any delays in project completion due to unforeseen circumstances or client-side issues will be communicated promptly.',
    isActive: true,
    order: 5,
  },
];

export const useQuoteStore = create<QuoteStore>((set) => ({
  // Initial state
  title: '',
  discountMode: 'LINE_ITEM',
  overallDiscount: 0,
  taxRate: 18,
  items: [],
  policies: initialTerms,

  // Actions
  setTitle: (title) => set({ title }),

  setClient: (clientId, client) => set({ clientId, client }),

  setTemplate: (templateId, template) => set({ templateId, template }),

  setDiscountMode: (mode) => set({ discountMode: mode }),
  
  setOverallDiscount: (discount) => set({ overallDiscount: discount }),
  
  setTaxRate: (rate) => set({ taxRate: rate }),

  // Item actions
  addItem: (product) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id: `temp-${Date.now()}-${Math.random()}`,
          productId: product.id,
          product,
          quantity: 1,
          rate: product.baseRate,
          discount: 0,
        },
      ],
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),

  // Policy actions
  togglePolicy: (type) =>
    set((state) => ({
      policies: state.policies.map((policy) =>
        policy.type === type
          ? { ...policy, isActive: !policy.isActive }
          : policy
      ),
    })),

  updatePolicy: (type, updates) =>
    set((state) => ({
      policies: state.policies.map((policy) =>
        policy.type === type ? { ...policy, ...updates } : policy
      ),
    })),

  addCustomPolicy: (policy) =>
    set((state) => ({
      policies: [...state.policies, policy],
    })),

  removeCustomPolicy: (type) =>
    set((state) => ({
      policies: state.policies.filter((policy) => policy.type !== type),
    })),

  // Reset
  reset: () =>
    set({
      quoteId: undefined,
      title: '',
      clientId: undefined,
      client: undefined,
      templateId: undefined,
      template: undefined,
      discountMode: 'LINE_ITEM',
      overallDiscount: 0,
      taxRate: 18,
      items: [],
      policies: initialTerms,
    }),

  loadQuote: (quote) =>
    set({
      quoteId: quote.id,
      title: quote.title,
      clientId: quote.clientId,
      client: quote.client,
      templateId: quote.templateId,
      template: quote.template,
      discountMode: quote.discountMode,
      overallDiscount: quote.overallDiscount,
      taxRate: quote.taxRate,
      items: quote.items.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        rate: item.rate,
        discount: item.discount,
        description: item.description,
        dimensions: item.dimensions,
      })),
      policies: quote.policies.map((policy: any) => ({
        type: policy.type,
        title: policy.title,
        description: policy.description,
        isActive: policy.isActive,
        order: policy.order,
      })),
    }),
}));

