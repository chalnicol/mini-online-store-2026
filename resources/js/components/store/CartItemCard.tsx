import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { CartItem } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link } from '@inertiajs/react';
import gsap from 'gsap';
import debounce from 'lodash/debounce';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import CustomButton from './CustomButton';
import QuantityControls from './QuantityControls';

interface CartItemProps {
    item: CartItem;
    className?: string;
    toDeleteId: number | null;
    onDelete: (id: number | null) => void;
}

const CartItemCard: React.FC<CartItemProps> = ({
    item,
    toDeleteId,
    onDelete,
    className,
}) => {
    const { updateQuantity, removeFromCart, toggleCheck, processing } =
        useCart();

    // Local state for snappy UI response
    const [displayQty, setDisplayQty] = useState(item.quantity);
    // const [toDelete, setToDelete] = useState(false);

    const variant = item.variant;
    const variantsCount = variant.product?.variantsCount || 1;
    const hasDiscount = variant.price > variant.calculatedPrice;

    const toDeleteRef = useRef<HTMLDivElement>(null);

    // Sync local state if server data changes (e.g. from a different component)
    useEffect(() => {
        setDisplayQty(item.quantity);
    }, [item.quantity]);

    /**
     * FIX: Use useMemo for the debounce function.
     * This ensures the debounced function is created ONCE and persists.
     * We pass the ID and Quantity directly when called.
     */
    const debouncedUpdate = useMemo(
        () =>
            debounce((id: number, newQty: number) => {
                updateQuantity(id, newQty);
            }, 500),
        [updateQuantity], // Only recreate if the context function changes
    );

    // Clean up the debounce if the component unmounts
    useEffect(() => {
        return () => debouncedUpdate.cancel();
    }, [debouncedUpdate]);

    useEffect(() => {
        if (item.id === toDeleteId && toDeleteRef.current) {
            gsap.fromTo(
                toDeleteRef.current,
                { height: 0, opacity: 0 },
                {
                    height: 'auto',
                    opacity: 1,
                    duration: 0.3,
                    ease: 'power4.out',
                    overwrite: true,
                },
            );
        }
        return () => {
            if (toDeleteRef.current) {
                gsap.killTweensOf(toDeleteRef.current);
            }
        };
    }, [item.id, toDeleteId]);

    const handleQtyChange = (newQty: number) => {
        if (newQty < 1 || newQty > variant.stockQty) return;

        // 1. Update UI instantly for zero-latency feel
        setDisplayQty(newQty);

        // 2. Schedule the DB sync with the persistent debounce
        debouncedUpdate(item.id, newQty);
    };

    return (
        <div
            className={cn(
                'space-y-2 border-b border-gray-300 py-2 transition-colors last:border-0',
                className,
            )}
        >
            {item.id === toDeleteId && (
                <div ref={toDeleteRef}>
                    <div className="flex flex-col justify-between gap-y-1 overflow-hidden rounded-e border-s-4 border-red-400 bg-rose-50 px-3 py-1.5 sm:flex-row">
                        <p className="text-sm font-semibold text-gray-700">
                            Are you sure you want to remove this item?
                        </p>
                        <div className="flex items-center gap-x-1">
                            <CustomButton
                                label="Yes"
                                size="xs"
                                color="danger"
                                onClick={() => {
                                    removeFromCart(item.id);
                                    onDelete(null);
                                }}
                            />
                            <CustomButton
                                label="No"
                                size="xs"
                                color="secondary"
                                onClick={() => onDelete(null)}
                            />
                        </div>
                    </div>
                </div>
            )}
            <div className="flex items-start gap-3">
                {/* 1. Checkbox */}
                <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => toggleCheck(item.id, !item.isChecked)}
                    disabled={processing}
                    className="mt-2 aspect-square w-4 cursor-pointer rounded accent-sky-900 disabled:cursor-not-allowed"
                />

                <div className="flex flex-1 flex-col gap-4 lg:grid lg:grid-cols-[2fr_1fr_1fr_max-content] lg:items-center">
                    {/* 2. Product Info */}
                    <Link
                        href={`/products/${item.variant.product?.slug || ''}`}
                        className="flex gap-x-2"
                    >
                        <img
                            src={
                                variant.imagePath ||
                                'https://placehold.co/600x400?text=No+Image+Available'
                            }
                            alt={variant.name}
                            className="aspect-square h-14 flex-shrink-0 rounded-md border object-cover"
                        />
                        <div className="flex flex-col py-1">
                            <h3 className="line-clamp-1 leading-tight font-bold text-gray-900">
                                {item.variant.product?.name ||
                                    'No Product Name'}
                            </h3>
                            {/* <p>
                                {variant.id} - {variant.stockQty}{' '}
                            </p> */}
                            {variantsCount > 1 && (
                                <p className="text-sm font-medium text-gray-500">
                                    {variant.name}
                                </p>
                            )}
                        </div>
                    </Link>

                    {/* Responsive Row: Price, Qty, and Actions */}
                    <div className="flex flex-row items-center justify-between gap-2 border-t pt-3 lg:contents lg:border-0 lg:pt-0">
                        {/* 3. Price */}
                        <div className="flex flex-col justify-center">
                            <p className="hidden text-xs font-bold text-gray-400 uppercase lg:block">
                                Price
                            </p>
                            <div className="flex flex-col gap-x-2 lg:flex-row lg:items-baseline">
                                <span className="text-lg font-bold text-gray-900 lg:text-xl">
                                    {formatPrice(variant.calculatedPrice)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs text-gray-400 line-through">
                                        {formatPrice(variant.price)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* 4. Quantity Controls */}
                        <div className="flex flex-col justify-center">
                            <p className="mb-1 hidden text-xs font-bold text-gray-400 uppercase lg:block">
                                Quantity
                            </p>

                            <QuantityControls
                                value={displayQty}
                                max={variant.stockQty}
                                loading={processing}
                                disabled={variant.stockQty === 0}
                                onChange={(e) => handleQtyChange(e)}
                            />
                            <p className="my-1 text-[10px] text-sky-900">
                                {variant.stockQty} available
                            </p>
                        </div>

                        {/* 5. Remove Button */}
                        <button
                            // onClick={() => removeFromCart(item.id)}
                            onClick={() => onDelete(item.id)}
                            className={cn(
                                'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50',
                            )}
                            disabled={processing || item.id === toDeleteId}
                            title="Remove Item"
                        >
                            <Trash2 size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartItemCard;
