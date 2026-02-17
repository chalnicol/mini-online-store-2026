import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';
import { CartItem } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link } from '@inertiajs/react';
import debounce from 'lodash/debounce';
import { Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import QuantityControls from './QuantityControls';

interface CartItemProps {
    item: CartItem;
    className?: string;
    onDelete: (id: number | null) => void;
}

const CartItemCard: React.FC<CartItemProps> = ({
    item,
    onDelete,
    className,
}) => {
    const { updateQuantity, toggleCheck, processing } = useCart();

    // Local state for snappy UI response
    const [displayQty, setDisplayQty] = useState(item.quantity);
    // const [toDelete, setToDelete] = useState(false);

    const variant = item.variant;
    const variantsCount = variant.product?.variantsCount || 1;
    const hasDiscount = variant.price > variant.calculatedPrice;

    // Sync local state if server data changes (e.g. from a different component)
    useEffect(() => {
        setDisplayQty(item.quantity);
    }, [item.quantity]);

    // --- NEW LOGIC: Conditional Variant Param ---
    const productUrl = useMemo(() => {
        const baseSlug = `/products/${variant.product?.slug || ''}`;
        // Only append ?variant=ID if the product actually has multiple variants
        return variantsCount > 1
            ? `${baseSlug}?variant=${variant.id}`
            : baseSlug;
    }, [variant.product?.slug, variant.id, variantsCount]);

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

    // useEffect(() => {
    //     if (item.id === toDeleteId && toDeleteRef.current) {
    //         gsap.fromTo(
    //             toDeleteRef.current,
    //             { height: 0, opacity: 0 },
    //             {
    //                 height: 'auto',
    //                 opacity: 1,
    //                 duration: 0.3,
    //                 ease: 'power4.out',
    //                 overwrite: true,
    //             },
    //         );
    //     }
    //     return () => {
    //         if (toDeleteRef.current) {
    //             gsap.killTweensOf(toDeleteRef.current);
    //         }
    //     };
    // }, [item.id, toDeleteId]);

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
            <div className="flex items-start gap-x-3">
                {/* 1. Checkbox */}

                <input
                    type="checkbox"
                    checked={item.isChecked}
                    onChange={() => toggleCheck(item.id, !item.isChecked)}
                    disabled={processing}
                    className="aspect-square w-4 cursor-pointer rounded accent-sky-900 disabled:cursor-not-allowed"
                />

                <div className="grid w-full gap-2 lg:grid-cols-2 lg:gap-x-4">
                    <Link
                        href={productUrl} // Using the memoized URL here
                        className="group flex flex-1 gap-x-2"
                    >
                        <img
                            src={
                                variant.imagePath ||
                                'https://placehold.co/600x400?text=No+Image+Available'
                            }
                            alt={variant.name}
                            className="aspect-square h-14 flex-shrink-0 rounded border object-cover group-hover:border-gray-300 md:h-16"
                        />
                        <div className="flex flex-col">
                            <h3 className="truncate text-sm font-bold text-gray-900 group-hover:underline md:text-base">
                                {item.variant.product?.name ||
                                    'No Product Name'}
                            </h3>
                            {variantsCount > 1 && (
                                <p className="text-xs font-semibold text-gray-400 md:text-sm">
                                    {variant.name}
                                </p>
                            )}
                        </div>
                    </Link>

                    <div className="grid grid-cols-[1fr_1fr_min-content] border-t border-gray-300 pt-2 lg:border-t-0 lg:pt-0">
                        {/* 3. Price */}
                        <div className="flex flex-col">
                            <p className="hidden text-xs font-bold text-gray-400 uppercase lg:block">
                                Price
                            </p>
                            <div className="flex flex-col gap-x-1.5 xl:flex-row xl:items-baseline">
                                <span className="font-bold text-gray-600 xl:text-lg">
                                    {formatPrice(variant.calculatedPrice)}
                                </span>
                                {hasDiscount && (
                                    <span className="text-xs text-rose-800 line-through">
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
                                size="sm"
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
                                'flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:pointer-events-none disabled:cursor-default disabled:opacity-50 lg:self-center',
                            )}
                            disabled={processing}
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
