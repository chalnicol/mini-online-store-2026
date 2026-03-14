import { AddressDetailsType } from '@/data';

export interface User {
  id: number;
  fname: string;
  lname: string;
  email: string;
  // role: RoleType;
  roles?: string[];
  mobileNumber?: string;
  addresses?: AddressDetails[];
  isVerified: boolean;
  isBlocked: boolean;
  unreadNotificationsCount: number;
  memberSince: string;
  cartCount: number;
}

export type RoleType = 'ADMIN' | 'USER';

// export interface Role {
// 	id: number;
// 	name: string;
// 	type: roleType;
// }

export interface Product {
  id: number;
  name: string;
  description?: string;
  slug: string;
  categoryId: number;
  category: Category;
  reviews: Review[];
  variants: ProductVariant[];
  averageRating: number;
  reviewsCount?: number;
  variantsCount: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: number;
  name: string; // The "Human Readable" label (e.g., "L / Blue")
  sku: string;

  /** * Flexible attributes (e.g., { Size: "L", Color: "Blue", Material: "Cotton" })
   * This replaces the hardcoded 'size' and 'color' fields.
   */
  attributes: Record<string, string>;

  price: number;
  calculatedPrice: number;
  compareAtPrice: number | null;

  imagePath: string | null;
  stockQty: number;
  isActive: boolean;

  productId: number;
  product?: {
    name: string;
    slug: string;
    id: number;
    variantsCount: number;
  }; // Parent product info
  discounts?: Discount[];
  reviews?: Review[]; // If you're eager loading reviews
  reviewsCount?: number;
  avgUnitCost: number;
  suggestedPrice: number;
}

export interface CheckoutItem {
  id: number;
  quantity: number;
  variant: ProductVariant;
}

export interface CartItem extends CheckoutItem {
  isChecked: boolean;
}

export type DiscountType = 'fixed' | 'percentage';

export interface Discount {
  id: number;
  code?: string;
  description?: string;
  type: DiscountType;
  value: string | number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  variants?: ProductVariant[];
  variantsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 'verification' | 'order';

export interface Notification {
  id: string;
  title: number;
  message: string;
  isRead: boolean;
  url: string;
  date: string;
  type: NotificationType;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  parent?: Category;
  children: Category[];
  products: Product[];
  productsCount?: number;
  isLeaf: boolean;
  isActive: boolean;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  user: {
    id: number;
    name: string;
    avatar?: string;
  };
  product: {
    id: number;
    name: string;
    slug: string;
  };
  variant: {
    id: number;
    name: string;
    sku: string;
    imagePath: string | null;
  };
  isPublished: boolean;
  relativeTime: string;
  createdAt: string;
  updatedAt: string;
  isUpdated: boolean;
  // ratingCount: number;
}

// This replaces your manual "Home" | "Office" | "Other" definition
export interface ServiceableArea {
  id: number;
  barangay: string;
  city: string;
  province: string;
  isActive: boolean;
}

export interface AddressDetails {
  id: number;
  type: AddressDetailsType;
  streetAddress: string; // house/bldg/street line
  fullAddress: string; // computed: streetAddress + barangay + city
  contactNumber: string;
  contactPerson: string;
  isDefault: boolean;
  userId: number;
  serviceableAreaId: number | null;
  serviceableArea: ServiceableArea | null;
  user?: User;
}

export interface AddressPayload {
  type: AddressDetailsType;
  serviceable_area_id: number | null;
  street_address: string;
  contact_person: string;
  contact_number: string;
  is_default?: boolean;
}

export interface Tab<T> {
  id: number;
  label: string;
  value: T;
}

export interface NavItem {
  id: number;
  href: string;
  label: string;
  icon?: string;
}

export type PaymentType = 'cod' | 'gcash' | 'paymaya' | 'card';

export interface PaymentMethod {
  // id: string;
  name: string;
  type: PaymentType;
  active: boolean;
}

export type DeliveryType = 'standard' | 'express' | 'custom';

export interface DeliveryTypeDetails {
  name: string;
  price: number;
  description: string;
  // type: DeliveryType;
  // requiresInput: boolean;
  dateSchedule: string | null;
  timeSchedule: string[] | null;
}

export interface CustomDeliveryTimeDetails {
  date: string;
  time: string;
}

export type VoucherType = 'fixed' | 'percentage' | 'shipping';

export interface VoucherDetails {
  id: number;
  code: string;
  description: string;
  type: VoucherType;
  value: number | string;
  isActive: boolean;
  minSpend: number;
  expiresAt: string;
  isClaimed: boolean;
  amountNeeded: number;
  usedCount: number;
  canApply: boolean;

  // users?: User[];
  isPersonal: boolean;
  isExpired: boolean;
  users?: User[];
  usageLimit: number | null;
}

export interface Supplier {
  id: number;
  name: string;
  email?: string | null;
  contactNumber?: string | null;
  contactPerson?: string | null;
  address?: string | null;
}

export const INV_MOVEMENT_TYPES = ['purchase', 'sale', 'customer_return', 'purchase_return', 'adjustment'] as const;

export type InventoryMovementType = (typeof INV_MOVEMENT_TYPES)[number];

export const INV_MOVEMENT_STATUS = ['available', 'damaged', 'lost', 'quarantine'] as const;

export type InventoryMovementStatus = (typeof ADJUSTMENT_STATUS)[number];

export interface InventoryMovement {
  id: number;
  productVariantId: number;
  userId: number;
  supplierId: number;
  variant?: ProductVariant;
  user?: User;
  supplier?: Supplier;
  quantity: number;
  unitCost: number;
  type: InventoryMovementType;
  status: InventoryMovementStatus;
  referenceId: number;
  referenceType: string;
  createdAt: string;
  updatedAt: string;
  reason?: string;
  reference?: string;
}

export interface PriceHistory {
  id: number;
  variantId: number;
  variant?: ProductVariant;
  oldPrice: number | string;
  newPrice: number | string;
  marginAtTime: number;
  reason: string;
  reason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatusType = 'paid' | 'unpaid' | 'refunded';

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  id: number;
  orderId: number;
  productVariantId: number | null;
  productName: string;
  variantName: string;
  variantAttributes: Record<string, string> | null;
  quantity: number;
  priceAtPurchase: number;
  discountAtPurchase: number;
  lineTotal: number;
  variant?: ProductVariant | null;
}

export interface OrderReturn {
  id: number;
  returnNumber: string;
  status: string;
  adminNote: string | null;
  createdAt: string;
  items?: ReturnItem[];
}

export interface ReturnItem {
  id: number;
  productName: string;
  variantName: string;
  quantity: number;
  reason: string;
  condition: 'pending_inspection' | 'sellable' | 'damaged';
  resolution: 'pending' | 'refund' | 'replacement';
  isRestocked: boolean;
  variant?: ProductVariant | null;
}

export interface OrderDetails {
  id: number;
  orderNumber: string;
  userId: number;
  addressId: number | null;

  shippingContactPerson: string;
  shippingContactNumber: string;
  shippingFullAddress: string;

  voucherCode: string | null;
  voucherDiscount: number;

  itemsSubtotal: number;
  shippingFee: number;
  finalTotal: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentType;

  deliveryType: DeliveryType;
  deliverySchedule: {
    date: string;
    time: string;
  } | null;

  notes: string | null;

  paymongoSourceId?: string | null;
  paymongoPaymentId?: string | null;

  isCancellable: boolean;
  isReturnable: boolean;

  createdAt: string;
  relativeTime: string;
  updatedAt: string;

  items?: OrderItem[];
  returns?: OrderReturn[];
  address?: AddressDetails | null;
  user?: {
    id: number;
    name: string;
  } | null;
}

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'completed' | 'cancelled';

export interface OrderReturn {
  id: number;
  returnNumber: string;
  orderId: number; // added
  orderNumber: string; // added — from eager loaded order
  status: ReturnStatus; // typed properly
  adminNote: string | null;
  createdAt: string;
  items?: ReturnItem[];
}

/* auth types..
 **----------------
 */

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterPayload {
  fname: string;
  lname: string;
  email: string;
  password: string;
  password_confirmation: string; // Matches Laravel's naming convention
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyEmailPayload {
  email: string;
  token: string;
}

export interface UpdateProfilePayload {
  fname: string;
  lname: string;
  email: string;
  // Add other fields like 'phone' or 'address' if applicable
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface AppError {
  type: 'unauthorized' | 'validation' | 'server' | 'network';
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

export interface Meta {
  current_page: number;
  from: number;
  last_page: number;
  total: number;
  to: number;
  per_page: number;
  path: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  meta: Meta;
}

export interface ResourceResponse<T> {
  data: T;
}

export interface SelectOptionsType<T> {
  id: number;
  label: string;
  value: T;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
}

export interface OptionDetails {
  label: string;
  value: string | number | null;
}
