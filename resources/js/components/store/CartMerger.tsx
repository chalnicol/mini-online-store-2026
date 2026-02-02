// components/CartMerger.tsx (Or inside your main Layout)
import { useCart } from '@/context/CartContext';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

const CartMerger = () => {
    const { auth } = usePage<any>().props;
    const { cartItems, clearCart } = useCart();

    const hasMerged = useRef(false);

    useEffect(() => {
        // If the user just logged in AND we have items in LocalStorage
        if (auth.user && cartItems.length > 0) {
            // Send LocalStorage items to Laravel
            hasMerged.current = true;
            router.post(
                '/cart/merge',
                { items: cartItems as any },
                {
                    onSuccess: () => {
                        // 1. Wipe LocalStorage so we don't merge twice
                        clearCart();

                        // 2. Refresh the page to get the DB version of the cart
                        router.reload({
                            only: ['initialProducts', 'dbCartItems'],
                        });
                    },
                    onError: () => {
                        //
                        hasMerged.current = false;
                    },
                },
            );
        }
    }, [auth.user]);

    return null; // This component doesn't render anything
};

export default CartMerger;
//
