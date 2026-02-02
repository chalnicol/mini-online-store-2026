// import { CartContext } from "../contexts/CartContext";
import CartItemCard from '@/components/store/CartItemCard';
import CustomButton from '@/components/store/CustomButton';
import TitleBar from '@/components/store/TitleBar';
import CustomLayout from '@/layouts/app-custom-layout';
import { CartItem } from '@/types/store';
import { Link, router, usePage } from '@inertiajs/react';
import { ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';

interface CartProps {
    products: CartItem[]; // Laravel should only send products that are in the cart
    subtotal: number;
}

const Cart = ({ products, subtotal }: CartProps) => {
    // const { cartItems } = useCart();
    // console.log('ci', cartItems);

    console.log('c', products);

    const { auth } = usePage<{ auth: any }>().props;
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // 1. If user is logged in, the products are already there (from DB).
        // 2. If guest, products are empty on first load.
        if (!auth.user) {
            const localData = JSON.parse(localStorage.getItem('cart') || '[]');

            if (localData.length > 0) {
                // We "ping" the controller with the local data
                router.reload({
                    data: { guestCart: localData },
                    only: ['products'],
                    onBefore: () => setIsLoading(true),
                    onFinish: () => setIsLoading(false),
                });
            }
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500">Updating your cart...</p>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag size={64} className="mb-4 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-800">
                    Your cart is empty
                </h2>
                <p className="mb-6 text-gray-500">
                    Looks like you haven't added anything yet.
                </p>
                <Link
                    href="/"
                    className="rounded-lg bg-sky-900 px-6 py-2 text-white hover:bg-sky-800"
                >
                    Go Shopping
                </Link>
            </div>
        );
    }

    return (
        <>
            <TitleBar title="Shopping Cart" className="mb-4" />

            <div className="flex flex-col gap-6 md:flex-row">
                <div className="flex-1 rounded border border-gray-300 bg-white px-3 py-2 font-semibold shadow">
                    <p className="mb-1 text-lg font-bold">Items</p>
                    <div className="cart-items">
                        {products.map((item) => (
                            <CartItemCard
                                key={item.id}
                                item={item}
                                // Pass any extra props needed
                            />
                        ))}
                    </div>
                </div>
                <div className="w-full flex-none md:w-80">
                    <div className="flex min-h-68 flex-col rounded border border-gray-300 bg-white px-3 py-2 font-semibold shadow">
                        <p className="mb-1 text-lg font-bold">Order Summary</p>

                        <div className="my-2 flex justify-between">
                            <p>
                                Subtotal{' '}
                                <span className="text-sm">
                                    ({products.length} items)
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
                            disabled={true}
                        />

                        {/* <Link
                            href="/checkout"
                            className="block w-full rounded bg-sky-900 p-2 text-center text-white"
                        >
                            Proceed To Checkout
                        </Link> */}
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
