import { cn } from '@/lib/utils';
import { CheckoutItem } from '@/types/store'; // Using your optimized type!
import { formatPrice } from '@/utils/PriceUtils';
import { Link } from '@inertiajs/react';
import React, { useMemo } from 'react';

interface CheckoutItemCardProps {
    item: CheckoutItem;
    className?: string;
}

const CheckoutItemCard: React.FC<CheckoutItemCardProps> = ({
    item,
    className,
}) => {
    const variant = item.variant;
    const variantsCount = variant.product?.variantsCount || 1;
    const lineTotal = Number(variant.calculatedPrice) * item.quantity;

    const productUrl = useMemo(() => {
        const baseSlug = `/products/${variant.product?.slug || ''}`;
        // Only append ?variant=ID if the product actually has multiple variants
        return variantsCount > 1
            ? `${baseSlug}?variant=${variant.id}`
            : baseSlug;
    }, [variant.product?.slug, variant.id, variantsCount]);

    return (
        <div
            className={cn(
                'grid grid-cols-2 gap-x-2 gap-y-3 border-b border-gray-200 py-2 last:border-0 sm:grid-cols-[1fr_120px_90px] md:grid-cols-[1fr_150px_120px] lg:gap-x-4',
                className,
            )}
        >
            <Link
                href={productUrl}
                className="group col-span-2 block flex gap-x-2 sm:col-span-1"
            >
                {/* 1. Thumbnail */}
                <div className="relative flex-shrink-0">
                    <img
                        src={
                            variant.imagePath ||
                            'https://placehold.co/200x200?text=No+Image'
                        }
                        alt={variant.name}
                        className="aspect-square h-14 rounded border border-gray-200 object-cover group-hover:border-gray-300 md:h-16"
                    />
                </div>

                {/* 2. Product Details & Math */}
                <div className="flex flex-col">
                    <h3 className="truncate text-sm font-bold text-gray-800 group-hover:underline md:text-base">
                        {variant.product?.name || 'Unknown Product'}
                    </h3>
                    {variantsCount > 1 && (
                        <p className="mb-2 text-xs text-gray-500">
                            {variant.name}
                        </p>
                    )}
                </div>
            </Link>

            {/* The "Math" Row */}
            <div className="flex flex-col text-sky-900">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Price * Qty
                </p>
                <p className="text-sm whitespace-nowrap lg:text-base xl:text-lg">
                    <span className="font-bold">
                        {formatPrice(variant.calculatedPrice)}
                    </span>
                    <span className="mx-2 text-gray-400">×</span>
                    <span className="font-bold">{item.quantity}</span>
                </p>
            </div>

            {/* 3. Line Subtotal */}
            <div className="flex flex-none flex-col">
                <p className="mb-1 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Subtotal
                </p>
                <p className="text-sm font-bold whitespace-nowrap text-sky-900 lg:text-base xl:text-lg">
                    {formatPrice(lineTotal)}
                </p>
            </div>
        </div>
    );
};

export default CheckoutItemCard;
