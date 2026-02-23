import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import ProductForm from '@/components/store/ProductForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem } from '@/types/store';

const ProductCreate = () => {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/products' },
        { title: 'Create' },
    ];

    return (
        <div>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">
                    Create Product
                </h2>
            </div>

            <ProductForm />
        </div>
    );
};

ProductCreate.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default ProductCreate;
