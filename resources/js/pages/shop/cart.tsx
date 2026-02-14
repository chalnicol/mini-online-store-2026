import CartItemCard from '@/components/store/CartItemCard';
import CustomButton from '@/components/store/CustomButton';
import TitleBar from '@/components/store/TitleBar';
import { useCart } from '@/context/CartContext';
import CustomLayout from '@/layouts/app-custom-layout';
import { CartItem } from '@/types/store';
import { Link, router, usePage } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface CartProps {
    products: CartItem[]; // Inertia resources usually wrap in 'data'
    unavailableProducts: CartItem[];
    subtotal: number;
}

const Cart = ({ products, unavailableProducts, subtotal }: CartProps) => {
    // Extract products from the resource wrapper
    const displayItems = products || [];

    const { processing, removeSelected, toggleAll } = useCart();
    const { auth } = usePage<{ auth: any }>().props;

    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    // Use displayItems (from Laravel) for UI calculations
    const isChecked = displayItems.some((item) => item.isChecked);
    const allChecked =
        displayItems.length > 0 && displayItems.every((item) => item.isChecked);
    const selectedCount = displayItems.filter((item) => item.isChecked).length;

    if (displayItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-10 text-center">
                <ShoppingBag size={64} className="mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800">
                    Your cart is empty
                </h2>
                <p className="mb-6 text-gray-500">
                    Looks like you haven't added anything yet.
                </p>
                <Link
                    href="/"
                    className="rounded-lg bg-sky-900 px-6 py-2 font-semibold text-white hover:bg-sky-800"
                >
                    Go Shopping
                </Link>
            </div>
        );
    }

    const handleClearUnavailable = () => {
        //..
    };

    return (
        <>
            <TitleBar title="Shopping Cart" className="mb-4" />

            <div className="flex flex-col gap-y-6 md:flex-row md:gap-x-4 lg:gap-x-5 xl:gap-x-6">
                <div className="flex-1 space-y-3">
                    <div className="rounded border border-gray-300 bg-white px-3 py-2 font-semibold shadow">
                        <p className="mb-1 text-lg font-bold">Items</p>

                        <div className="flex flex-col gap-2 border-b border-gray-300 py-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="select-all"
                                    checked={allChecked}
                                    onChange={(e) =>
                                        toggleAll(e.target.checked)
                                    }
                                    className="h-4 w-4 cursor-pointer rounded accent-sky-900"
                                />
                                <label
                                    htmlFor="select-all"
                                    className="text-sm font-semibold text-gray-500"
                                    title="Select All"
                                >
                                    SELECT ALL{' '}
                                    {selectedCount > 0
                                        ? `(${selectedCount})`
                                        : ''}
                                </label>
                            </div>

                            <CustomButton
                                color="danger"
                                size="xs"
                                onClick={removeSelected}
                                // loading={processing}
                                disabled={processing || !selectedCount}
                                label="DELETE SELECTED"
                            />
                        </div>

                        <div className="cart-items">
                            {displayItems.map((item) => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
                                    toDeleteId={toDeleteId}
                                    onDelete={(id) => setToDeleteId(id)}
                                />
                            ))}
                        </div>
                    </div>
                    {unavailableProducts.length > 0 && (
                        <div className="rounded border border-gray-300 bg-white px-3 py-2 font-semibold shadow">
                            <div className="flex flex-col justify-between sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-lg font-bold">
                                    Currently Unavailable
                                </p>

                                <CustomButton
                                    color="danger"
                                    size="sm"
                                    disabled={processing}
                                    onClick={handleClearUnavailable}
                                    // loading={processing}
                                    label="REMOVE UNAVAILABLE"
                                />
                            </div>
                            <hr className="my-2" />

                            <div className="space-y-2">
                                {unavailableProducts.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between"
                                    >
                                        <Link
                                            href={`/products/${item.variant.product?.slug}`}
                                            className="flex gap-x-2"
                                        >
                                            <img
                                                src={
                                                    item.variant.imagePath ||
                                                    'https://placehold.co/600x400?text=No+Image+Available'
                                                }
                                                alt={item.variant.name}
                                                className="aspect-square h-16 flex-shrink-0 rounded-md border object-cover"
                                            />
                                            <div className="flex flex-col py-1">
                                                <h3 className="line-clamp-1 leading-tight font-bold text-gray-900">
                                                    {item.variant.product
                                                        ?.name ||
                                                        'No Product Name'}
                                                </h3>
                                                <p className="text-sm font-medium text-gray-500">
                                                    {item.variant.name}
                                                </p>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="w-full flex-none md:w-70 lg:w-80">
                    <div className="flex min-h-68 flex-col rounded border border-gray-300 bg-white px-3 py-2 font-semibold shadow">
                        <p className="mb-1 text-lg font-bold">Order Summary</p>

                        <div className="my-2 flex justify-between">
                            <p>
                                Subtotal{' '}
                                <span className="text-sm">
                                    ({displayItems.length} items)
                                </span>
                            </p>
                            <p>₱{subtotal.toLocaleString()}</p>
                        </div>
                        <div className="my-2 flex items-baseline justify-between">
                            <p>Shipping Fee</p>
                            <p className="text-sm text-orange-600">
                                Calculated at Checkout
                            </p>
                        </div>
                        <div className="my-4 flex gap-x-1.5">
                            <input
                                type="text"
                                className="flex-1 rounded border border-gray-400 bg-white px-2 py-1 focus:ring-1 focus:ring-sky-600 focus:outline-none"
                                placeholder="Voucher Code"
                            />
                            <CustomButton
                                label="Apply"
                                type="button"
                                color="primary"
                                disabled={true}
                                className="flex-none"
                            />
                        </div>
                        <hr className="mt-3 border-gray-400 shadow" />
                        <div className="flex justify-between py-2">
                            <p>Total</p>
                            <p className="text-lg text-sky-900">
                                ₱{subtotal.toLocaleString()}
                            </p>
                        </div>

                        <CustomButton
                            label="Proceed To Checkout"
                            type="button"
                            color="primary"
                            size="lg"
                            disabled={!isChecked}
                            onClick={() => router.visit('/checkout')}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

Cart.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);

export default Cart;
