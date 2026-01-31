import CheckoutItemCard from '@/components/store/CheckoutItemCard';
import CustomDeliveryFormModal from '@/components/store/CustomDeliveryForm';
import DeliveryTypeCard from '@/components/store/DeliveryTypeCard';
import TitleBar from '@/components/store/TitleBar';
import { deliveryTypes, paymentMethods } from '@/data';
import type {
    AddressDetails,
    CheckoutItem,
    CustomDeliveryTimeDetails,
    DeliveryType,
    PaymentType,
} from '@/types/store';
import { Check, Circle } from 'lucide-react';
import { useEffect, useState } from 'react';

//
import SelectAddressModal from '@/components/store/SelectAddressModal';
import CustomLayout from '@/layouts/app-custom-layout';
import { Link } from '@inertiajs/react';

const Checkout = ({ addresses }: { addresses: AddressDetails[] }) => {
    const [shippingAddress, setShippingAddress] =
        useState<AddressDetails | null>(null);
    const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
    const [changeAddress, setChangeAddress] = useState(false);

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
        if (addresses && addresses.length > 0) {
            setShippingAddress(
                addresses.find((address) => address.isDefault === true) || null,
            );
            setSelectedAddress(
                addresses.find((address) => address.isDefault === true)?.id ||
                    null,
            );
        }
    }, [addresses]);

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
        setSelectedAddress(id);
        setChangeAddress(false);
        setShippingAddress(
            addresses.find((address) => address.id === id) || null,
        );
    };

    return (
        <>
            <div className="mx-auto mt-4 w-full max-w-7xl px-4">
                <TitleBar title="Checkout" className="mb-4" />

                <div className="flex flex-col gap-6 lg:flex-row">
                    <div className="flex-1 space-y-6">
                        {/* shipping address */}
                        <div>
                            <TitleBar
                                title="Shipping Address"
                                className="mb-2"
                                size="sm"
                                color="secondary"
                            />
                            <div className="rounded border border-gray-200 bg-gray-100 px-3 py-2 shadow">
                                {shippingAddress ? (
                                    <>
                                        <div className="flex flex-col items-start gap-y-2 sm:flex-row">
                                            <div className="flex-1 space-y-0.5">
                                                <p className="text-sm font-semibold text-gray-500">
                                                    {
                                                        shippingAddress.fullAddress
                                                    }
                                                </p>
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
                                                    <p className="text-sm font-semibold text-sky-900">
                                                        {
                                                            shippingAddress.contactPerson
                                                        }
                                                    </p>
                                                    <p className="bg-gray-300 px-2 text-xs font-semibold text-sky-900">
                                                        {
                                                            shippingAddress.contactNumber
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                className="cursor-pointer rounded bg-sky-900 px-2 text-sm font-semibold text-white hover:bg-sky-800"
                                                onClick={() =>
                                                    setChangeAddress(true)
                                                }
                                            >
                                                Change
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex min-h-22 flex-col items-center justify-center gap-y-1">
                                        <p>No shipping address found.</p>
                                        <Link
                                            href="/profile"
                                            className="mt-1 block cursor-pointer rounded bg-sky-900 px-3 py-1.5 text-sm font-bold text-white hover:bg-sky-800"
                                        >
                                            Add Shipping Address
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* delivery type */}
                        <div>
                            <TitleBar
                                title="Delivery Type"
                                className="mb-2"
                                size="sm"
                                color="secondary"
                            />
                            <div className="mb-4 flex flex-col gap-2 md:flex-row">
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
                        <div>
                            <TitleBar
                                title="Package Details"
                                className="mb-2"
                                size="sm"
                                color="secondary"
                            />
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
                    <div className="w-full flex-none space-y-6 lg:w-72">
                        {/* payment method */}
                        <div>
                            <TitleBar
                                title="Select Payment Method"
                                className="mb-2"
                                size="sm"
                                color="secondary"
                            />
                            <div className="rounded border border-gray-200 bg-gray-100 px-3 py-2 shadow">
                                <div>
                                    {paymentMethods.map((method) => (
                                        <button
                                            key={method.id}
                                            className={`flex w-full items-center gap-x-1.5 border-b border-gray-300 px-2 py-1 font-semibold last:border-b-0 ${
                                                method.type == paymentType
                                                    ? 'bg-gray-200 text-sky-900'
                                                    : 'hover:bg-gray-50'
                                            } " } cursor-pointer`}
                                            onClick={() =>
                                                setPaymentType(method.type)
                                            }
                                            disabled={
                                                method.type == paymentType
                                            }
                                        >
                                            {method.type == paymentType ? (
                                                <Check size={14} />
                                            ) : (
                                                <Circle size={14} />
                                            )}
                                            {method.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* order details */}
                        <div>
                            <TitleBar
                                title="Order Details"
                                className="mb-2"
                                size="sm"
                                color="secondary"
                            />
                            <div className="flex min-h-60 flex-col rounded border border-gray-200 bg-gray-100 px-3 py-2 font-semibold shadow">
                                <div className="mb-1.5 flex justify-between">
                                    <p>
                                        Subtotal{' '}
                                        <span className="text-sm">
                                            (10 items)
                                        </span>
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
                {changeAddress && (
                    <SelectAddressModal
                        addresses={addresses}
                        onClose={() => setChangeAddress(false)}
                        selected={selectedAddress || 0}
                        onSelect={handleSelectAddress}
                    />
                )}
            </div>
        </>
    );
};

Checkout.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);
export default Checkout;
