import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import ProductForm from '@/components/store/admin/forms/ProductForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, Product } from '@/types/store';

interface ProductEditProps {
    product: Product;
}

const ProductEdit = ({ product }: ProductEditProps) => {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Products', href: '/admin/products' },
        { title: `${product.name}`, href: `/admin/products/${product.id}` },
        { title: 'Edit' },
    ];

    return (
        <>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">
                    Edit Product
                </h2>
            </div>

            <ProductForm product={product} />
        </>
    );
};

ProductEdit.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default ProductEdit;
