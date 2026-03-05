import { VoucherDetails, VoucherType } from '@/types/store';
import { getTomorrowDate, sanitizeDateForInput } from '@/utils/DateUtils';
import { router, useForm } from '@inertiajs/react';
import CustomButton from '../../CustomButton';
import InlineDatePicker from '../../InlineDatePicker';
import PromptMessage from '../../PromptMessage';
import TextInput from '../../TextInput';

const VoucherForm = ({ voucher }: { voucher?: VoucherDetails | null }) => {
	const {
		data,
		setData,
		processing,
		post,
		put,
		errors,
		setError, // Added to set manual validation errors
		hasErrors,
		clearErrors,
	} = useForm({
		code: voucher?.code || '',
		type: voucher?.type || 'fixed',
		value: voucher?.value || 0,
		is_active: voucher?.isActive || false,
		description: voucher?.description || '',
		// Default to Tomorrow if creating
		expires_at: voucher?.expiresAt ? sanitizeDateForInput(voucher.expiresAt) : getTomorrowDate(),
		// Extract IDs from the variants array or default to empty
		min_spend: voucher?.minSpend || 0,
		usage_limit: voucher?.usageLimit || 0,
		// user_ids: voucher?.users ? voucher.users.map((u) => u.id) : [],
		is_personal: voucher?.isPersonal || false,
	});

	const mode = voucher ? 'edit' : 'create';

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		clearErrors();

		//set data.usage_limit == null if no usage limit
		if (mode === 'create') {
			post('/admin/vouchers');
		} else {
			put(`/admin/vouchers/${voucher?.id}`);
		}
	};

	const handleCancel = () => {
		router.visit('/admin/vouchers');
	};

	const voucherTypesOptions: { label: string; value: VoucherType }[] = [
		{ label: 'Fixed', value: 'fixed' },
		{ label: 'Percentage', value: 'percentage' },
		{ label: 'Shipping', value: 'shipping' },
	];

	// const [users, setUsers] = useState<User[]>(voucher?.users || []);

	return (
		<>
			<form onSubmit={handleSubmit}>
				{hasErrors && <PromptMessage type="error" errors={errors} className="my-3" />}

				<div className="grid grid-cols-1 gap-x-6 gap-y-4 lg:grid-cols-[1fr_1fr]">
					<div className="space-y-4">
						{/* type */}
						<div className="space-y-1.5">
							<p className="text-[10px] tracking-widest uppercase">Type</p>
							<div className="grid grid-cols-3 divide-x divide-gray-400 rounded border border-gray-400">
								{voucherTypesOptions.map((option) => (
									<button
										key={option.value}
										type="button"
										className="cursor-pointer bg-gray-200 py-0.5 font-semibold text-gray-600 shadow transition-colors duration-300 first:rounded-s last:rounded-e hover:bg-gray-100 disabled:pointer-events-none disabled:cursor-default disabled:bg-sky-900 disabled:text-white disabled:shadow-none"
										disabled={data.type === option.value}
										onClick={() => setData('type', option.value)}
									>
										{option.label}
									</button>
								))}
							</div>
						</div>

						<TextInput
							label="Code"
							value={data.code}
							onChange={(e) => setData('code', e.target.value)}
							required
						/>
						<TextInput
							label="Value"
							value={data.value}
							onChange={(e) => setData('value', e.target.value)}
							required
						/>
						<TextInput
							label="Min. Spend"
							value={data.min_spend}
							onChange={(e) => setData('min_spend', Number(e.target.value))}
							required
						/>

						<TextInput
							label="Usage Limit"
							value={data.usage_limit}
							onChange={(e) => setData('usage_limit', Number(e.target.value))}
							required
							className="opacity-90 disabled:bg-gray-200"
						/>
					</div>
					<div className="space-y-4">
						{/* Description */}
						<div className="space-y-1.5">
							<p className="text-[10px] tracking-widest uppercase">Description</p>
							<textarea
								value={data.description}
								onChange={(e) => setData('description', e.target.value)}
								className="h-22.5 w-full rounded border border-gray-400 bg-white px-2 py-1 outline-none focus:ring-1 focus:ring-sky-900"
							></textarea>
						</div>

						{/* Start Date */}
						<div className="space-y-1.5">
							<p className="text-[10px] tracking-widest uppercase">Expires At</p>
							<InlineDatePicker
								value={data.expires_at}
								onChange={(date) => setData('expires_at', date)}
								// error={errors.start_date}
							/>
						</div>

						{/* <div className="space-y-1.5">
							<p className="text-[10px] tracking-widest uppercase">Users</p>
							<SelectSearch<User>
								label="Attached Users"
								value={users}
								searchTable="users"
								// itemsMaxCount={1}
								renderSearchItem={(item) => (
									<div className="flex flex-col">
										<p className="text-sm font-bold">
											{item.fname} {item.lname}
										</p>
										<p className="text-xs font-semibold text-slate-400">{item.email}</p>
									</div>
								)}
								renderItem={(item) => (
									<div className="flex flex-col">
										<p className="text-sm font-bold">
											{item.fname} {item.lname}
										</p>
										<p className="text-xs font-semibold text-slate-400">{item.email}</p>
									</div>
								)}
								onChange={(value) => {
									setUsers(value);
									setData(
										'user_ids',
										value.map((u) => u.id),
									);
								}}
							/>
						</div> */}
						<div className="flex items-center gap-x-1.5">
							<input
								type="checkbox"
								id="is_active"
								checked={data.is_active}
								onChange={(e) => setData('is_active', e.target.checked)}
								className="aspect-square w-4 rounded border border-gray-400 px-2 py-1 accent-sky-900 outline-none focus:ring-1 focus:ring-sky-900"
							/>
							<label htmlFor="is_active" className="text-[10px] tracking-widest uppercase">
								Is Active
							</label>
						</div>
						<div className="flex items-center gap-x-1.5">
							<input
								type="checkbox"
								id="is_personal"
								checked={data.is_personal}
								onChange={(e) => setData('is_personal', e.target.checked)}
								className="aspect-square w-4 rounded border border-gray-400 px-2 py-1 accent-sky-900 outline-none focus:ring-1 focus:ring-sky-900"
							/>
							<label htmlFor="is_personal" className="text-[10px] tracking-widest uppercase">
								Is Personal
							</label>
						</div>
					</div>
				</div>

				<div className="mt-8 flex items-center gap-x-2">
					<CustomButton
						type="button"
						label="Cancel"
						color="secondary"
						disabled={processing}
						onClick={handleCancel}
					/>
					<CustomButton
						type="submit"
						label={mode === 'create' ? 'Create' : 'Update'}
						color="primary"
						disabled={processing}
						loading={processing}
					/>
				</div>
			</form>
		</>
	);
};

export default VoucherForm;
