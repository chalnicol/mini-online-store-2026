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
            <AdminSearchBar
                table="reviews"
                filters={filters}
                className="my-3 flex-1"
            />

            <div>
                {items.length > 0 ? (
                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {items.map((item) => (
                            <Link
                                key={item.id}
                                href={`/admin/reviews/${item.id}`}
                                className="overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
                            >
                                <div className="flex items-start p-2">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-x-2">
                                            <span className="text-sm font-bold text-gray-600">
                                                {item.user.name}
                                            </span>
                                            <span className="text-xs">
                                                {item.relativeTime}
                                            </span>
                                        </div>
                                        <div className="space-x-1.5 text-xs">
                                            <span>{item.product.name}</span>
                                            <span>&bull;</span>
                                            <span className="text-gray-500">
                                                {item.variant.name}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex items-center gap-x-0.5 tracking-wider uppercase">
                                            <Star
                                                size={12}
                                                className="fill-current text-yellow-400"
                                            />
                                            <p className="text-sm font-semibold">
                                                {item.rating}
                                            </p>
                                        </div>
                                        <p
                                            className={cn(
                                                'aspect-square w-2 rounded-full',
                                                item.isPublished
                                                    ? 'bg-green-600'
                                                    : 'bg-red-400',
                                            )}
                                        ></p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
                                    ID:
                                    {item.id < 10 ? `0${item.id}` : item.id}
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
                        <User2Icon size={64} className="mb-4 text-gray-300" />
                        <h2 className="text-2xl font-bold text-gray-800">
                            No reviews found.
                        </h2>
                        <p className="mb-6 text-gray-500">
                            Server may be down. Please try again later.
                        </p>
                    </div>
                )}
            </div>

            <Pagination meta={meta} type="advanced" />
        </>
    );
};

ReviewListing.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default ReviewListing;
