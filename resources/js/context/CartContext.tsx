import type { CartItem, Product, ProductVariant } from '@/types/store';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (variant: ProductVariant, product: any, qty: number) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, qty: number) => void;
    toggleCheck: (id: number) => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load from LocalStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) setCartItems(JSON.parse(savedCart));
    }, []);

    // Save to LocalStorage on change
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (
        variant: ProductVariant,
        product: Product,
        qty: number,
    ) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === variant.id);

            if (existing) {
                return prev.map((item) =>
                    item.id === variant.id
                        ? { ...item, quantity: item.quantity + qty }
                        : item,
                );
            }

            const newItem: CartItem = {
                id: variant.id,
                productId: product.id,
                productName: product.name,
                variantName: variant.name,
                image: variant.image || '', // Still helpful for instant UI
                quantity: qty,
                checked: true,
            };

            return [...prev, newItem];
        });
    };

    const removeFromCart = (id: number) => {
        setCartItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: number, qty: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, qty) } : item,
            ),
        );
    };

    const toggleCheck = (id: number) => {
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, checked: !item.checked } : item,
            ),
        );
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('cart');
    };

    return (
        <CartContext.Provider
            value={{
                clearCart,
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                toggleCheck,
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
