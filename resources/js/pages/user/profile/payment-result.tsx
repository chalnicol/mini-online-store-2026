import ProfileLayout from '@/layouts/profile/layout';
import { OrderDetails } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link } from '@inertiajs/react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface PaymentResultProps {
    order: OrderDetails;
    status: 'success' | 'pending' | 'cancelled';
}

const PaymentResult = ({ order, status }: PaymentResultProps) => {
    const config = {
        success: {
            icon:       <CheckCircle size={56} className="text-emerald-500" />,
            title:      'Payment Successful!',
            message:    'Your payment has been confirmed and your order is being processed.',
            color:      'text-emerald-600',
        },
        pending: {
            icon:       <Clock size={56} className="text-yellow-500" />,
            title:      'Payment Pending',
            message:    'We are waiting for your payment confirmation. We will update your order once confirmed.',
            color:      'text-yellow-600',
        },
        cancelled: {
            icon:       <XCircle size={56} className="text-rose-500" />,
            title:      'Payment Cancelled',
            message:    'Your payment was cancelled. Your order is still saved — you can retry payment from your orders page.',
            color:      'text-rose-600',
        },
    }[status];

    return (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
            {config.icon}

            <div className="space-y-1">
                <h2 className={`text-2xl font-bold ${config.color}`}>{config.title}</h2>
                <p className="text-sm text-gray-500">{config.message}</p>
            </div>

            <div className="w-full max-w-sm overflow-hidden rounded border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-3 py-2 text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        Order Summary
                    </p>
                </div>
                <div className="space-y-1 p-3 text-sm text-left">
                    <div className="flex justify-between text-gray-600">
                        <span>Order</span>
                        <span className="font-semibold">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Total</span>
                        <span className="font-bold text-gray-800">{formatPrice(order.finalTotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Payment</span>
                        <span className="font-semibold capitalize">{order.paymentMethod}</span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Link
                    href={`/profile/orders/${order.id}`}
                    className="rounded bg-sky-900 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-800"
                >
                    View Order
                </Link>
                <Link
                    href="/"
                    className="rounded border border-gray-300 px-5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

PaymentResult.layout = (page: React.ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default PaymentResult;
