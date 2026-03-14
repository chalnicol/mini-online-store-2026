import { type AddressDetails, type ServiceableArea } from '@/types/store';
import { AlertTriangle, Check, House } from 'lucide-react';
import type React from 'react';
import { useRef, useState } from 'react';
import AddressForm from './AddressForm';
import BaseModal from './BaseModal';
import AddressCard from './CheckoutAddressCard';

interface ShippingAddressSelectModalProps {
  addresses: AddressDetails[];
  serviceableAreas: ServiceableArea[];
  selected: number;
  onClose: () => void;
  onSelect: (id: number) => void;
}

type Tab = 'select' | 'add';

const ShippingAddressSelectModal: React.FC<ShippingAddressSelectModalProps> = ({
  addresses,
  serviceableAreas,
  selected,
  onSelect,
  onClose,
}) => {
  const contRef = useRef<HTMLDivElement>(null);
  const initRef = useRef<boolean>(false);

  const [tab, setTab] = useState<Tab>(addresses.length > 0 ? 'select' : 'add');

  const handleAddSuccess = (props: any) => {
    const { addresses: latest } = props;
    const newest = latest.reduce((prev: AddressDetails, current: AddressDetails) =>
      prev.id > current.id ? prev : current,
    );
    onSelect(newest.id);
    onClose();
  };

  const handleSelectTab = (tab: Tab) => {
    setTab(tab);
    if (!initRef.current) initRef.current = true;
  };

  // useEffect(() => {
  //   if (initRef.current && contRef.current) {
  //     gsap.fromTo(
  //       contRef.current,
  //       { scale: 0 },
  //       {
  //         scale: 1,
  //         ease: 'elastic.out(1, 0.8)',
  //         transformOrigin: 'top center',
  //         duration: 0.5,
  //         delay: 0.1,
  //         overwrite: true,
  //       },
  //     );
  //   }
  //   return () => {
  //     if (initRef.current && contRef.current) {
  //       gsap.killTweensOf(contRef.current);
  //     }
  //   };
  // }, [tab]);

  const selectedAddress = addresses.find((a) => a.id === selected);
  const isSelectedNotServiceable = selectedAddress?.serviceableArea && !selectedAddress.serviceableArea.isActive;

  return (
    <BaseModal size="xl">
      <div className="flex justify-end">
        <button
          className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
          onClick={onClose}
        >
          CLOSE
        </button>
      </div>

      <div className="overflow-hidden rounded rounded-tr-none border border-gray-400 bg-white px-4 py-3 shadow-lg">
        <h2 className="px-1 text-lg font-bold">Select Shipping Address</h2>
        <hr className="my-1 border-gray-300 shadow" />

        {/* Not serviceable warning for selected address */}
        {isSelectedNotServiceable && (
          <div className="my-2 flex items-center gap-2 rounded border border-amber-300 bg-amber-50 px-3 py-2">
            <AlertTriangle size={14} className="flex-none text-amber-500" />
            <p className="text-xs text-amber-700">
              Selected address is outside our serviceable area. Please choose a different address.
            </p>
          </div>
        )}

        <div className="my-3 space-x-1 border-b border-gray-400">
          <button
            className={`min-w-20 rounded-t border border-b-0 px-2 py-1 text-sm font-semibold ${
              tab === 'select'
                ? 'border-sky-800 bg-sky-900 text-white'
                : 'cursor-pointer border-gray-400 bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleSelectTab('select')}
            disabled={tab === 'select'}
          >
            Select Address
          </button>
          <button
            className={`min-w-20 rounded-t border border-b-0 px-2 py-1 text-sm font-semibold ${
              tab === 'add'
                ? 'border-sky-800 bg-sky-900 text-white'
                : 'cursor-pointer border-gray-400 bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleSelectTab('add')}
            disabled={tab === 'add'}
          >
            New Address
          </button>
        </div>

        <div ref={contRef}>
          {tab === 'select' && (
            <div className="h-[260px] overflow-y-auto">
              {addresses.length > 0 ? (
                <ul className="space-y-1.5">
                  {addresses.map((address) => {
                    const notServiceable = address.serviceableArea && !address.serviceableArea.isActive;

                    return (
                      <li
                        key={address.id}
                        className={`overflow-hidden rounded border ${
                          selected === address.id
                            ? 'border-sky-300 bg-gray-100'
                            : notServiceable
                              ? 'border-amber-200 bg-amber-50 opacity-70'
                              : 'cursor-pointer border-gray-400 bg-white hover:border-sky-900 hover:bg-gray-50 hover:shadow'
                        }`}
                        onClick={() => {
                          if (!notServiceable) onSelect(address.id);
                        }}
                      >
                        <div className="flex gap-x-3 px-2 py-2">
                          <AddressCard address={address} className="flex-1" />
                          {selected === address.id && <Check size={20} className="text-sky-700" />}
                          {notServiceable && <AlertTriangle size={16} className="text-amber-500" />}
                        </div>
                        {notServiceable && (
                          <p className="border-t border-amber-200 bg-amber-50 px-2 py-1 text-[10px] text-amber-600">
                            Not serviceable — cannot be used for checkout
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="flex h-full flex-col items-center justify-center">
                  <House size={42} className="mb-1 text-gray-400" />
                  <p className="text-lg font-bold text-gray-900">No address found in your profile.</p>
                  <p className="text-gray-600">Looks like you haven't added any address yet.</p>
                </div>
              )}
            </div>
          )}

          {tab === 'add' && (
            <div className="min-h-[260px]">
              <AddressForm
                data={null}
                keys={['addresses']}
                serviceableAreas={serviceableAreas}
                onCancel={onClose}
                onSuccess={handleAddSuccess}
              />
            </div>
          )}
        </div>
      </div>
    </BaseModal>
  );
};

export default ShippingAddressSelectModal;
