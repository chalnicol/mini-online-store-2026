import VoucherCard from '@/components/store/VoucherCard';
import ProfileLayout from '@/layouts/profile/layout';
import { VoucherDetails } from '@/types/store';
import { router } from '@inertiajs/react';
import { Ticket } from 'lucide-react';
import { useState } from 'react';

type TabType = 'available' | 'wallet';

const VoucherWallet = ({ available, wallet }: { available: VoucherDetails[]; wallet: VoucherDetails[] }) => {
  const tabs: { label: string; value: TabType }[] = [
    { label: 'Available', value: 'available' },
    { label: 'My Wallet', value: 'wallet' },
  ];

  const [currentTab, setCurrentTab] = useState<TabType>('available');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClaim = (id: number) => {
    setLoading(true);
    setError(null);

    router.post(
      `/profile/vouchers/${id}/claim`,
      {},
      {
        preserveScroll: true,
        only: ['available', 'wallet'],
        onError: (errors) => setError(errors.voucher ?? 'Failed to claim voucher.'),
        onFinish: () => setLoading(false),
      },
    );
  };

  const handleRemove = (id: number) => {
    setLoading(true);
    setError(null);

    router.post(
      `/profile/vouchers/${id}/unclaim`,
      {},
      {
        preserveScroll: true,
        only: ['available', 'wallet'],
        onError: (errors) => setError(errors.voucher ?? 'Failed to remove voucher.'),
        onFinish: () => setLoading(false),
      },
    );
  };

  // Reusable empty state
  const EmptyState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Ticket size={64} className="mb-4 text-gray-300" />
      <h2 className="text-2xl font-bold text-gray-800">No vouchers found.</h2>
      <p className="mb-6 text-gray-500">{message}</p>
    </div>
  );

  return (
    <div>
      {/* Tabs */}

      <div className="relative h-8.5 w-full overflow-x-auto overflow-y-hidden">
        <div className="absolute h-full w-full border-b border-gray-400"></div>
        <div className="absolute bottom-0 flex items-center gap-x-1 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className="cursor-pointer rounded-tl rounded-tr-lg border border-gray-400 bg-gray-200 px-3 py-1.5 text-sm transition-colors duration-300 hover:bg-gray-50 disabled:cursor-default disabled:border-b-transparent disabled:bg-gray-50 disabled:font-bold disabled:text-sky-900"
              disabled={tab.value === currentTab}
              onClick={() => setCurrentTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && <p className="mt-2 rounded border-s-4 border-rose-600 bg-red-50 p-2 text-xs text-rose-500">{error}</p>}

      {/* Content */}
      <div className="my-3">
        {currentTab === 'available' &&
          (available.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {available.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  mode="available"
                  onClaim={handleClaim}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="No public vouchers available at the moment. Check back later!" />
          ))}

        {currentTab === 'wallet' &&
          (wallet.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* ✅ Fixed: was rendering 'available' instead of 'wallet' */}
              {wallet.map((voucher) => (
                <VoucherCard
                  key={voucher.id}
                  voucher={voucher}
                  mode="wallet"
                  onRemove={handleRemove}
                  loading={loading}
                />
              ))}
            </div>
          ) : (
            <EmptyState message="You haven't claimed any vouchers yet. Go grab one from Available!" />
          ))}
      </div>
    </div>
  );
};

VoucherWallet.layout = (page: React.ReactNode) => <ProfileLayout>{page}</ProfileLayout>;

export default VoucherWallet;
