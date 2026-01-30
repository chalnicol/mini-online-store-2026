import React from 'react';
// import { Link } from "react-router-dom";
// import { CartContext } from "../contexts/CartContext";
import type { Product, ProductVariant } from '@/types/store';
import { Link } from '@inertiajs/react';
import Rating from './Rating';

interface ProductCardProps {
    product: Product | null;
    view: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, view }) => {
    // const cartContext = useContext(CartContext);
    // if (!cartContext) {
    // 	return null;
    // }
    // // const { addToCart } = cartContext;
    if (!product) {
        return <p>Product not found.</p>;
    }
    // const { id, name, reviews, variants } = product;
    const getPriceRange = (variants: ProductVariant[]) => {
        if (!variants || variants.length === 0) return 'No price available';

        // 1. Extract all prices into an array
        const prices = variants.map((v) => v.price);

        // 2. Find the lowest and highest
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // 3. Format based on your currency (e.g., USD)
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'PHP',
        });

        // 4. If min and max are the same, just return one
        if (minPrice === maxPrice) {
            return formatter.format(minPrice);
        }

        // 5. Otherwise, return the range
        return `${formatter.format(minPrice)} - ${formatter.format(maxPrice)}`;
    };

    const displayPrice = getPriceRange(product.variants);

    const displayImage =
        product.variants[0].image === '' || product.variants[0].image === null
            ? 'https://placehold.co/600x400?text=No+Image+Available'
            : product.variants[0].image;

    return (
        <>
            {view == 'grid' && (
                <div className="mx-auto w-full max-w-sm rounded border border-gray-400 p-2 shadow hover:shadow-md md:max-w-full">
                    <Link
                        href={`/products/${product.slug}`}
                        className="mb-3 block space-y-1"
                    >
                        <div className="aspect-[1.5] w-full bg-gray-100">
                            <img
                                src={displayImage}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        </div>
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="font-bold text-orange-700">
                            {displayPrice}
                        </p>

                        <Rating
                            rating={product.averageRating}
                            numReviews={0}
                            size="sm"
                        />
                    </Link>
                    {/* <button
				className="mt-2 bg-sky-900 font-semibold text-white px-2 py-1 rounded hover:bg-sky-800 cursor-pointer text-sm"
				onClick={() => addToCart(product)}
			>
				Add to Cart
			</button> */}
                </div>
            )}
            {view == 'list' && (
                <div className="w-full rounded border border-gray-400 p-1.5 shadow hover:shadow-md md:p-2">
                    <Link
                        href={`/products/${product.slug}`}
                        className="flex cursor-pointer space-y-1 gap-x-2"
                    >
                        <div className="block aspect-[1.5] h-14 bg-red-100 md:h-20">
                            <img
                                src={displayImage}
                                alt={product.name}
                                className="h-full w-full object-contain"
                            />
                        </div>

                        <div className="flex-1">
                            <h3 className="font-bold">{product.name}</h3>
                            <p className="font-bold text-orange-700">
                                {displayPrice}
                            </p>
                            <Rating
                                rating={product.averageRating}
                                numReviews={0}
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
