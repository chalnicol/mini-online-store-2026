import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import VoucherForm from '@/components/store/admin/forms/VoucherForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem } from '@/types/store';

const VoucherCreate = () => {
    const breadcrumbItems: BreadcrumbItem[] = [
        { title: 'Vouchers', href: '/admin/vouchers' },
        { title: 'Create' },
    ];

    return (
        <div>
            <AdminBreadcrumbs items={breadcrumbItems} />

            <div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
                <h2 className="text-lg font-bold text-gray-900">
                    Create Voucher
                </h2>
            </div>
            <VoucherForm />
        </div>
    );
};

VoucherCreate.layout = (page: React.ReactNode) => (
    <AdminLayout children={page} />
);

export default VoucherCreate;
