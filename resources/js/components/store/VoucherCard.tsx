import { VoucherDetails } from '@/types/store';
import { formatDate } from '@/utils/DateUtils';
import { formatPrice } from '@/utils/PriceUtils';
import CustomButton from './CustomButton';

export type VoucherCardMode = 'available' | 'wallet' | 'checkout';

interface VoucherCardProps {
  voucher: VoucherDetails;
  loading?: boolean;
  mode: VoucherCardMode;
  onClaim?: (voucherId: number) => void; // available
  onApply?: (voucherId: number) => void; // checkout
  onRemove?: (voucherId: number) => void; // wallet
}

const VoucherCard = ({ voucher, loading, mode, onClaim, onApply, onRemove }: VoucherCardProps) => {
  //  Border styling — canApply only matters in checkout mode
  const isHighlighted =
    mode === 'checkout'
      ? voucher.canApply
      : mode === 'wallet'
        ? true // wallet vouchers always look active
        : true; // available vouchers always look active

  //  Button config per mode
  const buttonConfig = () => {
    switch (mode) {
      case 'available':
        return {
          label: 'Claim',
          disabled: loading,
          onClick: () => onClaim?.(voucher.id),
          color: voucher.isPersonal ? 'info' : 'primary',
        };
      case 'wallet':
        return {
          label: 'Unclaim', // ✅ same style as Claim
          disabled: loading,
          onClick: () => onRemove?.(voucher.id),
          color: 'danger',
        };
      case 'checkout':
        return {
          label: 'Apply',
          disabled: !voucher.canApply || loading,
          onClick: () => onApply?.(voucher.id),
          color: voucher.isPersonal ? 'info' : 'primary',
        };
    }
  };

  const btn = buttonConfig();

  return (
    <div
      className={`relative flex overflow-hidden rounded-xl border transition-all ${
        isHighlighted ? 'border-sky-200 bg-white shadow-md' : 'border-gray-300 bg-gray-50 opacity-90'
      }`}
    >
      {/* Left Section: Value Block */}
      <div className="flex w-32 flex-col items-center justify-center border-r border-dashed bg-sky-50 px-2 text-center">
        <span className={`text-2xl font-black ${voucher.isPersonal ? 'text-sky-500' : 'text-sky-900'}`}>
          {voucher.type === 'percentage'
            ? `${Math.round(Number(voucher.value))}%`
            : `₱${Math.round(Number(voucher.value))}`}
        </span>
        <span
          className={`text-[10px] font-bold tracking-widest uppercase ${
            voucher.isPersonal ? 'text-sky-500' : 'text-sky-700'
          }`}
        >
          {voucher.type === 'shipping' ? 'SHIPPING' : 'OFF'}
        </span>
        <div className="absolute top-1/2 -left-3 h-6 w-6 -translate-y-1/2 rounded-full border-r border-sky-200 bg-slate-200 shadow-inner" />
      </div>

      {/* Right Section: Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight text-white uppercase ${
                voucher.isPersonal ? 'bg-sky-500' : 'bg-sky-900'
              }`}
            >
              {voucher.isPersonal ? 'Personal Reward' : 'Promo'}
            </span>
            <span className="font-mono text-sm font-bold text-slate-700">{voucher.code}</span>
          </div>
          <p className="text-xs font-semibold text-slate-600">
            {voucher.description || 'Discount on your next purchase'}
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div className="text-[10px] leading-tight text-slate-400">
            <p className="font-medium">Min. Spend: {formatPrice(voucher.minSpend)}</p>
            <p>Valid until: {formatDate(voucher.expiresAt)}</p>

            {/*  Only show amount needed in checkout mode */}
            {mode === 'checkout' && !voucher.canApply && (
              <p className="mt-1 font-bold text-rose-500">Need {formatPrice(voucher.amountNeeded)} more</p>
            )}

            {/*  Show claimed badge in wallet mode */}
            {/* {mode === 'wallet' && <p className="mt-1 font-bold text-green-600">✓ In your wallet</p>} */}
          </div>

          <div className="flex flex-col items-end gap-1">
            {/*  Action button */}
            {btn && (
              <CustomButton
                label={btn.label}
                color={btn.color as 'primary' | 'info'}
                size="xs"
                className="min-w-24 rounded-lg px-3 py-1"
                disabled={btn.disabled}
                onClick={btn.onClick}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Punch Hole */}
      <div className="absolute top-1/2 -right-3 h-6 w-6 -translate-y-1/2 rounded-full border-l border-sky-200 bg-slate-200 shadow-inner" />
    </div>
  );
};

export default VoucherCard;
