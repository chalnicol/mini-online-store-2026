import React, { useState } from 'react';
// import { useParams } from "react-router-dom";
import CommentCard from '@/components/store/CommentCard';
import ProductCard from '@/components/store/ProductCard';
import Rating from '@/components/store/Rating';

import TitleBar from '@/components/store//TitleBar';
import BreadCrumbs from '@/components/store/BreadCrumbs';
import ProductDetails from '@/components/store/ProductDetails';
import PageLoader from '@/components/store/loaders/PageLoader';
import { useFilterSearch } from '@/context/FilterSearchContext';
import CustomLayout from '@/layouts/app-custom-layout';
import type { Product } from '@/types/store';

interface ProductDetailsPageProps {
    product: Product | null;
    isLoading: boolean;
    error: string | null;
}

const ProductDetailsPage = ({
    product,
    isLoading,
    error,
}: ProductDetailsPageProps) => {
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    const { showCategoryList } = useFilterSearch();

    // 3. CONDITIONAL RETURNS (Only after all hooks are declared)
    if (isLoading) {
        return <PageLoader caption="Loading.." size="lg" />;
    }

    if (error || !product) {
        return (
            <CustomLayout>
                <div className="mx-auto mt-4 flex min-h-44 max-w-2xl flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 px-3 py-2.5 shadow">
                    <h1 className="text-center text-lg font-bold text-gray-500 md:text-xl">
                        Product not found.
                    </h1>
                    <p className="text-sm text-gray-500 md:text-base">
                        Please try again later.
                    </p>
                </div>
            </CustomLayout>
        );
    }

    return (
        <div className="mx-auto max-w-7xl px-4">
            {/* breadcrumb */}
            <BreadCrumbs name={product.name} categoryId={product.categoryId} />

            {/* product details */}
            <ProductDetails product={product} />

            {/* product description and additional details */}
            <div className="mt-4 mb-8">
                <TitleBar title="Product Details" className="mb-2" />
                <div className="min-h-16">
                    <p>{product.description}</p>
                </div>
            </div>

            {/* product reviews */}
            <div className="mt-4 mb-8">
                <TitleBar title="Product Reviews" className="mb-2" />
                {/* rating	 */}
                <div className="mb-3 flex">
                    <div className="flex-none space-y-1 p-2">
                        <p className="font-bold">
                            <span className="text-3xl">
                                {product.averageRating}
                            </span>
                            /5
                        </p>
                        <Rating
                            rating={product.averageRating}
                            size="lg"
                            numReviews={0}
                        />
                    </div>
                </div>
                {/* comments */}
                <div>
                    <CommentCard className="p-2 odd:bg-gray-50" />
                    <CommentCard className="p-2 odd:bg-gray-50" />
                </div>
            </div>

            {/* related products */}
            <div className="mt-4 mb-8">
                <TitleBar title="Related Products" className="mb-2" />
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
                    <p className="min-h-20 py-1">No related products found.</p>
                )}
            </div>
        </div>
    );
};

ProductDetailsPage.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);

export default ProductDetailsPage;
