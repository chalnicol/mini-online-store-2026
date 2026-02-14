import CheckoutAddressCard from '@/components/store/CheckoutAddressCard';
import CheckoutItemCard from '@/components/store/CheckoutItemCard';
import CustomButton from '@/components/store/CustomButton';
import CustomDeliveryFormModal from '@/components/store/CustomDeliveryForm';
import DeliveryTypeCard from '@/components/store/DeliveryTypeCard';
import SelectAddressModal from '@/components/store/SelectAddressModal';
import TitleBar from '@/components/store/TitleBar';
import { deliveryTypes, paymentMethods } from '@/data';
import CustomLayout from '@/layouts/app-custom-layout';
import type {
    AddressDetails,
    CheckoutItem,
    CustomDeliveryTimeDetails,
    DeliveryType,
    PaymentType,
} from '@/types/store';
import { Link } from '@inertiajs/react';
import { Check, Circle, Home } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CheckoutProps {
    defaultAddress: AddressDetails | null;
    addresses: AddressDetails[];
    cartItems: CheckoutItem[];
    initialShippingFee: number;
    itemsSubtotal: number;
}

const Checkout = ({
    addresses,
    cartItems,
    initialShippingFee,
    itemsSubtotal,
}: CheckoutProps) => {
    // const [shippingAddress, setShippingAddress] =
    //     useState<AddressDetails | null>(null);
    const [selectedAddressId, setSelectedAddressId] = useState<number | null>(
        null,
    );
    const [manageAddress, setManageAddress] = useState(false);

    const [paymentType, setPaymentType] = useState<PaymentType>('cod');
    const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');
    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);

    const [editCustomDeliveryTime, setEditCustomDeliveryTime] = useState(false);
    const [customDeliveryTimeData, setCustomDeliveryTimeData] =
        useState<CustomDeliveryTimeDetails | null>({
            date: new Date().toISOString().split('T')[0],
            time: '10:00',
        });

    useEffect(() => {
        if (!selectedAddressId && addresses && addresses.length > 0) {
            setSelectedAddressId(
                addresses.find((address) => address.isDefault === true)?.id ||
                    null,
            );
        }
    }, []);

    const shippingAddress = useMemo(() => {
        return (
            addresses.find((address) => address.id === selectedAddressId) ||
            null
        );
    }, [addresses, selectedAddressId]);

    const handleDeleteItem = (id: string) => {
        console.log(id);
    };

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
    };

    const handleSelectAddress = (id: number) => {
        setSelectedAddressId(id);
        setManageAddress(false);
    };

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
                            {deliveryTypes.map((t) => (
                                <DeliveryTypeCard
                                    key={t.id}
                                    t={t}
                                    deliveryType={deliveryType}
                                    onClick={(t) => setDeliveryType(t)}
                                    onEdit={handleDeliveryTimeEdit}
                                    timeData={
                                        t.type === 'custom'
                                            ? customDeliveryTimeData
                                            : null
                                    }
                                />
                            ))}
                        </div>
                    </div>
                    {/* package details */}
                    <div className="rounded border border-gray-300 bg-white px-3 pt-2 pb-4 font-semibold shadow">
                        <p className="mb-2 font-bold">Items</p>
                        {checkoutItems.length > 0 ? (
                            <div>
                                {checkoutItems.map((item) => (
                                    <CheckoutItemCard
                                        key={item.id}
                                        item={item}
                                        onDelete={handleDeleteItem}
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
                                            ? 'bg-gray-200 text-sky-900'
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
                                    <span className="text-sm">(10 items)</span>
                                </p>
                                <p>₱100.00</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Shipping Fee</p>
                                <p>₱100.00</p>
                            </div>
                            <div className="my-3 flex gap-x-1.5 text-sm">
                                <input
                                    type="text"
                                    className="flex-1 rounded border bg-white px-2 py-1 focus:ring-1 focus:ring-sky-600 focus:outline-none"
                                    placeholder="Voucher Code"
                                />
                                <button className="rounded bg-sky-900 px-3 py-1 text-white">
                                    Apply
                                </button>
                            </div>
                            <hr className="mt-auto mb-1 border-gray-400" />
                            <div className="mb-2.5 flex justify-between">
                                <p>Total</p>
                                <p className="text-lg font-bold text-orange-700">
                                    ₱200.00
                                </p>
                            </div>

                            <Link
                                href="/"
                                className="block w-full rounded bg-sky-900 p-2 text-center text-white"
                            >
                                Place Order Now
                            </Link>
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
                <SelectAddressModal
                    addresses={addresses}
                    onClose={() => setManageAddress(false)}
                    selected={selectedAddressId || 0}
                    onSelect={handleSelectAddress}
                />
            )}
        </>
    );
};

Checkout.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);
export default Checkout;
