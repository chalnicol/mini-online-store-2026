import { useCart } from '@/context/CartContext';
import type { Product, ProductVariant } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import BaseModal from './BaseModal';
import CustomButton from './CustomButton';
import FlexDetail from './FlexDetail';
import QuantityControls from './QuantityControls';
import Rating from './Rating';

interface ProductDetailsProps {
    product: Product;
}

const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
    const { url } = usePage();
    const { addToCart, processing } = useCart();

    const variants = product.variants;
    const isSingleVariant = variants.length === 1;

    // --- 1. NEW: Extract Variant ID from URL on Load ---
    const initialVariantId = useMemo(() => {
        const queryParams = new URLSearchParams(url.split('?')[1]);
        return queryParams.get('variant');
    }, []); // Only run once on mount

    // --- 2. ENHANCED: Initialize state with the URL variant if it exists ---
    const [selectedAttributes, setSelectedAttributes] = useState<
        Record<string, string>
    >(() => {
        if (initialVariantId) {
            const found = variants.find(
                (v) => String(v.id) === initialVariantId,
            );
            if (found) return found.attributes;
        }
        return variants[0]?.attributes || {};
    });

    const [quantity, setQuantity] = useState<number>(1);
    const [showSuccess, setShowSuccess] = useState(false);

    // --- 3. LOGIC: Identify active variant based on attributes ---
    const activeVariant = useMemo(() => {
        const found = variants.find((v) =>
            Object.entries(selectedAttributes).every(
                ([key, value]) => String(v.attributes[key]) === value,
            ),
        );
        return found || variants[0];
    }, [selectedAttributes, variants]);

    const attributeKeys = useMemo(() => {
        if (!variants.length) return [];
        return Object.keys(variants[0].attributes);
    }, [variants]);

    // --- 4. NEW: Sync URL with Selection ---
    // This updates the address bar whenever activeVariant changes
    useEffect(() => {
        const currentUrl = new URL(window.location.href);

        // If it's the first variant, keep the URL clean; otherwise, add param
        if (activeVariant.id === variants[0]?.id) {
            currentUrl.searchParams.delete('variant');
        } else {
            currentUrl.searchParams.set('variant', activeVariant.id.toString());
        }

        // replaceState updates the URL without refreshing the page or adding to history stack
        window.history.replaceState({}, '', currentUrl.toString());
    }, [activeVariant.id, variants]);

    // --- Handlers ---
    const handleAttributeChange = (key: string, value: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleThumbnailClick = (variant: ProductVariant) => {
        setSelectedAttributes(variant.attributes);
    };

    const handleAddToCart = async () => {
        addToCart(activeVariant, product, quantity, () => {
            setShowSuccess(true);
        });
    };

    // --- NEW: Buy Now Handler (Direct to Checkout) ---
    const handleBuyNow = () => {
        // We navigate directly to the checkout route with the required query params
        router.visit('/checkout', {
            method: 'get',
            data: {
                source: 'buy_now',
                variant_id: activeVariant.id,
                qty: quantity,
            },
        });
    };

    useEffect(() => {
        setQuantity(1);
    }, [activeVariant.id]);

    const displayImage =
        activeVariant.imagePath ||
        'https://placehold.co/600x400?text=No+Image+Available';

    return (
        <>
            <div className="mt-4 mb-6 flex flex-col gap-x-4 gap-y-4 md:flex-row">
                {/* Image Section */}
                <div className="flex h-64 w-full flex-col md:h-auto md:max-w-xs lg:max-w-sm">
                    <div className="w-full flex-1 overflow-hidden rounded border border-gray-300 bg-gray-100">
                        <img
                            key={activeVariant.id}
                            src={displayImage}
                            alt={activeVariant.name}
                            className="h-full w-full animate-in object-contain duration-700 fade-in"
                        />
                    </div>
                    {!isSingleVariant && (
                        <div className="flex w-full gap-x-1.5 overflow-x-auto px-1 py-2">
                            {variants.map((variant) => (
                                <button
                                    key={variant.id}
                                    className={`aspect-square w-11 flex-none cursor-pointer overflow-hidden rounded border border-gray-300 bg-gray-100 shadow-sm hover:border-gray-400 ${
                                        activeVariant.id === variant.id
                                            ? 'border-sky-900 ring-1 ring-sky-900'
                                            : ''
                                    }`}
                                    onClick={() =>
                                        handleThumbnailClick(variant)
                                    }
                                >
                                    <img
                                        src={
                                            variant.imagePath ||
                                            'https://placehold.co/600x400?text=No+Image+Available'
                                        }
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Details Section */}
                <div className="flex-1 space-y-6">
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold md:text-xl lg:text-2xl xl:text-3xl">
                            {product.name}
                        </h2>
                        <div className="flex items-baseline gap-x-3">
                            <p className="text-2xl font-bold text-red-700">
                                {formatPrice(activeVariant.calculatedPrice)}
                            </p>
                            {activeVariant.calculatedPrice <
                                activeVariant.price && (
                                <p className="font-semibold text-gray-400 line-through">
                                    {formatPrice(activeVariant.price)}
                                </p>
                            )}
                        </div>
                        <Rating
                            rating={product.averageRating}
                            numReviews={product.reviewsCount}
                        />
                    </div>

                    <div className="space-y-3.5">
                        {!isSingleVariant && (
                            <>
                                <FlexDetail label="Selected">
                                    <p className="inline-block rounded border border-gray-400 px-2 text-sm font-bold text-gray-500 shadow">
                                        {activeVariant.name}
                                    </p>
                                </FlexDetail>

                                {attributeKeys.map((key) => {
                                    const options = Array.from(
                                        new Set(
                                            variants.map(
                                                (v) => v.attributes[key],
                                            ),
                                        ),
                                    );
                                    return (
                                        <FlexDetail
                                            label={`Select ${key}`}
                                            key={key}
                                        >
                                            <div className="flex flex-wrap gap-1.5">
                                                {options.map((value) => (
                                                    <button
                                                        key={value}
                                                        className={`rounded border px-2 text-sm font-semibold transition ${
                                                            selectedAttributes[
                                                                key
                                                            ] === value
                                                                ? 'border-sky-900 bg-sky-50 text-sky-900'
                                                                : 'cursor-pointer border-gray-300 shadow hover:border-sky-900'
                                                        }`}
                                                        onClick={() =>
                                                            handleAttributeChange(
                                                                key,
                                                                value,
                                                            )
                                                        }
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>
                                        </FlexDetail>
                                    );
                                })}
                            </>
                        )}

                        <FlexDetail label="Quantity">
                            <div className="space-y-0.5">
                                <QuantityControls
                                    value={quantity}
                                    max={activeVariant.stockQty}
                                    disabled={activeVariant.stockQty === 0}
                                    onChange={setQuantity}
                                />
                                {activeVariant.stockQty === 0 ? (
                                    <span className="text-sm text-rose-500">
                                        Out of stock
                                    </span>
                                ) : (
                                    <span className="text-sm text-sky-900">
                                        {activeVariant.stockQty} available
                                    </span>
                                )}
                            </div>
                        </FlexDetail>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex w-full gap-x-2 md:w-2/3">
                        <CustomButton
                            label="Buy Now"
                            color="danger"
                            size="lg"
                            className="flex-1 font-bold"
                            disabled={
                                activeVariant.stockQty === 0 || processing
                            }
                            onClick={handleBuyNow}
                        />
                        <CustomButton
                            label="Add to Cart"
                            color="primary"
                            size="lg"
                            className="flex-1 font-bold"
                            loading={processing}
                            onClick={handleAddToCart}
                            disabled={
                                activeVariant.stockQty === 0 || processing
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccess && (
                <BaseModal>
                    <div className="mt-3 w-full max-w-md overflow-hidden rounded bg-white shadow-lg">
                        <div className="relative px-4 py-3">
                            <button
                                className="absolute top-2.5 right-3 aspect-square cursor-pointer rounded-full border border-gray-600 bg-gray-500 px-0.5 text-white shadow"
                                onClick={() => setShowSuccess(false)}
                            >
                                <X size={12} />
                            </button>

                            <p className="font-semibold text-gray-600">
                                Item added to cart successfully!
                            </p>

                            <div className="mt-2 flex items-center gap-3 rounded bg-gray-50 p-2 text-sm">
                                <img
                                    src={
                                        activeVariant.imagePath ||
                                        'https://placehold.co/50x50'
                                    }
                                    className="h-10 w-10 rounded object-cover"
                                />
                                <div>
                                    <p className="font-bold text-gray-700">
                                        {product.name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {activeVariant.name}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-col items-center gap-x-2 gap-y-1 md:flex-row">
                                <Link
                                    href="/cart"
                                    className="block w-full flex-1 rounded border border-gray-300 bg-rose-500 px-3 py-2 text-center font-semibold text-white shadow hover:bg-rose-400"
                                >
                                    Go to Cart
                                </Link>
                                <Link
                                    href="/"
                                    className="block w-full flex-1 rounded border border-gray-300 bg-sky-900 px-3 py-2 text-center font-semibold text-white shadow hover:bg-sky-800"
                                >
                                    Shop More
                                </Link>
                            </div>
                        </div>
                    </div>
                </BaseModal>
            )}
        </>
    );
};

export default ProductDetails;
