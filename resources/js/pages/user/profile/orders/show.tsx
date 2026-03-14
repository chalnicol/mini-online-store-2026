import ConfirmationModal from '@/components/store/ConfirmationModal';
import CustomButton from '@/components/store/CustomButton';
import PromptMessage from '@/components/store/PromptMessage';
import ReturnRequestModal from '@/components/store/ReturnRequestModal';
import ProfileLayout from '@/layouts/profile/layout';
import { cn, getImageUrl } from '@/lib/utils';
import { OrderDetails, OrderStatus } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700 border-blue-300' },
  shipped: { label: 'Shipped', className: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
  delivered: { label: 'Delivered', className: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
  cancelled: { label: 'Cancelled', className: 'bg-rose-100 text-rose-700 border-rose-300' },
  returned: { label: 'Returned', className: 'bg-gray-100 text-gray-600 border-gray-300' },
};

const paymentMethodLabel: Record<string, string> = {
  cod: 'Cash on Delivery',
  gcash: 'GCash',
  paymaya: 'PayMaya',
  credit_card: 'Credit Card',
};

const OrderDetail = ({ order }: { order: OrderDetails }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toCancelOrder, setToCancelOrder] = useState(false);

  const status = statusConfig[order.status];
  const [showReturnModal, setShowReturnModal] = useState(false);

  const handleCancel = () => {
    setToCancelOrder(false);
    setLoading(true);
    setError(null);
    router.post(
      `/profile/orders/${order.id}/cancel`,
      {},
      {
        preserveScroll: true,
        onError: (errors) => setError(errors.order ?? 'Failed to cancel order.'),
        onFinish: () => setLoading(false),
      },
    );
  };

  const handleReturn = () => {
    // router.post(`/profile/orders/${order.id}/return`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <div className="flex items-center gap-2">
          <Link
            href="/profile/orders"
            className="flex aspect-square items-center rounded-full bg-sky-900 px-0.5 text-gray-500 text-white hover:bg-sky-800"
          >
            <ChevronLeft size={16} />
          </Link>
          <h2 className="text-lg font-bold text-gray-600 lg:text-xl">{order.orderNumber}</h2>
        </div>
        <span
          className={cn('rounded border px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase', status.className)}
        >
          {status.label}
        </span>
      </div>

      {error && <PromptMessage type="error" message={error} />}

      {/* Items */}
      <div className="overflow-hidden rounded border border-gray-400">
        <div className="border-b border-gray-300 bg-gray-100 px-3 py-2">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Items</p>
        </div>
        <div className="divide-y divide-gray-100">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3 p-3">
              <img
                src={getImageUrl(item.variant?.imagePath || null)}
                alt={item.variantName}
                className="aspect-square w-14 flex-none rounded border border-gray-200 object-cover"
              />
              <div className="flex flex-1 justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-gray-800">{item.productName}</p>
                  <p className="text-xs text-gray-500">{item.variantName}</p>
                  {/* {item.variantAttributes && (
                    <p className="text-[10px] text-gray-400">
                      {Object.entries(item.variantAttributes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </p>
                  )} */}
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <div className="space-y-0.5 text-right">
                  {/* <p className="text-sm font-bold text-gray-800">{formatPrice(item.priceAtPurchase)}</p> */}
                  <p className="text-sm font-bold text-gray-800 md:text-base">{formatPrice(item.lineTotal)}</p>

                  {item.discountAtPurchase > 0 && (
                    <p className="text-[10px] text-rose-500 md:text-xs">-{formatPrice(item.discountAtPurchase)} off</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order Summary */}
      <div className="overflow-hidden rounded border border-gray-400">
        <div className="border-b border-gray-300 bg-gray-100 px-3 py-2">
          <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Summary</p>
        </div>
        <div className="space-y-1.5 p-3 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.itemsSubtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{formatPrice(order.shippingFee)}</span>
          </div>
          {order.voucherCode && (
            <div className="flex justify-between text-emerald-600">
              <span>Voucher ({order.voucherCode})</span>
              <span>-{formatPrice(order.voucherDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-gray-200 pt-1.5 font-bold text-gray-800">
            <span>Total</span>
            <span>{formatPrice(order.finalTotal)}</span>
          </div>
        </div>
      </div>

      {/* Shipping & Payment */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded border border-gray-400">
          <div className="border-b border-gray-300 bg-gray-100 px-3 py-2">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Shipping Address</p>
          </div>
          <div className="space-y-0.5 p-3 text-sm text-gray-600">
            <p className="font-bold text-gray-800">{order.shippingContactPerson}</p>
            <p>{order.shippingContactNumber}</p>
            <p>{order.shippingFullAddress}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded border border-gray-400">
          <div className="border-b border-gray-300 bg-gray-100 px-3 py-2">
            <p className="text-xs font-bold tracking-widest text-gray-500 uppercase">Payment</p>
          </div>
          <div className="space-y-0.5 p-3 text-sm text-gray-600">
            <p className="font-bold text-gray-800">{paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}</p>
            <p>
              Status:{' '}
              <span
                className={cn(
                  'font-semibold',
                  order.paymentStatus === 'paid'
                    ? 'text-emerald-600'
                    : order.paymentStatus === 'refunded'
                      ? 'text-blue-600'
                      : 'text-yellow-600',
                )}
              >
                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
              </span>
            </p>
            <p>Delivery: {order.deliveryType.charAt(0).toUpperCase() + order.deliveryType.slice(1)}</p>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="overflow-hidden rounded border border-gray-400">
          <div className="border-b border-gray-300 bg-gray-100 px-3 py-2">
            <p className="text-xs font-bold tracking-widest text-gray-600 uppercase">Notes</p>
          </div>
          <p className="p-3 text-sm text-gray-600">{order.notes}</p>
        </div>
      )}

      {/* Actions */}
      {(order.isCancellable || order.isReturnable) && (
        <div className="flex gap-2">
          {order.isCancellable && (
            <CustomButton
              label="Cancel Order"
              color="danger"
              onClick={() => setToCancelOrder(true)}
              disabled={loading}
            />
          )}
          {order.isReturnable && (
            <CustomButton label="Request Return" color="secondary" onClick={() => setShowReturnModal(true)} />
          )}
        </div>
      )}

      {/* Footer */}
      <p className="text-[10px] text-gray-400">
        Ordered on {order.createdAt} · Last updated {order.updatedAt}
      </p>

      {showReturnModal && <ReturnRequestModal order={order} onClose={() => setShowReturnModal(false)} />}

      {toCancelOrder && (
        <ConfirmationModal
          message="Are you sure you want to cancel this order?"
          onClose={() => setToCancelOrder(false)}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
};

OrderDetail.layout = (page: React.ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default OrderDetail;
