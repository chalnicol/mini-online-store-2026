import { getImageUrl } from '@/lib/utils';
import type { Product } from '@/types/store';
import { getPriceDisplay } from '@/utils/PriceUtils';
import { Link } from '@inertiajs/react';
import React from 'react';
import Rating from './Rating';

interface ProductCardProps {
    product: Product;
    view: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view }) => {
    const isSingleVariant = product.variants.length === 1;
    // const variantName = product.variants[0].name;

    const displayImage = getImageUrl(product.variants[0]?.imagePath);

    const { current, original, hasDiscount } = getPriceDisplay(
        product.variants,
    );

    return (
        <>
            {view === 'grid' && (
                <div className="mx-auto w-full max-w-sm rounded border border-gray-400 p-2 shadow hover:shadow-md md:max-w-full">
                    <Link
                        href={`/products/${product.slug}`}
                        className="mb-3 flex h-full flex-col space-y-1"
                    >
                        <div className="aspect-[1.5] w-full flex-shrink-0 overflow-hidden rounded bg-gray-200">
                            <img
                                src={displayImage}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="flex flex-grow flex-col gap-y-2">
                            <h3 className="line-clamp-1 flex-shrink-0">
                                {product.name}
                            </h3>

                            {/* Grid Price: One line for single variant, next line for multiple */}
                            <div
                                className={`${
                                    isSingleVariant
                                        ? 'flex items-baseline gap-2'
                                        : 'block'
                                }`}
                            >
                                <p className="font-bold text-orange-700">
                                    {current}
                                </p>
                                {hasDiscount && (
                                    <p
                                        className={`text-gray-500 line-through ${isSingleVariant ? 'text-[12px]' : 'block text-[11px]'}`}
                                    >
                                        {original}
                                    </p>
                                )}
                            </div>

                            <Rating
                                rating={product.averageRating}
                                numReviews={product.reviewsCount}
                                size="sm"
                            />
                        </div>
                    </Link>
                </div>
            )}

            {view === 'list' && (
                <div className="w-full rounded border border-gray-400 p-1.5 shadow hover:shadow-md md:p-2">
                    <Link
                        href={`/products/${product.slug}`}
                        className="flex cursor-pointer space-y-1 gap-x-2"
                    >
                        <div className="block aspect-[1.5] w-14 border bg-gray-100 md:w-20">
                            <img
                                src={displayImage}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="flex-1 space-y-1">
                            <h3 className="font-bold">{product.name}</h3>

                            {/* List Price: Always on one line */}
                            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                                <p className="font-bold text-orange-700">
                                    {current}
                                </p>
                                {hasDiscount && (
                                    <p className="text-xs text-gray-500 line-through">
                                        {original}
                                    </p>
                                )}
                            </div>

                            <Rating
                                rating={product.averageRating}
                                numReviews={product.reviewsCount}
                                size="sm"
                            />
                        </div>
                    </Link>
                </div>
            )}
        </>
    );
};

export default ProductCard;
