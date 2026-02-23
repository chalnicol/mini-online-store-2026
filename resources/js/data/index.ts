import type {
    DeliveryType,
    DeliveryTypeDetails,
    NavItem,
    PaymentMethod,
} from '@/types/store';

export const formRules: Record<string, string[]> = {
    firstName: ['Must be at least 2 characters long', 'Cannot contain numbers'],
    lastName: ['Must be at least 2 characters long', 'Cannot contain numbers'],
    email: ['Must be a valid email address'],
    password: [
        'Must be at least 8 characters long',
        'Must contain at least one uppercase letter',
        'Must contain at least one lowercase letter',
        'Must contain at least one number',
        'Must contain at least one special character',
    ],
    passwordConfirmation: ['Must match the password'],
    mobileNumber: ['Must be a valid mobile number'],
    address: ['Must be a valid full address line'],
    contactPerson: ['Must be at least 2 characters long'],
    contactNumber: ['Must be a valid contact number'],
};

export const paymentMethods: PaymentMethod[] = [
    { id: 'p1', name: 'Cash on Delivery', type: 'cod' },
    { id: 'p2', name: 'Gcash', type: 'gcash' },
    { id: 'p3', name: 'Paymaya', type: 'paymaya' },
    { id: '4', name: 'Credit Card', type: 'cc' },
];

export const deliveryDataTypes: Record<DeliveryType, DeliveryTypeDetails> = {
    standard: {
        name: 'Standard Delivery',
        price: 40,
        description:
            'FREE local delivery for orders above P300, otherwise P40. Join our scheduled runs at 9AM, 2PM, or 6PM.',
        dateSchedule: null,
        timeSchedule: null,
    },
    express: {
        name: 'Express Delivery',
        price: 80,
        description:
            'Our fastest service. Direct delivery to your door within 30 minutes or less.',
        dateSchedule: null,
        timeSchedule: null,
    },
    custom: {
        name: 'Custom Delivery',
        price: 60, // Suggested price point between Standard and Express
        description:
            'Book a specific day and time slot that fits your schedule.',
        dateSchedule: '',
        timeSchedule: [],
    },
};

export const adnminNavItems: NavItem[] = [
    { id: 1, href: '/admin', label: 'Dashboard' },
    { id: 2, href: '/admin/users', label: 'Users' },
    { id: 3, href: '/admin/products', label: 'Products' },
    { id: 6, href: '/admin/categories', label: 'Categories' },
    { id: 10, href: '/admin/discounts', label: 'Discounts' },
    { id: 9, href: '/admin/vouchers', label: 'Vouchers' },
    { id: 4, href: '/admin/stocks', label: 'Stocks' },
    { id: 5, href: '/admin/orders', label: 'Orders' },
    { id: 8, href: '/admin/reviews', label: 'Reviews' },
];

export const profileNavItems: NavItem[] = [
    { id: 1, href: '/profile', label: 'Settings' },
    { id: 2, href: '/profile/addresses', label: 'Addresses' },
    { id: 3, href: '/profile/orders', label: 'Orders' },
    { id: 4, href: '/profile/reviews', label: 'Reviews' },
];

export const ADDRESS_TYPES = ['Home', 'Office', 'Other'] as const;

export const AVAILABLE_ATTRIBUTE_KEYS = [
    'Color',
    'Size',
    'Material',
    'Style',
    'Weight',
];

// This automatically creates the type from the array values!
export type AddressDetailsType = (typeof ADDRESS_TYPES)[number];
