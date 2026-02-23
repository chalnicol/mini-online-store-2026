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

// 3. Processes ALL variants to create the "Range" strings for the UI
export const getPriceDisplay = (variants: ProductVariant[]) => {
    if (!variants?.length)
        return { current: 'No price', original: null, hasDiscount: false };

    const effectivePrices = variants.map((v) => Number(v.calculatedPrice));
    const originalPrices = variants.map((v) => Number(v.price));

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
