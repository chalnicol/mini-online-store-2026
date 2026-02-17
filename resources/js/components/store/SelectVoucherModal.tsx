import { VoucherDetails } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { Loader, Ticket } from 'lucide-react';
import BaseModal from './BaseModal';
import CustomButton from './CustomButton';

interface SelectVoucherModalProps {
    vouchers: VoucherDetails[];
    onClose: () => void;
    onSelect: (voucherId: number) => void;
    loading: boolean;
}

const SelectVoucherModal = ({
    vouchers,
    onClose,
    onSelect,
    loading,
}: SelectVoucherModalProps) => {
    return (
        <BaseModal size="lg">
            <div className="overflow-hidden rounded bg-white shadow-lg">
                <div className="flex items-center justify-between bg-sky-900 px-3 py-2 text-white">
                    <h2 className="font-bold">Available Vouchers</h2>
                    <button
                        onClick={onClose}
                        className="cursor-pointer rounded border border-white px-1.5 text-xs hover:bg-sky-700/50"
                    >
                        CLOSE
                    </button>
                </div>

                <div className="h-[46vh] overflow-y-auto px-3 py-4">
                    {vouchers.length > 0 ? (
                        <div className="space-y-4">
                            {vouchers.map((voucher) => (
                                <div
                                    key={voucher.id}
                                    className={`relative flex overflow-hidden rounded-xl border transition-all ${
                                        voucher.canApply
                                            ? 'border-sky-200 bg-white shadow-md'
                                            : 'border-gray-300 bg-gray-50 opacity-90'
                                    }`}
                                >
                                    {/* Left Section: Value Block */}
                                    <div
                                        className={`flex w-32 flex-col items-center justify-center border-r border-dashed bg-sky-50 px-2 text-center`}
                                    >
                                        <span
                                            className={`text-2xl font-black ${
                                                voucher.isPersonal
                                                    ? 'text-sky-500'
                                                    : 'text-sky-900'
                                            }`}
                                        >
                                            {voucher.type === 'percentage'
                                                ? `${Math.round(voucher.value)}%`
                                                : `₱${Math.round(voucher.value)}`}
                                        </span>
                                        <span
                                            className={`text-[10px] font-bold tracking-widest uppercase ${
                                                voucher.isPersonal
                                                    ? 'text-sky-500'
                                                    : 'text-sky-700'
                                            }`}
                                        >
                                            OFF
                                        </span>

                                        {/* Punch Holes (Visual Trick - Match these to your Modal background color) */}
                                        <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full border-r border-sky-200 bg-slate-200 shadow-inner" />
                                    </div>

                                    {/* Right Section: Content */}
                                    <div className="flex flex-1 flex-col p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight text-white uppercase ${
                                                            voucher.isPersonal
                                                                ? 'bg-sky-500'
                                                                : 'bg-sky-900'
                                                        }`}
                                                    >
                                                        {voucher.isPersonal
                                                            ? 'Personal Reward'
                                                            : 'Promo'}
                                                    </span>
                                                    <span className="font-mono text-sm font-bold text-slate-700">
                                                        {voucher.code}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-semibold text-slate-600">
                                                    {voucher.description ||
                                                        `Discount on your next purchase`}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-end justify-between">
                                            <div className="text-[10px] leading-tight text-slate-400">
                                                <p className="font-medium">
                                                    Min. Spend:{' '}
                                                    {formatPrice(
                                                        voucher.minSpend,
                                                    )}
                                                </p>
                                                <p>
                                                    Valid until:{' '}
                                                    {voucher.expiresAt}
                                                </p>
                                                {!voucher.canApply && (
                                                    <p className="mt-1 font-bold text-rose-500">
                                                        Need{' '}
                                                        {formatPrice(
                                                            voucher.amountNeeded,
                                                        )}{' '}
                                                        more
                                                    </p>
                                                )}
                                            </div>

                                            <CustomButton
                                                label={
                                                    voucher.isClaimed
                                                        ? 'Apply'
                                                        : 'Claim & Apply'
                                                }
                                                color={
                                                    voucher.isPersonal
                                                        ? 'info'
                                                        : 'primary'
                                                }
                                                size="xs"
                                                className="min-w-24 rounded-lg px-3 py-1"
                                                disabled={
                                                    !voucher.canApply || loading
                                                }
                                                onClick={() =>
                                                    onSelect(voucher.id)
                                                }
                                                // loading={loading}
                                            />
                                        </div>
                                    </div>

                                    {/* Right Side Punch Hole */}
                                    <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full border-l border-sky-200 bg-slate-200 shadow-inner" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center">
                            {loading && loading === true ? (
                                <>
                                    <Loader
                                        size={34}
                                        className="animate-spin"
                                    />
                                    <p>Loading</p>
                                </>
                            ) : (
                                <>
                                    <Ticket
                                        size={46}
                                        className="text-gray-400"
                                    />
                                    <p className="text-lg font-bold text-gray-700">
                                        No vouchers found.
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Check back later for more rewards.
                                    </p>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
};

export default SelectVoucherModal;
