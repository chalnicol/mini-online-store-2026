import { ProductVariant } from '@/types/store';

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

export const formatPrice = (price: string | number) => {
    // 1. Convert to number (handles "150.00" or 150)
    const numericPrice = Number(price);

    // 2. Check if the conversion failed (invalid string)
    if (isNaN(numericPrice)) {
        return '₱0.00';
    }

    return formatter.format(numericPrice);
};

// 1. Calculates what the customer pays for ONE variant
// export const getEffectivePrice = (variant: ProductVariant) => {
//     const basePrice = Number(variant.price);
//     const activeDiscount = variant.discounts?.find((d) => d.isActive);

//     if (!activeDiscount) return basePrice;

//     const discVal = Number(activeDiscount.value);
//     return activeDiscount.type === 'percentage'
//         ? basePrice - basePrice * (discVal / 100)
//         : basePrice - discVal;
// };

export const getEffectivePrice = (variant: ProductVariant) => {
    // Just use the pre-calculated value from Laravel
    return Number(variant.calculatedPrice);
};

// 2. Finds the "Old" price for ONE variant (used for the strikeout)
export const getOriginalPrice = (variant: ProductVariant) => {
    // If you have a 'compare_at' price in DB, use it, otherwise use base price
    return Number(variant.compareAtPrice ?? variant.price);
};

// 3. Processes ALL variants to create the "Range" strings for the UI
export const getPriceDisplay = (variants: ProductVariant[]) => {
    if (!variants?.length)
        return { current: 'No price', original: null, hasDiscount: false };

    const effectivePrices = variants.map((v) => Number(v.calculatedPrice));
    const originalPrices = variants.map((v) => getOriginalPrice(v));

    const minEff = Math.min(...effectivePrices);
    const maxEff = Math.max(...effectivePrices);
    const minOrig = Math.min(...originalPrices);
    const maxOrig = Math.max(...originalPrices);

    // Only show the strikeout if at least ONE variant is actually cheaper than its original
    const hasDiscount = effectivePrices.some(
        (price, i) => price < originalPrices[i],
    );

    const formatRange = (min: number, max: number) =>
        min === max
            ? formatPrice(min)
            : `${formatPrice(min)} - ${formatPrice(max)}`;

    return {
        current: formatRange(minEff, maxEff),
        // Now 'original' will represent the full range of base prices
        original: hasDiscount ? formatRange(minOrig, maxOrig) : null,
        hasDiscount,
    };
};
