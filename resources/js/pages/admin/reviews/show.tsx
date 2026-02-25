import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import CustomButton from '@/components/store/CustomButton';
import PromptMessage from '@/components/store/PromptMessage';
import Rating from '@/components/store/Rating';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, Review } from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { router } from '@inertiajs/react';
import { Quote } from 'lucide-react';
import { useState } from 'react';

const ReviewDetails = ({ review }: { review: Review }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Reviews', href: '/admin/reviews' },
        { title: 'Review Details' },
    ];

    const handleTogglePublishedStatus = (id: number) => {
        //..
        router.patch(
            `/admin/reviews/${id}/toggle-published-status`,
            {},
            {
                preserveScroll: true,
                replace: true,
                onBefore: () => {
                    setError(null);
                    setLoading(true);
                },
                onFinish: () => setLoading(false),
            },
        );
    };

    return (
        <>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="mt-4">
                <div className="flex items-center gap-x-2 border-b border-slate-400 pb-1.5 text-gray-900">
                    {/* <p className="flex items-center justify-center rounded border border-slate-300 bg-gray-200 px-2 text-sm font-bold tracking-widest text-gray-700">
                        {review.id < 10 ? `0${review.id}` : review.id}
                    </p> */}
                    <h2 className="font-bold lg:text-lg xl:text-xl">
                        {/* {discount.code} */}
                        Review Details
                    </h2>
                </div>

                {error && (
                    <PromptMessage
                        type="error"
                        message={error}
                        className="my-2"
                    />
                )}
                <div className="my-3 grid grid-cols-1 gap-x-3 gap-y-6 px-3 md:grid-cols-2 lg:grid-cols-3">
                    <AdminDetailCard title="ID">
                        <p className="text-slate-00 text-sm font-semibold tracking-widest">
                            {review.id < 10 ? `0${review.id}` : review.id}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="User">
                        <p className="text-slate-00 text-sm font-semibold">
                            {review.user.name}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Product/Variant">
                        <p className="text-sm font-semibold">
                            {review.product.name} - {review.variant.name}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Rating">
                        <div>
                            <p className="text-lg font-bold">
                                {review.rating}
                                <span className="text-sm">/5</span>
                            </p>
                            <Rating rating={review.rating} size="sm" />
                        </div>
                    </AdminDetailCard>

                    <AdminDetailCard title="Start Date">
                        <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                            {formatDate(review.createdAt)}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="End Date">
                        <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                            {review.updatedAt
                                ? formatDate(review.updatedAt)
                                : '--'}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Published" className="">
                        <CustomButton
                            label={review.isPublished ? 'UNPUBLISH' : 'PUBLISH'}
                            color={review.isPublished ? 'danger' : 'success'}
                            size="xs"
                            onClick={() =>
                                handleTogglePublishedStatus(review.id)
                            }
                            disabled={loading}
                            loading={loading}
                            className="w-26"
                        />
                    </AdminDetailCard>

                    <AdminDetailCard
                        title="Comment"
                        className="md:col-span-2 lg:col-span-3"
                    >
                        <p className="flex items-start gap-x-1 text-sm">
                            <Quote
                                size={10}
                                className="fill-current text-gray-400"
                            />
                            <span>{review.comment}</span>
                        </p>
                    </AdminDetailCard>
                </div>
            </div>
        </>
    );
};

ReviewDetails.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default ReviewDetails;
