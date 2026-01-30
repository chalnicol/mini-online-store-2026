import { useState } from 'react';
// import { CartContext } from "../contexts/CartContext";
import CartItemCard from '@/components/store/CartItemCard';
import TitleBar from '@/components/store/TitleBar';
import CustomLayout from '@/layouts/app-custom-layout';
import type { CartItem } from '@/types/store';
import { Link } from '@inertiajs/react';

const Cart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    return (
        <div className="mx-auto mt-4 w-full max-w-7xl px-4">
            <TitleBar title="Cart" className="mb-4" animated={true} />

            <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1">
                    <TitleBar
                        title="Cart Items"
                        className="mb-2"
                        size="sm"
                        color="secondary"
                    />

                    <div className="cart-items">
                        {cartItems.length === 0 ? (
                            <div className="flex h-60 w-full items-center justify-center rounded border border-gray-200 bg-gray-100 shadow-sm">
                                <div className="flex flex-col items-center space-y-2">
                                    <p className="text-2xl font-bold text-gray-500">
                                        Your cart is empty.
                                    </p>
                                    <Link
                                        href="/"
                                        className="mx-auto w-50 rounded border bg-sky-900 p-1 text-center text-lg font-semibold text-sky-900 text-white hover:bg-sky-800"
                                    >
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <CartItemCard
                                    key={item.id}
                                    item={item}
                                    className="border-b border-gray-300 odd:bg-gray-50"
                                />
                            ))
                        )}
                    </div>
                </div>
                <div className="w-full flex-none md:w-72">
                    <TitleBar
                        title="Order Summary"
                        className="mb-2"
                        size="sm"
                        color="secondary"
                    />
                    <div className="flex min-h-60 flex-col rounded border border-gray-200 bg-gray-100 px-3 py-2 font-semibold shadow-sm">
                        <div className="mb-1.5 flex justify-between">
                            <p>
                                Subtotal{' '}
                                <span className="text-sm">(10 items)</span>
                            </p>
                            <p>₱0.00</p>
                        </div>
                        <div className="flex justify-between">
                            <p>Shipping Fee</p>
                            <p>₱0.00</p>
                        </div>
                        <div className="my-3 flex gap-x-1.5 text-sm">
                            <input
                                type="text"
                                className="flex-1 rounded border bg-white px-2 py-1 focus:ring-1 focus:ring-sky-600 focus:outline-none"
                                placeholder="Voucher Code"
                            />
                            <button className="cursor-pointer rounded bg-sky-900 px-3 py-1 text-white hover:bg-sky-800">
                                Apply
                            </button>
                        </div>
                        <hr className="mt-auto mb-1 border-gray-400" />
                        <div className="mb-2.5 flex justify-between">
                            <p>Total</p>
                            <p className="text-lg text-sky-900">₱0.00</p>
                        </div>

                        <Link
                            href="/checkout"
                            className="block w-full rounded bg-sky-900 p-2 text-center text-white"
                        >
                            Proceed To Checkout
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

Cart.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);

export default Cart;
