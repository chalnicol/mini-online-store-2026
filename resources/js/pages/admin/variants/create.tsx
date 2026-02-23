import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import ProductVariantForm from '@/components/store/ProductVariantForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem } from '@/types/store';

const VariantCreate = ({
    product,
}: {
    product: {
        id: number;
        name: string;
    };
}) => {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/products' },
        { title: product.name, href: `/admin/products/${product.id}` },
        { title: 'Create Variant' },
    ];

    return (
        <div>
            <AdminBreadcrumbs items={breadcrumbItems} />
            <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">
                    Create Variant
                </h2>
            </div>

            <ProductVariantForm productId={product.id} />
        </div>
    );
};

VariantCreate.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default VariantCreate;
