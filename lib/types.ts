// Core Business Types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  parentId: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Product {
  id: string;
  itemCode: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  baseRate: number;
  imageUrl: string | null;
  isActive: boolean;
  category?: Category;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Quote and Policy Types
export type DiscountMode = 'LINE_ITEM' | 'OVERALL' | 'BOTH';
export type QuoteStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'SENT' | 'ACCEPTED' | 'REJECTED';
export type PolicyType = 'WARRANTY' | 'RETURNS' | 'PAYMENT' | 'CUSTOM';

export interface Quote {
  id: string;
  title: string;
  quoteNumber: string;
  clientId: string | null;
  discountMode: DiscountMode;
  overallDiscount: number;
  taxRate: number;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  status: QuoteStatus;
  version: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface QuoteItem {
  id: string;
  quoteId: string;
  productId: string;
  description: string | null;
  quantity: number;
  rate: number;
  discount: number;
  lineTotal: number;
  order: number;
  dimensions: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PolicyClause {
  id: string;
  quoteId: string | null;
  type: PolicyType;
  title: string;
  description: string;
  isActive: boolean;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// User Management Types
export type PermissionResource = 'categories' | 'products' | 'clients' | 'quotes';
export type UserRole = string; // Dynamic roles - can be any string (Admin, Designer, Client, Sales Head, etc.)

export interface Role {
  id: string;
  name: string;
  description: string | null;
  isProtected: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RolePermission {
  id: string;
  roleId: string;
  resource: PermissionResource;
  canCreate: boolean;
  canRead: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export interface User {
  id: string;
  authUserId?: string | null;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserPermissions {
  id: string;
  roleId: string;
  resource: PermissionResource;
  cancreate: boolean;
  canread: boolean;
  canedit: boolean;
  candelete: boolean;
  canapprove: boolean;
  canexport: boolean;
}

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

// Settings Types
export interface Setting {
  key: string;
  value: any;
  category: string;
  description?: string;
}

// Revision Types
export interface ClientRevision {
  id: string;
  clientId: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  changedBy: string | null;
  changeDate: Date | string;
}

export interface PolicyInput {
  type: PolicyType;
  title: string;
  description: string;
  isActive: boolean;
}