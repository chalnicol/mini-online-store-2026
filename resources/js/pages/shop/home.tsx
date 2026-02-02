import ProductCard from '@/components/store/ProductCard';
import SortAndView from '@/components/store/SortAndView';
import { useFilterSearch } from '@/context/FilterSearchContext';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import CustomLayout from '@/layouts/app-custom-layout';
import { PaginatedResponse, Product } from '@/types/store';
import { Head } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

interface HomeProps {
    data: PaginatedResponse<Product>;
}

const Home = ({ data }: HomeProps) => {
    const [items, setItems] = useState<Product[]>(data.data);

    const {
        view,
        isCategoryListOpen,
        showCategoryList,
        loadMore,
        isProcessing,
    } = useFilterSearch();

    const categoriesRef = useRef<HTMLDivElement>(null);

    // Sync items when data props change (from Filter or Load More)
    useEffect(() => {
        // Logic:
        // 1. If it's the first page, we ALWAYS replace the list.
        // 2. If it's page 2+, we append.
        if (data.meta.current_page === 1) {
            setItems(data.data);
        } else {
            setItems((prev: any[]) => {
                // Defensive check: prevent appending if the data is already there
                // This stops duplicates on double-renders or refresh glitches
                const existingIds = new Set(prev.map((item) => item.id));
                const newItems = data.data.filter(
                    (item: any) => !existingIds.has(item.id),
                );

                return [...prev, ...newItems];
            });
        }
    }, [data.data, data.meta.current_page]);

    // Setup the Observer
    // It only triggers if there's a next page and we aren't already loading
    const hasMore = !!data.links.next;
    const loadMoreRef = useIntersectionObserver(
        loadMore,
        hasMore && !isProcessing,
    );

    return (
        <>
            <Head title="Home" />

            {/* <div className="mt-3 flex h-22 items-center justify-center bg-gray-200">
                    <span className="text-4xl font-bold text-gray-400">
                        PROMO GOES HERE
                    </span>
                </div> */}

            <div>
                <SortAndView className="my-3" itemsCount={items.length} />
                {items.length > 0 ? (
                    <>
                        <div
                            className={`flex-1 ${
                                view == 'grid'
                                    ? 'grid gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5'
                                    : 'flex flex-col gap-2'
                            }`}
                        >
                            {items.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product || null}
                                    view={view}
                                />
                            ))}
                        </div>

                        <div
                            ref={loadMoreRef}
                            className="flex h-20 items-center justify-center"
                        >
                            {isProcessing && (
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-500">
                                        Loading more products...
                                    </span>
                                </div>
                            )}

                            {!hasMore && items.length > 0 && (
                                <p className="text-sm font-semibold text-gray-500">
                                    - You've reached the end of the collection -
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="my-3 flex min-h-42 flex-col items-center justify-center gap-y-1 rounded border border-gray-300 bg-gray-100 shadow">
                        <p className="text-xl font-bold text-gray-500 lg:text-2xl">
                            No products found.
                        </p>
                        <p className="text-sm text-gray-400 lg:text-base">
                            Please refine your search and filter options.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
};

Home.layout = (page: React.ReactNode) => (
    <CustomLayout showFilterSearch={true}>{page}</CustomLayout>
);

export default Home;
