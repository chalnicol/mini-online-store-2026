import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import ConfirmationModal from '@/components/store/ConfirmationModal';
import CustomButton from '@/components/store/CustomButton';
import MenuOptions from '@/components/store/MenuOptions';
import PromptMessage from '@/components/store/PromptMessage';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import { BreadcrumbItem, Discount, OptionDetails } from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

const DiscountDetails = ({ discount }: { discount: Discount }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

    const variantOptions: OptionDetails[] = [
        { label: 'Edit Discount', value: 'edit' },
        { label: 'Delete Discount', value: 'delete' },
    ];

    const handleOptionsClick = (value: number | string | null) => {
        console.log(value);
        switch (value) {
            case 'edit':
                router.visit(`/admin/discounts/${discount.id}/edit`);
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

    const handleToggleDiscountActiveStatus = (id: number) => {
        //..
        router.patch(
            `/admin/discounts/${id}/toggle-status`,
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
                    //..
                },
                onSuccess: (page: any) => {
                    //..
                },
            },
        );
    };

    const handleConfirmDelete = () => {
        //..
        console.log('Deleting...');
        router.delete(`/admin/discounts/${discount.id}`, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onBefore: () => {
                setError(null);
                setLoading(true);
            },
            onFinish: () => {
                setLoading(false);
                setShowDeleteConfirmation(false);
            },
            onError: (err: any) => {
                //..
                setError(err?.delete || 'Error deleting discount.');
            },
        });
    };

    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Discounts', href: '/admin/discounts' },
        { title: `${discount.code}` },
    ];

    return (
        <>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="mt-4">
                <div className="flex items-center gap-x-2 border-b border-slate-400 pb-1.5 text-gray-900">
                    {/* <p className="flex items-center justify-center rounded border border-slate-300 bg-gray-200 px-2 text-sm font-bold tracking-widest text-gray-700">
                        {discount.id < 10 ? `0${discount.id}` : discount.id}
                    </p> */}
                    <h2 className="font-bold lg:text-lg xl:text-xl">
                        {discount.code}
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
                <div className="my-3 grid grid-cols-1 gap-x-3 gap-y-6 px-3 md:grid-cols-2 lg:grid-cols-3">
                    <AdminDetailCard title="id">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider text-slate-600 uppercase">
                            {discount.id < 10 ? `0${discount.id}` : discount.id}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Type">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider text-slate-600 uppercase">
                            {discount.type == 'fixed' ? 'Fixed' : 'Percentage'}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Value">
                        <p className="text-sm font-semibold tracking-wider text-green-700 uppercase">
                            {discount.type == 'fixed'
                                ? formatPrice(discount.value)
                                : `${discount.value}%`}{' '}
                            OFF
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Description">
                        <p className="text-sm font-semibold tracking-wider text-orange-600 uppercase">
                            {discount.description}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Status" className="">
                        <CustomButton
                            label={
                                discount.isActive ? 'DEACTIVATE' : 'ACTIVATE'
                            }
                            color={discount.isActive ? 'danger' : 'success'}
                            size="xs"
                            onClick={() =>
                                handleToggleDiscountActiveStatus(discount.id)
                            }
                            disabled={loading}
                            loading={loading}
                            className="w-26"
                        />
                    </AdminDetailCard>

                    <AdminDetailCard title="Start Date">
                        <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                            {formatDate(discount.startDate)}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="End Date">
                        <p className="text-sm font-semibold tracking-wider text-slate-500 uppercase">
                            {formatDate(discount.endDate)}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard
                        title="Variants Attached"
                        className="md:col-span-2 lg:col-span-3"
                    >
                        {discount.variants && discount.variants.length > 0 ? (
                            <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {discount.variants.map((variant) => (
                                    <Link
                                        href={`/admin/products/variants/${variant.id}`}
                                        key={variant.id}
                                        className="block overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between px-2 py-1">
                                            <div>
                                                <p className="text-sm font-bold text-gray-600">
                                                    {variant.product?.name ||
                                                        'Product'}
                                                </p>
                                                <p className="text-xs font-semibold text-gray-400">
                                                    {variant.name}
                                                </p>
                                            </div>
                                            <p
                                                className={cn(
                                                    'mt-0.5 aspect-square w-2 rounded-full',
                                                    variant.isActive
                                                        ? 'bg-emerald-500'
                                                        : 'bg-rose-500',
                                                )}
                                            ></p>
                                        </div>
                                        <div className="border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
                                            ID:
                                            {variant.id < 10
                                                ? `0${variant.id}`
                                                : variant.id}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-1">-empty-</p>
                        )}
                    </AdminDetailCard>
                </div>
            </div>

            {showDeleteConfirmation && (
                <ConfirmationModal
                    message="Are you sure you want to delete this discount?"
                    onClose={() => setShowDeleteConfirmation(false)}
                    onConfirm={handleConfirmDelete}
                />
            )}
        </>
    );
};

DiscountDetails.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default DiscountDetails;
