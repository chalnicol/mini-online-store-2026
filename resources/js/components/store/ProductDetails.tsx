// import { useCart } from '@/contexts/CartContext';
import { useCart } from '@/context/CartContext';
import type { Product, ProductVariant } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, usePage } from '@inertiajs/react';
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
    const { auth } = usePage<{ auth: any }>().props;
    const { addToCart, processing } = useCart();

    const variants = product.variants;
    const isSingleVariant = variants.length === 1;

    // --- State ---
    const [quantity, setQuantity] = useState<number>(1);

    // We'll track selected attributes as an object, e.g., { Size: 'L', Color: 'Blue' }
    const [selectedAttributes, setSelectedAttributes] = useState<
        Record<string, string>
    >(variants[0]?.attributes || {});

    const [showSuccess, setShowSuccess] = useState(false);

    // --- Logic to extract unique attribute keys and values ---
    // This finds all unique keys (e.g., ["Size", "Color"])
    const attributeKeys = useMemo(() => {
        if (!variants.length) return [];
        return Object.keys(variants[0].attributes);
    }, [variants]);

    // Finds the current active variant based on ALL selected attributes
    const activeVariant = useMemo(() => {
        const found = variants.find((v) =>
            Object.entries(selectedAttributes).every(
                ([key, value]) => String(v.attributes[key]) === value,
            ),
        );
        return found || variants[0];
    }, [selectedAttributes, variants]);

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

    useEffect(() => {
        setQuantity(1);
    }, [activeVariant.id]);

    const displayImage =
        activeVariant.imagePath ||
        'https://placehold.co/600x400?text=No+Image+Available';

    // Find if this variant is already in the cart
    // const itemInCart = cartItems.find(
    //     (item) => item.variant.id === activeVariant.id,
    // );
    // const qtyInCart = itemInCart ? itemInCart.quantity : 0;

    // // Calculate remaining available stock
    // const availableToBuy = activeVariant.stockQty - qtyInCart;

    // // Disable button if no more can be added
    // const isMaxedOut = qtyInCart >= activeVariant.stockQty;

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
                    {/* {error && <PromptMessage type="error" message={error} />} */}
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
                            numReviews={product.reviewCount}
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

                                {/* DYNAMIC ATTRIBUTE SELECTORS */}
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
                            onClick={() => {
                                /* logic */
                            }}
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
            {showSuccess && (
                <BaseModal>
                    <div className="mt-3 w-full max-w-md overflow-hidden rounded bg-white shadow-lg">
                        <div className="relative px-4 py-3">
                            {/* Close Button */}
                            <button
                                className="absolute top-2.5 right-3 aspect-square cursor-pointer rounded-full border border-gray-600 bg-gray-500 px-0.5 text-white shadow"
                                onClick={() => setShowSuccess(false)}
                            >
                                <X size={12} />
                            </button>

                            <p className="font-semibold text-gray-600">
                                Item added to cart successfully!
                            </p>

                            {/* Mini Summary (Optional, but nice to show what was added) */}
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
