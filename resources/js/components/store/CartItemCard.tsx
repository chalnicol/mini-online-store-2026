import { useCart } from '@/context/CartContext';
import { CartItem } from '@/types/store';
import { Link } from '@inertiajs/react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import React from 'react';

interface CartItemProps {
    item: CartItem;
    className?: string;
}

const CartItemCard: React.FC<CartItemProps> = ({ item, className }) => {
    const { updateQuantity, removeFromCart, toggleCheck } = useCart();

    const variant = item.variant;
    const hasDiscount = variant.price > variant.calculatedPrice;

    return (
        <div
            className={`border-b py-2 last:border-0 ${className} ${!item.isChecked ? 'opacity-75' : ''}`}
        >
            <div className="flex items-start gap-3">
                {/* 1. Checkbox */}
                <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => toggleCheck(item.id)}
                    className="mt-2 aspect-square w-4 cursor-pointer rounded accent-rose-500"
                />

                <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-[2fr_1fr_1fr_max-content] lg:items-center">
                    {/* 2. Image & Product Info (Always top/left) */}
                    <Link
                        href={`/products/${item.product.id}`}
                        className="flex gap-x-2"
                    >
                        <img
                            src={
                                variant.imagePath ||
                                'https://placehold.co/600x400?text=No+Image+Available'
                            }
                            alt={variant.name}
                            className="aspect-square h-16 flex-shrink-0 rounded-md border object-cover"
                        />
                        <div className="flex flex-col py-1">
                            <h3 className="leading-tight font-bold text-gray-900">
                                {item.product.name}
                            </h3>
                            <p className="text-sm font-medium text-gray-500">
                                {variant.name}
                            </p>
                            {/* <div className="mt-1 flex flex-wrap gap-1">
                                {Object.entries(variant.attributes || {}).map(
                                    ([key, value]) => (
                                        <span
                                            key={key}
                                            className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] tracking-wider text-gray-600 uppercase"
                                        >
                                            {value}
                                        </span>
                                    ),
                                )}
                            </div> */}
                        </div>
                    </Link>

                    {/* MOBILE ROW: Price, Qty, and Trash on one line together */}
                    <div className="flex flex-row items-center justify-between gap-2 border-t pt-3 lg:contents lg:border-0 lg:pt-0">
                        {/* 3. Price Display */}
                        <div className="flex flex-col justify-center">
                            <p className="hidden text-xs font-bold text-gray-400 uppercase lg:block">
                                Price
                            </p>
                            <div className="flex flex-col gap-x-2 lg:flex-row lg:items-baseline">
                                <span className="text-lg font-bold text-gray-900 lg:text-xl">
                                    $
                                    {Number(variant.calculatedPrice).toFixed(2)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through">
                                        ${Number(variant.price).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 4. Quantity Controls */}
                        <div className="flex flex-col justify-center">
                            <p className="mb-1 hidden text-xs font-bold text-gray-400 uppercase lg:block">
                                Quantity
                            </p>
                            <div className="flex items-center">
                                <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-l border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity - 1,
                                        )
                                    }
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus size={14} />
                                </button>
                                <div className="flex h-8 w-8 items-center justify-center border-y border-gray-300 bg-white text-sm font-medium lg:w-10">
                                    {item.quantity}
                                </div>
                                <button
                                    type="button"
                                    className="flex h-8 w-8 items-center justify-center rounded-r border border-gray-300 bg-white hover:bg-gray-50 disabled:opacity-50"
                                    onClick={() =>
                                        updateQuantity(
                                            item.id,
                                            item.quantity + 1,
                                        )
                                    }
                                    disabled={item.quantity >= variant.stockQty}
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>

                        {/* 5. Remove Button */}
                        <button
                            onClick={() => removeFromCart(item.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                    {/* End Mobile Row */}
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
