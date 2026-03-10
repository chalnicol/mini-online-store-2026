import { VoucherDetails } from '@/types/store';
import { Loader, Ticket } from 'lucide-react';
import BaseModal from './BaseModal';
import VoucherCard from './VoucherCard';

interface SelectVoucherModalProps {
  vouchers: VoucherDetails[];
  onClose: () => void;
  onSelect: (voucherId: number) => void;
  loading: boolean;
}

const SelectVoucherModal = ({ vouchers, onClose, onSelect, loading }: SelectVoucherModalProps) => {
  return (
    <BaseModal size="lg">
      <div className="flex justify-end">
        <button
          className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>

      <div className="rounded rounded-tr-none border border-gray-400 bg-white px-4 pt-2 pb-4 shadow-lg">
        <h2 className="px-1 text-lg font-bold">Available Vouchers</h2>
        <hr className="mt-2 mb-3 border-gray-300 shadow" />

        <div className="max-h-[60dvh] overflow-y-auto">
          {vouchers.length > 0 ? (
            <div className="space-y-4">
              {vouchers.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  mode="checkout"
                  onApply={() => onSelect(voucher.id)}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-34 w-full flex-col items-center justify-center">
              {loading && loading === true ? (
                <>
                  <Loader size={34} className="animate-spin" />
                  <p>Loading</p>
                </>
              ) : (
                <>
                  <Ticket size={46} className="text-gray-400" />
                  <p className="text-lg font-bold text-gray-700">No vouchers found.</p>
                  <p className="text-sm text-gray-600">Check back later for more rewards.</p>
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
