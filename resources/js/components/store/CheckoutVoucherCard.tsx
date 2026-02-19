import { cn } from '@/lib/utils';
import { VoucherDetails } from '@/types/store';
import { formatPrice } from '@/utils/PriceUtils';
import { X } from 'lucide-react';

interface CheckoutVoucherCardProps {
    voucher: VoucherDetails | null;
    discount: number;
    onRemove: () => void;
    className?: string;
    loading?: boolean;
}

const CheckoutVoucherCard = ({
    voucher: appliedVoucher,
    discount,
    onRemove,
    className,
    loading,
}: CheckoutVoucherCardProps) => {
    return (
        <div
            className={cn(
                'relative space-y-0.5 border bg-gray-50 p-2',
                className,
            )}
        >
            {appliedVoucher ? (
                <>
                    <div className="item-baseline flex flex-col">
                        <p className="text-[10px] tracking-tight uppercase">
                            Code Applied :{' '}
                        </p>
                        <p className="font-bold text-sky-900">
                            {appliedVoucher.code}
                        </p>
                    </div>

                    <div className="flex items-baseline justify-between gap-x-1.5">
                        <p className="text-[10px] tracking-tight uppercase">
                            Discount Amount :{' '}
                        </p>
                        <p
                            className={cn(
                                'font-bold',
                                discount > 0
                                    ? 'text-green-700'
                                    : 'text-gray-400',
                            )}
                        >
                            {discount > 0
                                ? `-${formatPrice(discount)}`
                                : formatPrice(0)}
                        </p>
                    </div>
                    <button
                        title="Remove Voucher"
                        className="absolute top-2 right-2 aspect-square cursor-pointer rounded-full bg-rose-400 px-0.5 hover:bg-rose-500 disabled:pointer-events-none disabled:bg-gray-300 disabled:opacity-50"
                        onClick={onRemove}
                        disabled={loading}
                    >
                        <X size={10} className="fill-current text-white" />
                    </button>
                </>
            ) : (
                <p className="text-xs tracking-widest text-gray-400 uppercase">
                    No Voucher applied.
                </p>
            )}
        </div>
    );
};

export default CheckoutVoucherCard;
