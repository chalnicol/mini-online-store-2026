import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import ProductVariantForm from '@/components/store/ProductVariantForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, ProductVariant } from '@/types/store';

const VariantEdit = ({ variant }: { variant: ProductVariant }) => {
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
        {
            title: `${variant.name}`,
            href: `/admin/products/variants/${variant.id}`,
        },
        { title: 'Edit' },
    ];

    return (
        <>
            <AdminBreadcrumbs items={breadcrumbItems} />
            <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">
                    Edit Variant
                </h2>
            </div>

            <ProductVariantForm
                variant={variant}
                productId={variant.product?.id || null}
            />
        </>
    );
};

VariantEdit.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default VariantEdit;
