import CartItemCard from '@/components/store/CartItemCard';
import ConfirmationModal from '@/components/store/ConfirmationModal';
import CustomButton from '@/components/store/CustomButton';
import TitleBar from '@/components/store/TitleBar';
import { useCart } from '@/context/CartContext';
import CustomLayout from '@/layouts/app-custom-layout';
import { CartItem } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { Book, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

interface CartProps {
    products: CartItem[]; // Inertia resources usually wrap in 'data'
    unavailableProducts: CartItem[];
    subtotal: number;
}

const Cart = ({ products, unavailableProducts, subtotal }: CartProps) => {
    // Extract products from the resource wrapper
    const displayItems = products || [];

    const { processing, removeSelected, removeFromCart, toggleAll } = useCart();
    const [toDeleteId, setToDeleteId] = useState<number | null>(null);

    // Use displayItems (from Laravel) for UI calculations
    const isChecked = displayItems.some((item) => item.isChecked);
    const allChecked =
        displayItems.length > 0 && displayItems.every((item) => item.isChecked);
    const selectedCount = displayItems.filter((item) => item.isChecked).length;

    const [toDeleteSelected, setToDeleteSelected] = useState<boolean>(false);

    if (displayItems.length === 0) {
        return (
            <>
                <TitleBar title="Cart" className="mb-4" />
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
            </>
        );
    }

    const handleClearUnavailable = () => {
        //..
    };

    const handleCloseConfirmation = () => {
        setToDeleteId(null);
        setToDeleteSelected(false);
    };

    const handleConfirmDelete = () => {
        if (toDeleteSelected) {
            removeSelected();
        } else {
            removeFromCart(toDeleteId || 0);
        }
        handleCloseConfirmation();
    };

    const item = displayItems.find((i) => i.id === toDeleteId);

    const toDeleteItem = item
        ? (item.variant.product?.variantsCount || 1) > 1
            ? `${item.variant.product?.name} (${item.variant.name})`
            : item.variant.product?.name || 'No Product Name'
        : '';

    return (
        <>
            <TitleBar title="Shopping Cart" className="mb-4" />

            <div className="flex flex-col gap-y-6 md:flex-row md:gap-x-3 lg:gap-x-5 xl:gap-x-6">
                <div className="flex-1 space-y-3">
                    <div className="rounded border border-gray-300 bg-white px-3 py-2 font-semibold shadow">
                        <p className="mb-1 text-lg font-bold">Items</p>

                        <div className="flex flex-col justify-between gap-2 border-b border-gray-300 py-2 sm:flex-row">
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
                                onClick={() => setToDeleteSelected(true)}
                                // loading={processing}
                                disabled={processing || !selectedCount}
                                label="Remove Selected"
                                className="uppercase"
                            />
                        </div>

                        <div>
                            {displayItems.map((item) => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
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

                <div className="w-full flex-none md:w-80">
                    <div className="flex min-h-60 flex-col rounded border border-gray-300 bg-white px-3 py-2 font-semibold shadow">
                        <p className="mb-1 text-lg font-bold">Order Summary</p>

                        <div className="mt-2 flex flex-grow flex-col space-y-3">
                            <div className="flex justify-between">
                                <p>
                                    Subtotal{' '}
                                    <span className="text-sm">
                                        ({displayItems.length} items)
                                    </span>
                                </p>
                                <p className="font-bold">
                                    {formatPrice(subtotal)}
                                </p>
                            </div>
                            {/* <div className="flex gap-x-1.5">
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
                            </div> */}
                            <div className="flex gap-2 border-y border-gray-400 py-2 text-sky-800">
                                <Book
                                    size={22}
                                    className="mt-1 flex-shrink-0"
                                />
                                <span className="text-sm">
                                    Shipping fee and vouchers applied at
                                    checkout. Free shipping on orders over ₱300!
                                </span>
                            </div>

                            <div className="mt-auto">
                                <div className="flex justify-between py-2">
                                    <p>Total</p>
                                    <p className="text-lg font-bold text-sky-900">
                                        {formatPrice(subtotal)}
                                    </p>
                                </div>

                                <CustomButton
                                    label="Proceed To Checkout"
                                    type="button"
                                    color="primary"
                                    size="lg"
                                    disabled={!isChecked}
                                    onClick={() => router.visit('/checkout')}
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(toDeleteSelected || toDeleteId) && (
                <ConfirmationModal
                    onClose={handleCloseConfirmation}
                    onConfirm={handleConfirmDelete}
                    message={`Are you sure you want to remove ${
                        toDeleteSelected ? 'selected items' : 'this item'
                    } from cart?`}
                    details={toDeleteItem}
                />
            )}
        </>
    );
};

Cart.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);

export default Cart;
