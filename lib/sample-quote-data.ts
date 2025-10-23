/**
 * Sample Quote Data Generator
 * Generates realistic sample quote data for PDF template previews
 */

import {
  QuoteWithDetails,
  QuoteItemWithProduct,
  PolicyClause,
  Client,
  Category,
  Product,
  DiscountMode,
  QuoteStatus,
  PolicyType,
} from './types';

/**
 * Generate a realistic sample quote with complete details
 * Used for PDF template previews
 */
export function generateSampleQuote(): QuoteWithDetails {
  const sampleClient = generateSampleClient();
  const sampleItems = generateSampleItems();
  const samplePolicies = generateSamplePolicies();

  // Calculate totals
  const subtotal = sampleItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const overallDiscount = 5; // 5% overall discount
  const discountAmount = (subtotal * overallDiscount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxRate = 10; // 10% tax
  const tax = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + tax;

  return {
    id: 'sample-quote-001',
    title: 'Sample Quotation - Office Renovation',
    quoteNumber: 'QT-2024-001',
    clientId: sampleClient.id,
    client: sampleClient,
    templateId: null,
    discountMode: 'BOTH' as DiscountMode,
    overallDiscount,
    taxRate,
    subtotal,
    discount: discountAmount,
    tax,
    grandTotal,
    status: 'DRAFT' as QuoteStatus,
    version: 1,
    isApproved: false,
    items: sampleItems,
    policies: samplePolicies,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a sample client
 */
function generateSampleClient(): Client {
  return {
    id: 'sample-client-001',
    name: 'Acme Corporation',
    email: 'contact@acmecorp.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Street, Suite 100\nNew York, NY 10001',
    source: 'REFERRAL',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Generate sample quote items with products
 */
function generateSampleItems(): QuoteItemWithProduct[] {
  const categories = generateSampleCategories();
  const products = generateSampleProducts(categories);

  return [
    {
      id: 'item-001',
      quoteId: 'sample-quote-001',
      productId: products[0].id,
      description: 'Premium ergonomic office chairs with lumbar support',
      quantity: 15,
      rate: 350,
      discount: 10, // 10% line item discount
      lineTotal: 15 * 350 * 0.9, // Apply 10% discount
      order: 0,
      dimensions: null,
      product: {
        ...products[0],
        category: categories[0],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-002',
      quoteId: 'sample-quote-001',
      productId: products[1].id,
      description: 'Height-adjustable standing desks with electric motor',
      quantity: 10,
      rate: 800,
      discount: 5,
      lineTotal: 10 * 800 * 0.95,
      order: 1,
      dimensions: null,
      product: {
        ...products[1],
        category: categories[0],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-003',
      quoteId: 'sample-quote-001',
      productId: products[2].id,
      description: '27-inch 4K monitors with adjustable stand',
      quantity: 20,
      rate: 450,
      discount: 0,
      lineTotal: 20 * 450,
      order: 2,
      dimensions: null,
      product: {
        ...products[2],
        category: categories[1],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-004',
      quoteId: 'sample-quote-001',
      productId: products[3].id,
      description: 'Wireless mechanical keyboards with RGB lighting',
      quantity: 20,
      rate: 120,
      discount: 0,
      lineTotal: 20 * 120,
      order: 3,
      dimensions: null,
      product: {
        ...products[3],
        category: categories[1],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-005',
      quoteId: 'sample-quote-001',
      productId: products[4].id,
      description: 'Ergonomic wireless mice with precision tracking',
      quantity: 20,
      rate: 45,
      discount: 0,
      lineTotal: 20 * 45,
      order: 4,
      dimensions: null,
      product: {
        ...products[4],
        category: categories[1],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-006',
      quoteId: 'sample-quote-001',
      productId: products[5].id,
      description: 'LED desk lamps with adjustable color temperature',
      quantity: 15,
      rate: 65,
      discount: 0,
      lineTotal: 15 * 65,
      order: 5,
      dimensions: null,
      product: {
        ...products[5],
        category: categories[2],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-007',
      quoteId: 'sample-quote-001',
      productId: products[6].id,
      description: 'Cable management solutions and under-desk trays',
      quantity: 25,
      rate: 35,
      discount: 0,
      lineTotal: 25 * 35,
      order: 6,
      dimensions: null,
      product: {
        ...products[6],
        category: categories[2],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'item-008',
      quoteId: 'sample-quote-001',
      productId: products[7].id,
      description: 'Professional installation and setup service',
      quantity: 1,
      rate: 1500,
      discount: 0,
      lineTotal: 1500,
      order: 7,
      dimensions: null,
      product: {
        ...products[7],
        category: categories[3],
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Generate sample categories
 */
function generateSampleCategories(): Category[] {
  return [
    {
      id: 'cat-001',
      name: 'Office Furniture',
      description: 'Desks, chairs, and office furniture items',
      imageUrl: null,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat-002',
      name: 'Electronics',
      description: 'Computers, monitors, and electronic devices',
      imageUrl: null,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat-003',
      name: 'Office Accessories',
      description: 'Lighting, cable management, and accessories',
      imageUrl: null,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'cat-004',
      name: 'Services',
      description: 'Installation, setup, and professional services',
      imageUrl: null,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Generate sample products
 */
function generateSampleProducts(categories: Category[]): Product[] {
  return [
    {
      id: 'prod-001',
      itemCode: 'CHAIR-ERG-001',
      name: 'Ergonomic Office Chair',
      description: 'Premium ergonomic chair with adjustable lumbar support',
      unit: 'piece',
      baseRate: 350,
      imageUrl: null,
      categoryId: categories[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-002',
      itemCode: 'DESK-STAND-001',
      name: 'Standing Desk',
      description: 'Height-adjustable standing desk with electric motor',
      unit: 'piece',
      baseRate: 800,
      imageUrl: null,
      categoryId: categories[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-003',
      itemCode: 'MON-4K-27',
      name: '27" 4K Monitor',
      description: 'Professional 4K monitor with color accuracy',
      unit: 'piece',
      baseRate: 450,
      imageUrl: null,
      categoryId: categories[1].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-004',
      itemCode: 'KEY-MECH-001',
      name: 'Mechanical Keyboard',
      description: 'Wireless mechanical keyboard with RGB lighting',
      unit: 'piece',
      baseRate: 120,
      imageUrl: null,
      categoryId: categories[1].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-005',
      itemCode: 'MOUSE-WIRE-001',
      name: 'Wireless Mouse',
      description: 'Ergonomic wireless mouse with precision tracking',
      unit: 'piece',
      baseRate: 45,
      imageUrl: null,
      categoryId: categories[1].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-006',
      itemCode: 'LAMP-LED-001',
      name: 'LED Desk Lamp',
      description: 'Adjustable LED lamp with color temperature control',
      unit: 'piece',
      baseRate: 65,
      imageUrl: null,
      categoryId: categories[2].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-007',
      itemCode: 'CABLE-MAN-001',
      name: 'Cable Management Kit',
      description: 'Complete cable management solution',
      unit: 'set',
      baseRate: 35,
      imageUrl: null,
      categoryId: categories[2].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'prod-008',
      itemCode: 'SERV-INST-001',
      name: 'Installation Service',
      description: 'Professional installation and setup',
      unit: 'service',
      baseRate: 1500,
      imageUrl: null,
      categoryId: categories[3].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}

/**
 * Generate sample policy clauses
 */
function generateSamplePolicies(): PolicyClause[] {
  return [
    {
      id: 'policy-001',
      quoteId: 'sample-quote-001',
      type: 'WARRANTY' as PolicyType,
      title: 'Warranty Policy',
      description:
        'All furniture items come with a 5-year manufacturer warranty. Electronics are covered by a 2-year warranty. We provide free replacement for any defective items within the warranty period.',
      isActive: true,
      order: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'policy-002',
      quoteId: 'sample-quote-001',
      type: 'PAYMENT' as PolicyType,
      title: 'Payment Terms',
      description:
        'Payment terms: 50% deposit required upon order confirmation, remaining 50% due upon delivery. We accept bank transfers, checks, and major credit cards. Net 30 payment terms available for established accounts.',
      isActive: true,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'policy-003',
      quoteId: 'sample-quote-001',
      type: 'RETURNS' as PolicyType,
      title: 'Return Policy',
      description:
        'Items can be returned within 30 days of delivery if unused and in original packaging. A 15% restocking fee applies to all returns. Custom or special-order items are non-returnable.',
      isActive: true,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'policy-004',
      quoteId: 'sample-quote-001',
      type: 'CUSTOM' as PolicyType,
      title: 'Delivery Information',
      description:
        'Estimated delivery time: 4-6 weeks from order confirmation. Installation service includes delivery, assembly, and setup of all items. Delivery is free for orders over $10,000 within the metro area.',
      isActive: true,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
}
