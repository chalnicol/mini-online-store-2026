import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import ConfirmationModal from '@/components/store/ConfirmationModal';
import CustomButton from '@/components/store/CustomButton';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import PromptMessage from '@/components/store/PromptMessage';
import ReviewCard from '@/components/store/ReviewCard';
import AdminLayout from '@/layouts/admin/layout';
import { getImageUrl } from '@/lib/utils';
import {
    BreadcrumbItem,
    OptionDetails,
    PaginatedResponse,
    ProductVariant,
    Review,
} from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const VariantDetails = ({
    variant,
    reviews,
}: {
    variant: ProductVariant;
    reviews: PaginatedResponse<Review>;
}) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const variantOptions: OptionDetails[] = [
        { label: 'Edit Variant', value: 'edit' },
        { label: 'Delete Variant', value: 'delete' },
    ];

    const { data: reviewList, meta, links } = reviews;

    const handleOptionsClick = (value: number | string | null) => {
        console.log(value);
        switch (value) {
            case 'edit':
                router.visit(`/admin/products/variants/${variant.id}/edit`);
                break;
            case 'delete':
                // router.delete(`/admin/products/variants/${variant.id}`);
                setShowDeleteConfirmation(true);
                break;
            default:
                //..
                break;
        }
    };

    const handleToggleVariantActiveStatus = (variantId: number) => {
        //..
        console.log(variantId);
        router.patch(
            `/admin/products/variants/${variantId}/toggle-active-status`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onBefore: () => {
                    setError(null);
                    setLoading(true);
                },
                onFinish: () => {
                    setLoading(false);
                },
                onError: (err: any) => {
                    setError(err.variant);
                },
                onSuccess: (page: any) => {
                    //..
                },
            },
        );
    };

    const handleConfirmDelete = () => {
        //..
        router.delete(`/admin/products/variants/${variant.id}`);
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/products' },
        {
            title: variant.product
                ? `${variant.product.name || 'Product'}`
                : 'Product',

            href: variant.product
                ? `/admin/products/${variant.product.id}`
                : '/admin/products',
        },
        { title: `${variant.name}` },
    ];

    return (
        <>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="mt-4">
                <div className="flex items-center gap-x-2 border-b border-slate-400 pb-1.5 text-gray-900">
                    <h2 className="font-bold lg:text-lg xl:text-xl">
                        {variant.name}
                    </h2>
                    <MenuOptions
                        pageOptions={variantOptions}
                        onOptionsClick={handleOptionsClick}
                        className="ms-auto flex-shrink-0"
                    />
                </div>

                {error && (
                    <PromptMessage
                        type="error"
                        message={error}
                        className="my-2"
                    />
                )}
                <div className="my-3 grid grid-cols-1 gap-x-3 gap-y-6 overflow-y-auto px-3 md:grid-cols-2 lg:grid-cols-3">
                    <AdminDetailCard title="ID">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider text-slate-600 uppercase">
                            {variant.id < 10 ? `0${variant.id}` : variant.id}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="SKU">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider text-slate-600 uppercase">
                            {variant.sku}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Image">
                        <div className="aspect-[1.5] w-18 overflow-hidden rounded">
                            <img
                                src={getImageUrl(variant.imagePath)}
                                alt={variant.name}
                                className="block h-full w-full object-contain"
                            />
                        </div>
                    </AdminDetailCard>

                    <AdminDetailCard title="stock quantity">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider uppercase">
                            {variant.stockQty}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Calculated Price">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider text-green-700 uppercase">
                            {formatPrice(variant.calculatedPrice)}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Original Price">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider text-red-900 uppercase">
                            {formatPrice(variant.price)}
                        </p>
                    </AdminDetailCard>

                    {Object.entries(variant.attributes).map(
                        ([key, details]) => (
                            <AdminDetailCard key={key} title={key}>
                                <p className="text-slate-00 text-sm font-semibold tracking-wider uppercase">
                                    {details}
                                </p>
                            </AdminDetailCard>
                        ),
                    )}

                    <AdminDetailCard title="Status" className="">
                        <CustomButton
                            label={variant.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
                            color={variant.isActive ? 'danger' : 'success'}
                            size="xs"
                            onClick={() =>
                                handleToggleVariantActiveStatus(variant.id)
                            }
                            disabled={loading}
                            loading={loading}
                            className="w-26"
                        />
                    </AdminDetailCard>

                    <AdminDetailCard title="Discounts">
                        {variant.discounts && variant.discounts.length > 0 ? (
                            <>
                                {variant.discounts.map((discount) => (
                                    <Link
                                        href={`/admin/discounts/${discount.id}`}
                                        key={discount.id}
                                        className="flex gap-1.5"
                                    >
                                        <p className="text-slate-00 space-x-1 rounded border border-gray-300 px-3 text-sm font-semibold tracking-wider uppercase shadow hover:bg-gray-100 hover:shadow-md">
                                            <span>{discount.code}</span>
                                            <span>-</span>
                                            <span>
                                                {discount.type == 'fixed'
                                                    ? formatPrice(
                                                          discount.value,
                                                      )
                                                    : `${discount.value}%`}{' '}
                                                Off
                                            </span>
                                        </p>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <p>--</p>
                        )}
                    </AdminDetailCard>

                    <AdminDetailCard
                        title="Reviews"
                        className="md:col-span-2 lg:col-span-3"
                    >
                        {reviewList.length > 0 ? (
                            <>
                                <div>
                                    {reviewList.map((review) => (
                                        <ReviewCard
                                            key={review.id}
                                            review={review}
                                            size="sm"
                                        />
                                    ))}
                                </div>
                                <Pagination
                                    meta={meta}
                                    className="mt-1"
                                    type="simple"
                                />
                            </>
                        ) : (
                            <p>--</p>
                        )}
                    </AdminDetailCard>
                </div>
            </div>

            {showDeleteConfirmation && (
                <ConfirmationModal
                    message="Are you sure you want to delete this variant?"
                    onClose={() => setShowDeleteConfirmation(false)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    );
};

VariantDetails.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default VariantDetails;
