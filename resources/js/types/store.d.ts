import { AddressDetailsType } from '@/data';

export interface User {
    id: number;
    fname: string;
    lname: string;
    email: string;
    role: RoleType;
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
    // reviewsCount?: number;
    variantsCount: number;
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
    product?: Product; // Parent product info
    discounts?: Discount[];
    reviews?: Review[]; // If you're eager loading reviews
}

export interface CheckoutItem extends ProductVariant {
    quantity: number;
}

export interface CartItem {
    id: number;
    quantity: number;
    isChecked: boolean;
    variant: ProductVariant;
    // product: {
    //     id: number;
    //     name: string;
    //     slug: string;
    // };
}

export type DiscountType = 'fixed' | 'percentage';

export interface Discount {
    id: number;
    code?: string;
    description?: string;
    type: DiscountType;
    value: number;
    startData: string;
    endDate: string;
    isActive: boolean;
    variants?: ProductVariant[];
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
    isLeaf: boolean;
}

export interface Review {
    id: number;
    rating: number;
    comment?: string;
    user: {
        name: string;
        avatar?: string;
    };
    product: {
        name: string;
        slug: string;
    };
    variant: {
        name: string;
        sku: string;
    };
    relativeTime: string;
    createdAt: string;
    updatedAt: string;
    // ratingCount: number;
}

// This replaces your manual "Home" | "Office" | "Other" definition

export interface AddressDetails {
    id: number;
    type: AddressDetailsType;
    fullAddress: string;
    contactNumber: string;
    contactPerson: string;
    isDefault: boolean;
    userId: number;
    user?: User;
}

export interface AddressPayload {
    type: AddressDetailsType;
    full_address: string;
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

export type PaymentType = 'cod' | 'paypal' | 'gcash' | 'paymaya' | 'cc';

export interface PaymentMethod {
    id: string;
    name: string;
    type: PaymentType;
}

export type DeliveryType = 'standard' | 'express' | 'custom';

export interface DeliveryTypeDetails {
    id: number;
    name: string;
    price: number;
    description: string;
    type: DeliveryType;
    // requiresInput: boolean;
    dateSchedule: string | null;
    timeSchedule: string[] | null;
}

export interface CustomDeliveryTimeDetails {
    date: string;
    time: string;
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

export interface PaginatedResponse<T> {
    data: T[];
    links: {
        first: string;
        last: string;
        prev: string | null;
        next: string | null;
    };
    meta: {
        current_page: number;
        from: number;
        last_page: number;
        total: number;
    };
}
export interface ResourceResponse<T> {
    data: T;
}

interface SelectOptionsType<T> {
    id: number;
    label: string;
    value: T;
}
