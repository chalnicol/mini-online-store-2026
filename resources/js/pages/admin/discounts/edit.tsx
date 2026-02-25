import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import DiscountForm from '@/components/store/admin/forms/DiscountForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, Discount } from '@/types/store';

const DiscountEdit = ({ discount }: { discount?: Discount | null }) => {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Discounts', href: '/admin/discounts' },
        {
            title: `${discount?.code}`,
            href: `/admin/discounts/${discount?.id}`,
        },
        { title: 'Edit' },
    ];

    return (
        <div>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">
                    Edit Discount
                </h2>
            </div>
            <DiscountForm discount={discount} />
        </div>
    );
};

DiscountEdit.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default DiscountEdit;
