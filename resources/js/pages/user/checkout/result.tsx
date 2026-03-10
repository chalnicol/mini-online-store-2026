import CustomLayout from '@/layouts/app-custom-layout';
import { OrderDetails } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link } from '@inertiajs/react';
import { AlertCircle, CheckCircle, ChevronRight, Clock, Package, ShoppingBag, XCircle } from 'lucide-react';
import React from 'react';

type ResultType = 'success' | 'pending' | 'cancelled' | 'failed';

interface OrderResultProps {
    order: OrderDetails;
    result: ResultType;
}

const resultConfig: Record<ResultType, {
    icon: React.ReactNode;
    title: string;
    message: string;
    iconBg: string;
    iconRing: string;
}> = {
    success: {
        icon:    <CheckCircle size={48} className="text-emerald-500" strokeWidth={1.5} />,
        title:   'Order Placed!',
        message: 'Thank you for your order. We\'ll get it ready for you shortly.',
        iconBg:  'bg-emerald-50',
        iconRing: 'ring-emerald-50/50',
    },
    pending: {
        icon:    <Clock size={48} className="text-amber-500" strokeWidth={1.5} />,
        title:   'Payment Pending',
        message: 'We\'re waiting for your payment confirmation. Your order is reserved.',
        iconBg:  'bg-amber-50',
        iconRing: 'ring-amber-50/50',
    },
    cancelled: {
        icon:    <XCircle size={48} className="text-rose-400" strokeWidth={1.5} />,
        title:   'Payment Cancelled',
        message: 'Your payment was cancelled. Your order is still saved — you can retry from your orders page.',
        iconBg:  'bg-rose-50',
        iconRing: 'ring-rose-50/50',
    },
    failed: {
        icon:    <AlertCircle size={48} className="text-rose-500" strokeWidth={1.5} />,
        title:   'Payment Failed',
        message: 'Something went wrong with your payment. Please try again or choose a different payment method.',
        iconBg:  'bg-rose-50',
        iconRing: 'ring-rose-50/50',
    },
};

const paymentStatusLabel: Record<string, { label: string; color: string }> = {
    unpaid:   { label: 'Unpaid',   color: 'text-amber-600' },
    paid:     { label: 'Paid',     color: 'text-emerald-600' },
    refunded: { label: 'Refunded', color: 'text-gray-500' },
};

const OrderResult = ({ order, result }: OrderResultProps) => {
    const config      = resultConfig[result] ?? resultConfig.success;
    const payStatus   = paymentStatusLabel[order.paymentStatus] ?? { label: order.paymentStatus, color: 'text-gray-600' };
    const isCOD       = order.paymentMethod === 'cod';

    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center py-10">

            {/* Icon */}
            <div className={`mb-4 flex h-20 w-20 items-center justify-center rounded-full ${config.iconBg} ring-8 ${config.iconRing}`}>
                {config.icon}
            </div>

            {/* Title */}
            <h1 className="mb-1 text-2xl font-bold text-gray-900">{config.title}</h1>
            <p className="mb-6 max-w-sm text-center text-sm text-gray-500">{config.message}</p>

            {/* Order Summary Card */}
            <div className="mb-6 w-full max-w-sm overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-2.5">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Order Summary
                    </p>
                </div>

                <div className="divide-y divide-gray-100 px-4">
                    <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-gray-500">Order Number</span>
                        <span className="font-bold text-gray-800">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-gray-500">Payment Method</span>
                        <span className="font-semibold capitalize text-gray-800">
                            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                        </span>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-gray-500">Payment Status</span>
                        <span className={`font-semibold ${isCOD ? 'text-amber-600' : payStatus.color}`}>
                            {isCOD ? 'Pay on Delivery' : payStatus.label}
                        </span>
                    </div>
                    <div className="flex justify-between py-2.5 text-sm">
                        <span className="text-gray-500">Total Amount</span>
                        <span className="text-base font-bold text-sky-900">{formatPrice(order.finalTotal)}</span>
                    </div>
                </div>

                {order.shippingFullAddress && (
                    <div className="border-t border-gray-100 bg-gray-50 px-4 py-2.5">
                        <p className="mb-0.5 text-xs font-semibold text-gray-400">Delivering to</p>
                        <p className="text-sm font-medium text-gray-700">{order.shippingContactPerson}</p>
                        <p className="text-xs text-gray-500">{order.shippingFullAddress}</p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex w-full max-w-sm flex-col gap-2">
                <Link
                    href={`/profile/orders/${order.id}`}
                    className="flex items-center justify-center gap-2 rounded-lg bg-sky-900 px-6 py-3 font-semibold text-white hover:bg-sky-800"
                >
                    <Package size={16} />
                    View Order
                    <ChevronRight size={16} />
                </Link>
                <Link
                    href="/"
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-600 hover:bg-gray-50"
                >
                    <ShoppingBag size={16} />
                    Continue Shopping
                </Link>
            </div>

        </div>
    );
};

OrderResult.layout = (page: React.ReactNode) => <CustomLayout showFilterSearch={false}>{page}</CustomLayout>;

export default OrderResult;
