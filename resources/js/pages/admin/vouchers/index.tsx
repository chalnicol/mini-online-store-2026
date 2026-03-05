import AdminSearchBar from '@/components/store/admin/AdminSearchBar';
import MenuOptions from '@/components/store/MenuOptions';
import Pagination from '@/components/store/Pagination';
import AdminLayout from '@/layouts/admin/layout';
import { cn } from '@/lib/utils';
import type {
	OptionDetails,
	PaginatedResponse,
	VoucherDetails,
} from '@/types/store';
import { Link, router } from '@inertiajs/react';
import { User2Icon } from 'lucide-react';

interface VoucherListingProps {
	vouchers: PaginatedResponse<VoucherDetails>;
	filters: {
		search: string;
	};
}

const VoucherListing = ({ vouchers, filters }: VoucherListingProps) => {
	const { data: items, meta, links } = vouchers;

	const breadcrumbItems = [{ title: 'Vouchers' }];

	const options: OptionDetails[] = [
		{ label: 'Create New Voucher', value: 'create' },
	];

	const handleOptionsClick = (value: number | string | null) => {
		if (value == 'create') {
			router.visit('/admin/vouchers/create');
		}
	};

	return (
		<>
			{/* <AdminBreadcrumbs items={breadcrumbItems} className="mb-1" /> */}

			<div className="flex items-center justify-between border-b border-gray-400 py-1">
				<h2 className="text-lg font-bold text-gray-900">Vouchers</h2>
				<MenuOptions
					pageOptions={options}
					onOptionsClick={handleOptionsClick}
				/>
			</div>

			<AdminSearchBar table="vouchers" filters={filters} className="my-3" />
			<div>
				{items.length > 0 ? (
					<>
						<div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
							{items.map((item) => (
								<Link
									key={item.id}
									href={`/admin/vouchers/${item.id}`}
									className="flex flex-col overflow-hidden rounded border border-gray-400 shadow hover:shadow-md"
								>
									{/* <p className="flex min-w-10 flex-shrink-0 items-center justify-center rounded bg-gray-300 p-0.5 px-2 text-center text-xs font-bold tracking-widest text-gray-700">
                                        {item.id < 10 ? `0${item.id}` : item.id}
                                    </p> */}
									<div className="flex gap-2 p-2">
										<div className="flex-1">
											<div className="flex items-center gap-x-1.5 text-slate-600">
												<p className="font-bold">{item.code}</p>
											</div>
											<p className="text-xs">{item.description}</p>
										</div>

										<div className="flex flex-none flex-col gap-1">
											<p
												className={cn(
													'aspect-square h-2 rounded-full',
													item.isActive ? 'bg-green-500' : 'bg-rose-600',
												)}
											></p>
										</div>
									</div>
									<div className="mt-auto border-t border-gray-300 bg-gray-100 px-2 py-0.5 text-[10px] font-semibold tracking-widest text-gray-600">
										ID:
										{item.id < 10 ? `0${item.id}` : item.id}
									</div>
								</Link>
							))}
						</div>
						<Pagination meta={meta} type="advanced" />
					</>
				) : (
					<div className="flex flex-col items-center justify-center rounded border border-gray-300 bg-gray-100 py-10 text-center">
						<User2Icon size={64} className="mb-4 text-gray-300" />
						<h2 className="text-2xl font-bold text-gray-800">
							No vouchers found.
						</h2>
						<p className="mb-6 text-gray-500">
							Server may be down. Please try again later.
						</p>
					</div>
				)}
			</div>
		</>
	);
};

VoucherListing.layout = (page: React.ReactNode) => (
	<AdminLayout children={page} />
);

export default VoucherListing;
