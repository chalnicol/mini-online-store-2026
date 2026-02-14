import type { DeliveryTypeDetails, PaymentMethod } from '@/types/store';

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
    address: ['Must be at least 10 characters long'],
    contactPerson: ['Must be at least 2 characters long'],
    contactNumber: ['Must be a valid contact number'],
};

export const paymentMethods: PaymentMethod[] = [
    { id: 'p1', name: 'Cash on Delivery', type: 'cod' },
    { id: 'p2', name: 'Gcash', type: 'gcash' },
    { id: 'p3', name: 'Paymaya', type: 'paymaya' },
    { id: '4', name: 'Credit Card', type: 'cc' },
];

export const deliveryTypes: DeliveryTypeDetails[] = [
    {
        id: 1,
        name: 'Standard Delivery',
        price: 40,
        type: 'standard',
        description:
            'FREE local delivery for orders above P300, otherwise P40. Join our scheduled runs at 9AM, 2PM, or 6PM.',
        dateSchedule: null,
        timeSchedule: null,
    },
    {
        id: 2,
        name: 'Express Delivery',
        price: 60,
        type: 'express',
        description:
            'Our fastest service. Direct delivery to your door within 30 minutes or less.',
        dateSchedule: null,
        timeSchedule: null,
    },
    {
        id: 3,
        name: 'Custom Delivery',
        price: 60, // Suggested price point between Standard and Express
        type: 'custom',
        description:
            'Book a specific day and time slot that fits your schedule.',
        dateSchedule: '',
        timeSchedule: [],
    },
];

// export const notifications: Notification[] = [
//     {
//         id: 1,
//         senderId: 1,
//         senderName: 'Jane Doe',
//         isRead: false,
//         message: 'You are succesfully registered',
//         type: 'info',
//         url: '/profile',
//         date: '2026/01/01',
//     },
//     {
//         id: 2,
//         senderId: 2,
//         senderName: 'John Doe',
//         isRead: false,
//         message: 'This is some kind of notification',
//         type: 'success',
//         url: '/profile',
//         date: '2026/01/01',
//     },
//     {
//         id: 3,
//         senderId: 1,
//         senderName: 'Jane Doe',
//         isRead: true,
//         message: 'This is some kind of another notification',
//         type: 'info',
//         url: '/profile',
//         date: '2025/01/01',
//     },
// ];

export const ADDRESS_TYPES = ['Home', 'Office', 'Other'] as const;

// This automatically creates the type from the array values!
export type AddressDetailsType = (typeof ADDRESS_TYPES)[number];
