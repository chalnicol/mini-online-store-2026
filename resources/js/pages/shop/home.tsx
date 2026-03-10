import ProductCard from '@/components/store/ProductCard';
import SortAndView from '@/components/store/SortAndView';
import { useFilterSearch } from '@/context/FilterSearchContext';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';
import CustomLayout from '@/layouts/app-custom-layout';
import { PaginatedResponse, Product } from '@/types/store';
import { Head, router } from '@inertiajs/react';
import { NotebookTabs } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface HomeProps {
  data: PaginatedResponse<Product>;
}

const Home = ({ data }: HomeProps) => {
  const [items, setItems] = useState<Product[]>(data.data);

  const { view, isProcessing } = useFilterSearch();

  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data.meta.current_page === 1) {
      setItems(data.data);
    } else {
      setItems((prev) => {
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = data.data.filter((item) => !existingIds.has(item.id));
        return [...prev, ...newItems];
      });
    }
  }, [data.data, data.meta.current_page]);

  const loadMore = () => {
    const nextUrl = data.links.next;
    if (!nextUrl || isProcessing) return;

    router.get(
      nextUrl,
      {},
      {
        preserveState: true,
        preserveScroll: true,
        only: ['data'],
      },
    );
  };

  const hasMore = !!data.links.next;
  const loadMoreRef = useIntersectionObserver(loadMore, hasMore && !isProcessing);

  return (
    <>
      <Head title="Home" />

      <div>
        <SortAndView className="my-3" itemsCount={items.length} />

        {items.length > 0 ? (
          <>
            <div
              className={`flex-1 ${
                view === 'grid'
                  ? 'grid gap-2 sm:grid-cols-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5'
                  : 'flex flex-col gap-2'
              }`}
            >
              {items.map((product) => (
                <ProductCard key={product.id} product={product} view={view} />
              ))}
            </div>

            <div ref={loadMoreRef} className="flex h-20 items-center justify-center">
              {isProcessing && <p className="text-sm text-gray-500">Loading more products...</p>}
              {!hasMore && items.length > 0 && (
                <p className="text-sm font-semibold text-gray-500">- You've reached the end of the collection -</p>
              )}
            </div>
          </>
        ) : (
          <div className="flex min-h-60 flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-6 text-center">
            <NotebookTabs size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">No products found.</h2>
            <p className="mb-6 text-gray-500">Please refine your search and filter options.</p>
          </div>
        )}
      </div>
    </>
  );
};

Home.layout = (page: React.ReactNode) => <CustomLayout showFilterSearch={true}>{page}</CustomLayout>;

export default Home;
