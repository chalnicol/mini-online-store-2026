import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import type { PaginatedResponse, Review } from '@/types/store';
import { Link } from '@inertiajs/react';
import { Star, User2Icon } from 'lucide-react';

const ReviewListing = ({
  reviews,
  filters,
}: {
  reviews: PaginatedResponse<Review>;
  filters: {
    search: string;
  };
}) => {
  const { data: items, meta, links } = reviews;

  const breadcrumbItems = [{ title: 'Discounts' }];

  // const productsOptions: OptionDetails[] = [
  //     { label: 'Create New Discount', value: 'create' },
  // ];

  // const handleOptionsClick = (value: number | string | null) => {
  //     if (value == 'create') {
  //         router.visit('/admin/discounts/create');
  //     }
  // };

  return (
    <>
      {/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}

      <div className="flex items-center justify-between border-b border-gray-400 py-1">
        <h2 className="text-lg font-bold text-gray-900">Reviews</h2>
      </div>
      <AdminSearchBar table="reviews" filters={filters} className="my-3 flex-1" />

      <div>
        {items.length > 0 ? (
          <div className="grid gap-2 lg:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                href={`/admin/reviews/${item.id}`}
                className="overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
              >
                <div className="flex items-start gap-2 p-2">
                  <div className="relative flex aspect-square w-8 items-center justify-center">
                    <Star size={30} className="absolute fill-current text-yellow-300" />
                    <p className="absolute text-sm font-bold">{item.rating}</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-600">{item.user.name}</p>
                    <div className="space-x-1.5 text-xs font-semibold text-slate-400">
                      <span>{item.product.name}</span>
                      <span>&bull;</span>
                      <span>{item.variant.name}</span>
                    </div>
                  </div>
                  <p
                    className={cn('aspect-square w-2 rounded-full', item.isPublished ? 'bg-green-600' : 'bg-red-400')}
                  ></p>
                </div>

                <div className="flex justify-between border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
                  <p>
                    ID:
                    {item.id < 10 ? `0${item.id}` : item.id}
                  </p>
                  <p> {item.relativeTime}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
            <User2Icon size={64} className="mb-4 text-gray-300" />
            <h2 className="text-2xl font-bold text-gray-800">No reviews found.</h2>
            <p className="mb-6 text-gray-500">Server may be down. Please try again later.</p>
          </div>
        )}
      </div>

      <Pagination meta={meta} type="advanced" />
    </>
  );
};

ReviewListing.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default ReviewListing;
