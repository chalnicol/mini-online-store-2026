import AdminBreadcrumbs from '@/components/store/admin/AdminBreadcrumbs';
import VoucherForm from '@/components/store/admin/forms/VoucherForm';
import AdminLayout from '@/layouts/admin/layout';
import { BreadcrumbItem, VoucherDetails } from '@/types/store';

const VoucherEdit = ({ voucher }: { voucher: VoucherDetails }) => {
	const breadcrumbItems: BreadcrumbItem[] = [
		{ title: 'Vouchers', href: '/admin/vouchers' },
		{ title: `${voucher.code}`, href: `/admin/vouchers/${voucher.id}` },
		{ title: 'Edit' },
	];

	return (
		<div>
			<AdminBreadcrumbs items={breadcrumbItems} />

			<div className="my-3 flex items-center justify-between border-b border-gray-400 py-1">
				<h2 className="text-lg font-bold text-gray-900">Edit Voucher</h2>
			</div>
			<VoucherForm voucher={voucher} />
		</div>
	);
};

VoucherEdit.layout = (page: React.ReactNode) => <AdminLayout children={page} />;

export default VoucherEdit;
