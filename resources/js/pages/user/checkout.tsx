import CheckoutAddressCard from '@/components/store/CheckoutAddressCard';
import CheckoutItemCard from '@/components/store/CheckoutItemCard';
import CustomButton from '@/components/store/CustomButton';
import CustomDeliveryFormModal from '@/components/store/CustomDeliveryForm';
import DeliveryTypeCard from '@/components/store/DeliveryTypeCard';
import SelectVoucherModal from '@/components/store/SelectVoucherModal';
import ShippingAddressSelectModal from '@/components/store/ShippingAddressSelectModal';
import TitleBar from '@/components/store/TitleBar';
import { deliveryDataTypes, paymentMethods } from '@/data';
import CustomLayout from '@/layouts/app-custom-layout';
import { cn } from '@/lib/utils';
import type {
    AddressDetails,
    CheckoutItem,
    CustomDeliveryTimeDetails,
    DeliveryType,
    PaymentType,
    VoucherDetails,
} from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { Check, Circle, Home, ShoppingBag, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CheckoutProps {
    defaultAddress: AddressDetails | null;
    addresses: AddressDetails[];
    cartItems: CheckoutItem[];
    initialShippingFee: number;
    itemsSubtotal: number;
    totalItemsCount: number;
    availableVouchers: VoucherDetails[];
    discount: number;
    appliedVoucher: VoucherDetails | null;
}

const Checkout = ({
    addresses,
    cartItems,
    initialShippingFee,
    itemsSubtotal,
    totalItemsCount,
    availableVouchers,
    discount,
    appliedVoucher,
}: CheckoutProps) => {
    // const [shippingAddress, setShippingAddress] =
    //     useState<AddressDetails | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
        null,
    );
    const [showAvailableVouchers, setShowAvailableVouchers] = useState(false);
    const [manageAddress, setManageAddress] = useState(false);
    const [paymentType, setPaymentType] = useState<PaymentType>('cod');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
    const [editCustomDeliveryTime, setEditCustomDeliveryTime] = useState(false);
    const [customDeliveryTimeData, setCustomDeliveryTimeData] =
        useState<CustomDeliveryTimeDetails | null>({
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
        });
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const placeOrderBtnDisabled =
        selectedAddressId === null || cartItems.length === 0;

    // Simple lookups don't need memoization
    const shippingAddress =
        addresses.find((a) => a.id === selectedAddressId) || null;

    const shippingFee = useMemo(() => {
        // 1. Handle Standard Delivery (with the P300 Free Rule)
        if (deliveryType === 'standard') {
            return itemsSubtotal >= 300 ? 0 : 40;
        }

        // 2. Handle Express and Custom
        // We look up the price directly from your data object
        const selectedData = deliveryDataTypes[deliveryType];

        return selectedData ? selectedData.price : Number(initialShippingFee);
    }, [deliveryType, itemsSubtotal, initialShippingFee]);

    useEffect(() => {
        if (!selectedAddressId && addresses && addresses.length > 0) {
            setSelectedAddressId(
                addresses.find((address) => address.isDefault === true)?.id ||
                    null,
            );
        }
    }, []);

    const handleDeliveryTimeEdit = (type: DeliveryType) => {
        if (type === 'custom') {
            setEditCustomDeliveryTime(true);
        }
    };
    const handleCustomDeliveryTimeSubmit = (
        data: CustomDeliveryTimeDetails,
    ) => {
        setCustomDeliveryTimeData(data);
        setEditCustomDeliveryTime(false);

        // Sync custom details to backend
        // router.post('/checkout/update-delivery', {
        //     delivery_type: 'custom',
        //     schedule_date: data.date,
        //     schedule_time: data.time,
        // }, { preserveScroll: true });
    };

    const handleSelectAddress = (id: number) => {
        setSelectedAddressId(id);
        setManageAddress(false);
    };

    const handleSeeAvailableVouchers = () => {
        setShowAvailableVouchers(true);
        setLoading(true);

        router.reload({
            only: ['availableVouchers'],
            onFinish: () => setLoading(false),
        });
    };

    const handleApplyVoucher = (voucherId: number) => {
        //..
        // console.log(voucherId);
        setLoading(true);
        setError(null);

        router.post(
            '/checkout/apply-voucher',
            {
                voucher_id: voucherId,
            },
            {
                only: ['discount', 'appliedVoucher'],
                onError: (error: Record<string, string>) => {
                    setError(error.voucher || 'Error applying voucher.');
                },
                onFinish: () => {
                    setShowAvailableVouchers(false);
                    setLoading(false);
                },
            },
        );
    };

    const handleRemoveVoucher = () => {
        setLoading(true);
        setError(null);

        router.post(
            '/checkout/remove-voucher',
            {},
            {
                only: ['discount', 'appliedVoucher'],
                onFinish: () => setLoading(false),
            },
        );
    };

    const handlePlaceOrder = () => {
        //..
    };

    const handleDeliveryTypeChange = (type: DeliveryType) => {
        setDeliveryType(type);

        // If it's not custom, sync with backend immediately
        // if (type !== 'custom') {
        //     router.post(
        //         '/checkout/update-delivery',
        //         {
        //             delivery_type: type,
        //         },
        //         { preserveScroll: true },
        //     );
        // } else {
        //     // If it's custom, trigger the modal
        //     setEditCustomDeliveryTime(true);
        // }
    };

    if (cartItems.length === 0) {
        return (
            <>
                <TitleBar title="Checkout" className="mb-4" />

                <div className="flex flex-col items-center justify-center py-10 text-center">
                    <ShoppingBag size={64} className="mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        No items in cart.
                    </h2>
                    <p className="mb-6 text-gray-500">
                        Looks like you haven't added anything yet.
                    </p>
                    <Link
                        href="/cart"
                        className="rounded-lg bg-sky-900 px-6 py-2 font-semibold text-white hover:bg-sky-800"
                    >
                        View Cart
                    </Link>
                </div>
            </>
        );
    }

    return (
        <>
            <TitleBar title="Checkout" className="mb-4" />

            <div className="flex flex-col gap-x-4 gap-y-3 lg:flex-row">
                <div className="flex-1 space-y-4">
                    {/* shipping address */}
                    <div className="rounded border border-gray-300 bg-white px-3 pt-2 pb-4 font-semibold shadow">
                        <p className="mb-2 font-bold">Shipping Address</p>

                        {shippingAddress ? (
                            <div className="flex flex-col items-start gap-y-2 rounded border border-gray-400 bg-gray-50 p-2 sm:flex-row">
                                <CheckoutAddressCard
                                    address={shippingAddress}
                                    className="flex-1"
                                />

                                <CustomButton
                                    label="Change"
                                    size="xs"
                                    color="primary"
                                    onClick={() => setManageAddress(true)}
                                />
                            </div>
                        ) : (
                            <div className="flex min-h-22 flex-col items-center justify-center gap-y-1 rounded border border-gray-400 bg-gray-50 p-2">
                                <Home size={22} className="text-gray-400" />
                                <div className="flex flex-col items-center gap-2 sm:flex-row">
                                    <p className="font-bold">
                                        No address found in your profile.
                                    </p>
                                    <CustomButton
                                        label="Add Address"
                                        size="xs"
                                        color="primary"
                                        onClick={() => setManageAddress(true)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                    {/* delivery type */}
                    <div className="rounded border border-gray-300 bg-white px-3 pt-2 pb-4 font-semibold shadow">
                        <p className="mb-2 font-bold">Delivery Type</p>

                        <div className="flex flex-col gap-2 md:flex-row">
                            {Object.entries(deliveryDataTypes).map(
                                ([key, details]) => (
                                    <DeliveryTypeCard
                                        // Use the 'key' as the unique ID now
                                        key={key}
                                        // Pass the details and the key (type) to the card
                                        // We spread details and add 'type' so 't' matches your expected object shape
                                        t={{
                                            ...details,
                                            type: key as DeliveryType,
                                        }}
                                        deliveryType={deliveryType}
                                        // Ensure the click handler passes the key (the type)
                                        onClick={handleDeliveryTypeChange}
                                        onEdit={handleDeliveryTimeEdit}
                                        // Custom logic remains based on the key
                                        timeData={
                                            key === 'custom'
                                                ? customDeliveryTimeData
                                                : null
                                        }
                                    />
                                ),
                            )}
                        </div>
                    </div>
                    {/* package details */}
                    <div className="rounded border border-gray-300 bg-white px-3 pt-2 pb-4 font-semibold shadow">
                        <p className="mb-2 font-bold">Items</p>
                        {cartItems.length > 0 ? (
                            <div>
                                {cartItems.map((item) => (
                                    <CheckoutItemCard
                                        key={item.id}
                                        item={item}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-24 items-center justify-center rounded border border-gray-300 bg-gray-100 shadow">
                                <p className="font-bold text-gray-400">
                                    No items found.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="w-full flex-none space-y-4 lg:w-72">
                    {/* payment method */}
                    <div className="rounded border border-gray-300 bg-white px-3 pt-2 pb-4 font-semibold shadow">
                        <p className="mb-2 font-bold">Select Payment Method</p>
                        <div>
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    className={`flex w-full items-center gap-x-2 border-b border-gray-300 px-2 py-1 font-semibold last:border-b-0 ${
                                        method.type == paymentType
                                            ? 'bg-gray-100 text-sky-900'
                                            : 'hover:bg-gray-50'
                                    } " } cursor-pointer`}
                                    onClick={() => setPaymentType(method.type)}
                                    disabled={method.type == paymentType}
                                >
                                    {method.type == paymentType ? (
                                        <Check size={14} />
                                    ) : (
                                        <Circle size={12} />
                                    )}
                                    {method.name}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* order details */}
                    <div className="rounded border border-gray-300 bg-white px-3 pt-2 pb-4 font-semibold shadow">
                        <p className="mb-2 font-bold">Order Details</p>
                        <div className="flex min-h-60 flex-col">
                            <div className="mb-1.5 flex justify-between">
                                <p>
                                    Subtotal{' '}
                                    <span className="text-sm">
                                        ({totalItemsCount}{' '}
                                        {totalItemsCount === 1
                                            ? 'item'
                                            : 'items'}
                                        )
                                    </span>
                                </p>
                                <p className="font-bold">
                                    {formatPrice(itemsSubtotal)}
                                </p>
                            </div>
                            <div className="flex justify-between">
                                <p>Shipping Fee</p>
                                <p className="font-bold">
                                    {formatPrice(shippingFee)}
                                </p>
                            </div>

                            <div className="my-3 border-t border-gray-300 py-1.5">
                                {error && (
                                    <p className="mt-1 mb-2 rounded-e border-s-4 border-rose-600 bg-red-50 p-2 text-xs text-rose-600">
                                        {error}
                                    </p>
                                )}
                                <div className="flex items-baseline justify-between">
                                    <p className="font-semibold">Voucher</p>
                                    <CustomButton
                                        label={
                                            appliedVoucher
                                                ? 'Change Voucher'
                                                : 'See Vouchers'
                                        }
                                        size="xs"
                                        color="secondary"
                                        className=""
                                        onClick={handleSeeAvailableVouchers}
                                        // disabled={processing}
                                    />
                                </div>

                                <div className="relative my-2.5 space-y-0.5 rounded border border-gray-300 bg-gray-50 p-2">
                                    <div className="item-baseline flex flex-col">
                                        <p className="text-[10px] tracking-tight uppercase">
                                            Code Applied :{' '}
                                        </p>

                                        <p
                                            className={cn(
                                                'font-bold',
                                                appliedVoucher
                                                    ? 'text-sky-900'
                                                    : 'text-gray-400',
                                            )}
                                        >
                                            {appliedVoucher
                                                ? appliedVoucher.code
                                                : '(NONE)'}
                                        </p>
                                    </div>

                                    <div className="flex items-baseline justify-between gap-x-1.5">
                                        <p className="text-[10px] tracking-tight uppercase">
                                            Discount Amount :{' '}
                                        </p>
                                        <p
                                            className={cn(
                                                'font-bold',
                                                discount > 0
                                                    ? 'text-green-700'
                                                    : 'text-gray-400',
                                            )}
                                        >
                                            {discount > 0
                                                ? `-${formatPrice(discount)}`
                                                : formatPrice(0)}
                                        </p>
                                    </div>
                                    {appliedVoucher && (
                                        <button
                                            title="Remove Voucher"
                                            className="absolute top-2 right-2 aspect-square cursor-pointer rounded-full bg-rose-400 px-0.5 hover:bg-rose-500"
                                            onClick={handleRemoveVoucher}
                                            disabled={!appliedVoucher}
                                        >
                                            <X
                                                size={10}
                                                className="fill-current text-white"
                                            />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mb-2.5 flex justify-between border-t border-gray-300 pt-3">
                                <p className="text-lg font-bold">Total</p>
                                <div className="text-right">
                                    <p className="text-xl font-bold text-sky-900">
                                        {formatPrice(
                                            Math.max(
                                                0,
                                                Number(itemsSubtotal) -
                                                    discount +
                                                    shippingFee,
                                            ),
                                        )}
                                    </p>
                                    <p className="text-[10px] font-normal text-gray-500">
                                        Taxes included
                                    </p>
                                </div>
                            </div>

                            {/* <Link
                                href="/"
                                className="block w-full rounded bg-sky-900 p-2 text-center text-white"
                            >
                                Place Order Now
                            </Link> */}
                            <CustomButton
                                label="Place Order Now"
                                size="lg"
                                color="primary"
                                disabled={placeOrderBtnDisabled}
                                onClick={handlePlaceOrder}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {editCustomDeliveryTime && (
                <CustomDeliveryFormModal
                    initialData={customDeliveryTimeData}
                    onClose={() => setEditCustomDeliveryTime(false)}
                    onSubmit={handleCustomDeliveryTimeSubmit}
                />
            )}
            {manageAddress && (
                <ShippingAddressSelectModal
                    addresses={addresses}
                    onClose={() => setManageAddress(false)}
                    selected={selectedAddressId || 0}
                    onSelect={handleSelectAddress}
                />
            )}
            {showAvailableVouchers && (
                <SelectVoucherModal
                    vouchers={availableVouchers || []}
                    onClose={() => setShowAvailableVouchers(false)}
                    onSelect={handleApplyVoucher}
                    loading={loading}
                />
            )}
        </>
    );
};

Checkout.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);
export default Checkout;
