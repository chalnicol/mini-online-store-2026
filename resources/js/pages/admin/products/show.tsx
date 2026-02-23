import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import AdminDetailCard from '@/components/store/admin/AdminDetailCard';
import ConfirmationModal from '@/components/store/ConfirmationModal';
import CustomButton from '@/components/store/CustomButton';
import MenuOptions from '@/components/store/MenuOptions';
import PromptMessage from '@/components/store/PromptMessage';
import Rating from '@/components/store/Rating';
import { useOutsideClick } from '@/hooks/user-outside-click';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import {
    BreadcrumbItem,
    OptionDetails,
    Product,
    ProductVariant,
} from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';

interface ProductDetailsProps {
    product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string> | null>(null);
    const [toViewVariant, setToViewVariant] = useState<ProductVariant | null>(
        null,
    );
    const [toDelete, setToDelete] = useState<Product | null>(null);

    const [showOptions, setShowOptions] = useState(false);
    const [showVariantModal, setShowVariantModal] = useState(false);

    const contRef = useOutsideClick<HTMLDivElement>(() => {
        setShowOptions(false);
    });

    const pageOptions: OptionDetails[] = [
        { label: 'Edit Product', value: 'edit' },
        { label: 'Delete Product', value: 'delete' },
        { label: 'Create Variant', value: 'create-variant' },
    ];
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/products' },
        { title: `${product.name}` },
    ];

    const handleTogglePublish = () => {
        //.
        router.patch(
            `/admin/products/${product.id}/toggle-published-status`,
            {},
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
                onBefore: () => {
                    setErrors(null);
                    setLoading(true);
                },
                onError: (err: any) => {
                    setErrors(err);
                },
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleOptionsClick = (value: number | string | null) => {
        setShowOptions(false);

        switch (value) {
            case 'create-variant':
                //..
                router.visit(`/admin/products/${product.id}/create-variant`);
                break;
            case 'edit':
                router.visit(`/admin/products/${product.id}/edit`);
                break;
            case 'delete':
                setToDelete(product);
                break;

            default:
                console.log('this is');
                break;
        }
    };

    const handleDeleteProduct = () => {
        if (!toDelete) return;
        router.delete(`/admin/products/${toDelete.id}`, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
            onBefore: () => {
                setLoading(true);
                setToDelete(null);
            },
            onFinish: () => {
                setLoading(false);
            },
        });
    };

    return (
        <>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="mt-4">
                <div className="flex items-center gap-x-2 border-b border-slate-400 py-1.5 text-gray-900">
                    <p className="flex items-center justify-center rounded border border-slate-300 bg-gray-200 px-2 text-sm font-bold tracking-widest text-gray-700">
                        {product.id < 10 ? `0${product.id}` : product.id}
                    </p>

                    <p className="font-bold lg:text-lg xl:text-xl">
                        {product.name}
                    </p>

                    <MenuOptions
                        pageOptions={pageOptions}
                        onOptionsClick={handleOptionsClick}
                        className="ms-auto flex-shrink-0"
                    />
                </div>

                {errors && (
                    <PromptMessage
                        type="error"
                        errors={errors}
                        className="my-2"
                    />
                )}

                <div className="mt-3 grid grid-cols-1 gap-x-3 gap-y-6 px-3 md:grid-cols-2 lg:grid-cols-3">
                    <AdminDetailCard title="Category">
                        <p className="text-slate-00 text-sm font-semibold tracking-wider uppercase">
                            {product.category.name}
                        </p>
                    </AdminDetailCard>

                    <AdminDetailCard title="Rating">
                        <Rating
                            rating={product.averageRating}
                            numReviews={product.reviews.length}
                        />
                    </AdminDetailCard>

                    <AdminDetailCard title="Status">
                        <CustomButton
                            label={
                                product.isPublished ? 'UNPUBLISHED' : 'PUBLISH'
                            }
                            color={product.isPublished ? 'danger' : 'success'}
                            size="xs"
                            onClick={handleTogglePublish}
                            disabled={loading}
                            loading={loading}
                            className="w-26"
                        />
                    </AdminDetailCard>

                    <AdminDetailCard
                        title="Description"
                        className="md:col-span-2 lg:col-span-3"
                    >
                        <p className="text-sm font-semibold">
                            {product.description || 'No description'}
                        </p>
                    </AdminDetailCard>

                    {/* variants */}
                    <AdminDetailCard
                        title="Variants"
                        className="md:col-span-2 lg:col-span-3"
                    >
                        {product.variants && product.variants.length > 0 ? (
                            <div className="mb-1 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {product.variants.map((variant) => (
                                    <Link
                                        href={`/admin/products/variants/${variant.id}`}
                                        key={variant.id}
                                        className="flex cursor-pointer items-start gap-x-2 rounded border border-gray-400 px-2 py-1.5 text-gray-600 hover:shadow"
                                    >
                                        <div className="flex gap-x-2">
                                            <p className="flex min-w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 p-0.5 px-2 text-center text-xs font-bold tracking-widest text-gray-700">
                                                {variant.id < 10
                                                    ? `0${variant.id}`
                                                    : variant.id}
                                            </p>
                                            <div className="flex flex-1 flex-col items-start">
                                                <p className="text-sm font-bold">
                                                    {variant.name}
                                                </p>
                                                <p className="space-x-1 text-xs font-semibold text-sky-700">
                                                    <span className="text-green-700">
                                                        {formatPrice(
                                                            variant.calculatedPrice,
                                                        )}
                                                    </span>
                                                    <span>&bull;</span>
                                                    <span className="text-sky-900">
                                                        {variant.stockQty} in
                                                        stock
                                                    </span>
                                                </p>
                                            </div>
                                        </div>
                                        <p
                                            className={cn(
                                                'ms-auto aspect-square w-2 rounded-full',
                                                variant.isActive
                                                    ? 'bg-emerald-500'
                                                    : 'bg-rose-500',
                                            )}
                                        ></p>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm">- empty -</span>
                        )}
                    </AdminDetailCard>
                </div>
            </div>

            {toDelete && (
                <ConfirmationModal
                    message="Are you sure you want to delete this product?"
                    onClose={() => setToDelete(null)}
                    onConfirm={handleDeleteProduct}
                />
            )}
        </>
    );
};

ProductDetails.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default ProductDetails;
