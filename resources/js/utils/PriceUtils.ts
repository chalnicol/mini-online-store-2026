export const formatPrice = (price: number) => {
	const priceFormat = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "PHP",
		minimumFractionDigits: 2,
	});

	return priceFormat.format(price);
};
