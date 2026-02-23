import React, { useState } from 'react';
// import { useParams } from "react-router-dom";
import ProductCard from '@/components/store/ProductCard';
import Rating from '@/components/store/Rating';

import TitleBar from '@/components/store//TitleBar';
import BreadCrumbs from '@/components/store/BreadCrumbs';
import ProductDetails from '@/components/store/ProductDetails';
import ReviewCard from '@/components/store/ReviewCard';
import CustomLayout from '@/layouts/app-custom-layout';
import type { Product } from '@/types/store';

interface ProductDetailsPageProps {
    product: Product | null;
}

const ProductDetailsPage = ({ product }: ProductDetailsPageProps) => {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    // const { showCategoryList } = useFilterSearch()

    if (!product) {
        return (
            <div className="mx-auto mt-4 flex min-h-44 max-w-2xl flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 px-3 py-2.5 shadow">
                <h1 className="text-center text-lg font-bold text-gray-500 md:text-xl">
                    Product not found.
                </h1>
                <p className="text-sm text-gray-500 md:text-base">
                    Please try again later.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* breadcrumb */}
            <BreadCrumbs name={product.name} categoryId={product.categoryId} />

            {/* product details */}
            <ProductDetails product={product} />

            <div className="mt-8 space-y-12">
                {/* product description */}
                <div>
                    <TitleBar
                        title="Product Description"
                        className="mb-2"
                        size="sm"
                    />
                    <div className="min-h-16 px-2">
                        <p>{product.description}</p>
                    </div>
                </div>

                {/* product reviews */}
                <div>
                    <TitleBar
                        title="Product Reviews"
                        className="mb-2"
                        size="sm"
                    />
                    {/* rating	 */}
                    <div className="mb-3 flex">
                        <div className="flex-none space-y-1 px-2 py-2">
                            <p className="font-bold">
                                <span className="text-3xl">
                                    {product.averageRating}
                                </span>
                                /5
                            </p>
                            <Rating
                                rating={product.averageRating}
                                size="lg"
                                numReviews={product.reviews.length}
                            />
                        </div>
                    </div>
                    {/* comments */}
                    <div>
                        {product.reviews.length > 0 ? (
                            product.reviews.map((review) => (
                                <ReviewCard key={review.id} review={review} />
                            ))
                        ) : (
                            <p>No reviews found.</p>
                        )}
                    </div>
                </div>

                {/* related products */}
                <div>
                    <TitleBar
                        title="Related Products"
                        className="mb-2"
                        size="sm"
                    />
                    {relatedProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5">
                            {relatedProducts.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    view="grid"
                                />
                            ))}
                        </div>
                    ) : (
                        // <div className="flex flex-col items-center justify-center gap-y-2 min-h-42 shadow bg-gray-100 rounded mb-3 border border-gray-300">
                        // 	<p className="text-lg font-semibold text-gray-400">
                        // 		No related products found.
                        // 	</p>
                        // </div>
                        <p className="min-h-20 px-2 py-1">
                            No related products found.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

ProductDetailsPage.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);

export default ProductDetailsPage;
