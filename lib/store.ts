import { create } from 'zustand';
import { DiscountMode, Product, Client, PolicyType, Category } from './types';

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
  setDiscountMode: (mode: DiscountMode) => void;
  setOverallDiscount: (discount: number) => void;
  setTaxRate: (rate: number) => void;

  addItem: (product: ProductWithCategory) => void;
  updateItem: (id: string, updates: Partial<QuoteItemStore>) => void;
  removeItem: (id: string) => void;

  setPolicy: (type: PolicyType, policy: Partial<PolicyStore>) => void;
  togglePolicy: (type: PolicyType) => void;
  updatePolicyOrder: (type: PolicyType, direction: 'up' | 'down') => void;

  // Computed values
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getTaxAmount: () => number;
  getGrandTotal: () => number;

  // Reset
  reset: () => void;

  // Load existing quote
  loadQuote: (quote: any) => void;
}

const defaultPolicies: PolicyStore[] = [
  {
    type: 'WARRANTY',
    title: 'Warranty',
    description: 'Standard 1-year warranty on all products',
    isActive: true,
    order: 1,
  },
  {
    type: 'RETURNS',
    title: 'Returns & Exchanges',
    description: '30-day return policy for unused items',
    isActive: true,
    order: 2,
  },
  {
    type: 'PAYMENT',
    title: 'Payment Terms',
    description: '50% advance, 50% on completion',
    isActive: true,
    order: 3,
  },
];

export const useQuoteStore = create<QuoteStore>((set, get) => ({
  // Initial state
  title: '',
  clientId: undefined,
  client: undefined,
  discountMode: 'LINE_ITEM',
  overallDiscount: 0,
  taxRate: 18,
  items: [],
  policies: [...defaultPolicies],

  // Actions
  setTitle: (title) => set({ title }),
  setClient: (clientId, client) => set({ clientId, client }),
  setDiscountMode: (mode) => set({ discountMode: mode }),
  setOverallDiscount: (discount) => set({ overallDiscount: discount }),
  setTaxRate: (rate) => set({ taxRate: rate }),

  addItem: (product) => {
    const newItem: QuoteItemStore = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      product: product,
      quantity: 1,
      rate: product.baseRate,
      discount: 0,
      description: product.description || '',
      dimensions: {},
    };
    set((state) => ({ items: [...state.items, newItem] }));
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) => {
        if (item.id === id) {
          // If dimensions are updated and contain length and width, calculate quantity
          if (updates.dimensions) {
            const { length, width } = updates.dimensions;
            if (length && width) {
              const calculatedQty = parseFloat(length) * parseFloat(width);
              if (!isNaN(calculatedQty)) {
                updates.quantity = calculatedQty;
              }
            }
          }
          return { ...item, ...updates };
        }
        return item;
      }),
    }));
  },

  removeItem: (id) => {
    set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
  },

  setPolicy: (type, policy) => {
    set((state) => ({
      policies: state.policies.map((p) =>
        p.type === type ? { ...p, ...policy } : p
      ),
    }));
  },

  togglePolicy: (type) => {
    set((state) => ({
      policies: state.policies.map((p) =>
        p.type === type ? { ...p, isActive: !p.isActive } : p
      ),
    }));
  },

  updatePolicyOrder: (type, direction) => {
    set((state) => {
      const policies = [...state.policies];
      const index = policies.findIndex((p) => p.type === type);

      if (index === -1) return state;

      const newIndex = direction === 'up'
        ? Math.max(0, index - 1)
        : Math.min(policies.length - 1, index + 1);

      if (index === newIndex) return state;

      const [policy] = policies.splice(index, 1);
      policies.splice(newIndex, 0, policy);

      // Update order values
      return {
        policies: policies.map((p, i) => ({ ...p, order: i + 1 })),
      };
    });
  },

  // Computed values
  getSubtotal: () => {
    const state = get();
    return state.items.reduce((sum, item) => {
      const lineTotal = item.quantity * item.rate * (1 - item.discount / 100);
      return sum + lineTotal;
    }, 0);
  },

  getDiscountAmount: () => {
    const state = get();
    const subtotal = get().getSubtotal();

    if (state.discountMode === 'OVERALL' || state.discountMode === 'BOTH') {
      return subtotal * (state.overallDiscount / 100);
    }
    return 0;
  },

  getTaxAmount: () => {
    const state = get();
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const taxableAmount = subtotal - discount;
    return taxableAmount * (state.taxRate / 100);
  },

  getGrandTotal: () => {
    const subtotal = get().getSubtotal();
    const discount = get().getDiscountAmount();
    const tax = get().getTaxAmount();
    return subtotal - discount + tax;
  },

  // Reset store
  reset: () => {
    set({
      quoteId: undefined,
      title: '',
      clientId: undefined,
      client: undefined,
      discountMode: 'LINE_ITEM',
      overallDiscount: 0,
      taxRate: 18,
      items: [],
      policies: [...defaultPolicies],
    });
  },

  // Load existing quote
  loadQuote: (quote) => {
    set({
      quoteId: quote.id,
      title: quote.title || '',
      clientId: quote.clientId,
      client: quote.client,
      discountMode: quote.discountMode || 'LINE_ITEM',
      overallDiscount: quote.overallDiscount || 0,
      taxRate: quote.taxRate || 18,
      items: quote.items.map((item: any) => ({
        id: item.id,
        productId: item.productId || item.product?.id,
        product: item.product,
        quantity: item.quantity || 1,
        rate: item.rate || item.product?.baseRate || 0,
        discount: item.discount || 0,
        description: item.description || '',
        dimensions: item.dimensions || {},
      })),
      policies: quote.policies?.length ? quote.policies : [...defaultPolicies],
    });
  },
}));