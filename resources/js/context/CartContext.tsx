import { Product, ProductVariant } from '@/types/store';
import { router, usePage } from '@inertiajs/react';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartContextType {
    // cartItems: CartItem[];
    count: number;
    processing: boolean;
    addToCart: (
        variant: ProductVariant,
        product: Product,
        qty: number,
        callback?: () => void,
    ) => void;
    updateQuantity: (id: number, quantity: number) => void;
    removeFromCart: (id: number) => void;
    toggleCheck: (id: number, isChecked: boolean) => void;
    toggleAll: (isChecked: boolean) => void;
    removeSelected: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    // 1. Pull globally shared data from HandleInertiaRequests middleware
    const [processing, setProcessing] = useState(false);

    const { cartCount } = usePage<any>().props;
    const [count, setCount] = useState(0);

    useEffect(() => {
        // This updates your local Context state whenever the server props change
        console.log('Inertia prop updated:', cartCount);
        setCount(cartCount);
    }, [cartCount]);

    // --- Actions ---

    const addToCart = (
        variant: ProductVariant,
        product: Product,
        qty: number,
        callback?: () => void,
    ) => {
        setProcessing(true);
        router.post(
            '/cart',
            {
                variant_id: variant.id,
                quantity: qty,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
                onSuccess: () => {
                    if (callback) callback();
                },
            },
        );
    };

    const updateQuantity = (id: number, quantity: number) => {
        setProcessing(true);
        // Matching Route::patch('/cart/{variant}')
        router.patch(
            `/cart/${id}`,
            {
                quantity: quantity,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const removeFromCart = (id: number) => {
        setProcessing(true);
        // Matching Route::delete('/cart/{variant}')
        router.delete(`/cart/${id}`, {
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    const toggleCheck = (id: number, isChecked: boolean) => {
        setProcessing(true);
        // Matching Route::patch('/cart/{id}/check')
        router.patch(
            `/cart/${id}/check`,
            {
                checked: isChecked,
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const toggleAll = (isChecked: boolean) => {
        setProcessing(true);
        router.patch(
            '/cart/check-all',
            {
                checked: isChecked, // This sends the 'checked' key to the controller
            },
            {
                preserveScroll: true,
                onFinish: () => setProcessing(false),
            },
        );
    };

    const removeSelected = () => {
        setProcessing(true);
        router.delete('/cart/remove-selected', {
            preserveScroll: true,
            preserveState: false, // Force state refresh to clear the UI
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <CartContext.Provider
            value={{
                count,
                processing,
                addToCart,
                updateQuantity,
                removeFromCart,
                toggleCheck,
                toggleAll,
                removeSelected,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within a CartProvider');
    return context;
};
