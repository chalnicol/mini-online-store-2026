import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import DiscountForm from '@/components/store/admin/forms/DiscountForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem } from '@/types/store';

const DiscountCreate = () => {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Discounts', href: '/admin/discounts' },
        { title: 'Create' },
    ];

    return (
        <div>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">
                    Create Discount
                </h2>
            </div>
            <DiscountForm />
        </div>
    );
};

DiscountCreate.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default DiscountCreate;
