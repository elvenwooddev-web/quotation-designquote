// Database Types
export interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  itemCount?: number;
}

export interface Product {
  id: string;
  itemCode?: string | null;
  name: string;
  description: string | null;
  unit: string;
  baseRate: number;
  imageUrl: string | null;
  categoryId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Client {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  source: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  quoteCount?: number;
}

export type DiscountMode = 'LINE_ITEM' | 'OVERALL' | 'BOTH';
export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
export type PolicyType = 'WARRANTY' | 'RETURNS' | 'PAYMENT' | 'CUSTOM';

export interface Quote {
  id: string;
  title: string;
  quoteNumber: string;
  clientId: string | null;
  templateId: string | null;
  discountMode: DiscountMode;
  overallDiscount: number;
  taxRate: number;
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  status: QuoteStatus;
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
export type UserRole = 'Admin' | 'Designer' | 'Client';
export type PermissionResource = 'categories' | 'products' | 'clients' | 'quotes';

export interface User {
  id: string;
  authuserid: string | null;
  name: string;
  email: string;
  role: UserRole;
  isactive: boolean;
  createdat: Date | string;
  updatedat: Date | string;
}

export interface RolePermission {
  id: string;
  role: UserRole;
  resource: PermissionResource;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export interface QuoteItemWithProduct extends QuoteItem {
  product: Product & { category: Category };
}

export interface QuoteWithDetails extends Quote {
  client: Client | null;
  template?: PDFTemplate | null;
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

// ==========================================
// PDF Template Editor Types (Phase 1B)
// ==========================================

/**
 * Standard page sizes for PDF documents
 */
export type PageSize = 'A4' | 'Letter' | 'Legal';

/**
 * Page orientation options
 */
export type Orientation = 'portrait' | 'landscape';

/**
 * Template category for organizing and filtering templates
 */
export type TemplateCategory =
  | 'business'
  | 'modern'
  | 'creative'
  | 'elegant'
  | 'bold'
  | 'minimalist'
  | 'custom';

/**
 * Template metadata containing document configuration
 */
export interface TemplateMetadata {
  /** Template version for tracking changes */
  version: string;
  /** Page size configuration */
  pageSize: PageSize;
  /** Page orientation */
  orientation: Orientation;
  /** Page margins in points (1/72 inch) */
  margins: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

/**
 * Font configuration for template text elements
 */
export interface FontConfig {
  /** Font family name (e.g., 'Inter', 'Roboto') */
  family: string;
  /** Font size in points */
  size: number;
  /** Font weight (e.g., 400, 500, 600, 700) */
  weight: number;
}

/**
 * Theme configuration for template styling
 */
export interface TemplateTheme {
  /** Color palette for the template */
  colors: {
    /** Primary brand color */
    primary: string;
    /** Secondary accent color */
    secondary: string;
    /** Primary text color */
    textPrimary: string;
    /** Secondary/muted text color */
    textSecondary: string;
    /** Background color */
    background: string;
  };
  /** Font configurations for different text types */
  fonts: {
    /** Heading font configuration */
    heading: FontConfig;
    /** Body text font configuration */
    body: FontConfig;
    /** Small text font configuration */
    small: FontConfig;
  };
}

/**
 * Conditional rendering rule for template elements
 */
export interface ElementCondition {
  /** Field name to evaluate (e.g., 'status', 'total') */
  field: string;
  /** Comparison operator (e.g., '==', '!=', '>', '<', 'contains') */
  operator: string;
  /** Value to compare against */
  value: any;
}

/**
 * Template element representing a component in the PDF
 */
export interface TemplateElement {
  /** Unique identifier for the element */
  id: string;
  /** Element type (e.g., 'header', 'table', 'signature', 'textBlock', 'divider', 'spacer', 'qrCode', 'chart') */
  type: string;
  /** Order of element in the document (determines rendering sequence) */
  order: number;
  /** Position on the page - 'auto' for flow layout, coordinates for absolute positioning */
  position: { x: number; y: number } | 'auto';
  /** Size configuration - supports 'auto' for dynamic sizing */
  size: {
    width: number | 'auto';
    height: number | 'auto';
  };
  /** Element-specific properties (varies by element type) */
  properties: Record<string, any>;
  /** Optional conditional rendering rules */
  conditions?: ElementCondition[];
  /** Page break behavior for this element */
  pageBreak?: 'before' | 'after' | 'avoid' | 'auto';
}

/**
 * QR Code element properties
 */
export interface QRCodeProperties {
  /** Data to encode (URL, text, or variable like {{quoteNumber}}) */
  data: string;
  /** QR code size in pixels (default 100) */
  size: number;
  /** Error correction level */
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  /** Background color (default white) */
  backgroundColor: string;
  /** QR code foreground color (default black) */
  foregroundColor: string;
  /** Margin around QR code (default 4) */
  margin: number;
  /** Optional label below QR code */
  label?: string;
  /** Label font size */
  labelFontSize?: number;
  /** Label color */
  labelColor?: string;
  /** Alignment */
  alignment?: 'left' | 'center' | 'right';
  /** Top margin */
  marginTop?: number;
  /** Bottom margin */
  marginBottom?: number;
}

/**
 * Chart element properties
 */
export interface ChartProperties {
  /** Chart type */
  chartType: 'pie' | 'bar' | 'donut';
  /** Data source */
  dataSource: 'categories' | 'custom';
  /** Chart title */
  title?: string;
  /** Title font size */
  titleFontSize?: number;
  /** Title color */
  titleColor?: string;
  /** Show legend */
  showLegend: boolean;
  /** Show values */
  showValues: boolean;
  /** Show percentages */
  showPercentages: boolean;
  /** Custom color palette */
  colors?: string[];
  /** Chart width */
  width: number;
  /** Chart height */
  height: number;
  /** Alignment */
  alignment?: 'left' | 'center' | 'right';
  /** Top margin */
  marginTop?: number;
  /** Bottom margin */
  marginBottom?: number;
}

/**
 * Complete template JSON configuration
 * This is the serialized template structure stored in the database
 */
export interface TemplateJSON {
  /** Document and page configuration */
  metadata: TemplateMetadata;
  /** Visual styling and theme */
  theme: TemplateTheme;
  /** Array of template elements in rendering order */
  elements: TemplateElement[];
}

/**
 * PDF Template database model
 * Represents a saved template with metadata and configuration
 */
export interface PDFTemplate {
  /** Unique template identifier */
  id: string;
  /** Template display name */
  name: string;
  /** Optional template description */
  description: string | null;
  /** Template category for organization */
  category: TemplateCategory;
  /** Whether this is the default template for new quotes */
  isDefault: boolean;
  /** Whether this template is visible to all users */
  isPublic: boolean;
  /** Complete template configuration as JSON */
  templateJson: TemplateJSON;
  /** Optional thumbnail URL for template preview */
  thumbnail: string | null;
  /** User ID of template creator */
  createdBy: string | null;
  /** Creation timestamp */
  createdAt: Date | string;
  /** Last update timestamp */
  updatedAt: Date | string;
  /** Version number for optimistic locking */
  version: number;
}



