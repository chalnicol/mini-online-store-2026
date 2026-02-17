import type { AddressDetails } from '@/types/store';
import gsap from 'gsap';
import { Check, House } from 'lucide-react';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import AddressForm from './AddressForm';
import BaseModal from './BaseModal';
import CheckoutAddressCard from './CheckoutAddressCard';

interface ShippingAddressSelectModalProps {
    addresses: AddressDetails[];
    onClose: () => void;
    onSelect: (id: number) => void;
    selected: number;
}
type Tab = 'select' | 'add';

const ShippingAddressSelectModal: React.FC<ShippingAddressSelectModalProps> = ({
    addresses,
    selected,
    onSelect,
    onClose,
}) => {
    const contRef = useRef<HTMLDivElement>(null);
    const initRef = useRef<boolean>(false);

    const [tab, setTab] = useState<Tab>(
        addresses.length > 0 ? 'select' : 'add',
    );

    const handleAddSuccess = (props: any) => {
        const { addresses: latest } = props;
        const newest = latest.reduce(
            (prev: AddressDetails, current: AddressDetails) =>
                prev.id > current.id ? prev : current,
        );
        onSelect(newest.id);
        onClose();
    };

    const handleSelectTab = (tab: Tab) => {
        setTab(tab);
        if (!initRef.current) {
            initRef.current = true;
        }
    };

    useEffect(() => {
        if (initRef.current && contRef.current) {
            gsap.fromTo(
                contRef.current,
                {
                    opacity: 0,
                },
                {
                    opacity: 1,
                    ease: 'power4.out',
                    // transformOrigin: 'top',
                    duration: 0.5,
                    delay: 0.1,
                    overwrite: true,
                },
            );
        }
        return () => {
            if (initRef.current && contRef.current) {
                gsap.killTweensOf(contRef.current);
            }
        };
    }, [tab, contRef.current, initRef.current]);

    return (
        <BaseModal size="xl">
            <div className="overflow-hidden rounded bg-white">
                {/* header */}
                <div className="flex items-center justify-between bg-sky-900 px-3 py-2 font-semibold text-white">
                    <p className="">Set Shipping Address</p>
                    <button
                        className="cursor-pointer rounded border px-1.5 text-xs hover:bg-gray-100/10"
                        onClick={onClose}
                    >
                        CLOSE
                    </button>
                </div>
                {/* body */}
                <div className="space-y-4 bg-white p-2 duration-300 md:px-4 md:py-3">
                    <div className="mb-3 space-x-1 border-b border-gray-400">
                        <button
                            className={`min-w-20 rounded-t border border-b-0 px-2 py-1 text-sm font-semibold ${
                                tab == 'select'
                                    ? 'border-sky-800 bg-sky-900 text-white'
                                    : 'cursor-pointer border-gray-400 bg-white hover:bg-gray-100'
                            }`}
                            onClick={() => handleSelectTab('select')}
                            disabled={tab == 'select'}
                        >
                            Select Address
                        </button>
                        <button
                            className={`min-w-20 rounded-t border border-b-0 px-2 py-1 text-sm font-semibold ${
                                tab == 'add'
                                    ? 'border-sky-800 bg-sky-900 text-white'
                                    : 'cursor-pointer border-gray-400 bg-white hover:bg-gray-100'
                            }`}
                            onClick={() => handleSelectTab('add')}
                            disabled={tab == 'add'}
                        >
                            New Address
                        </button>
                    </div>

                    <div ref={contRef}>
                        {tab == 'select' && (
                            <div className="h-[258px] overflow-y-auto">
                                {addresses.length > 0 ? (
                                    <ul className="space-y-1.5">
                                        {addresses.map((address) => (
                                            <li
                                                key={address.id}
                                                className={`overflow-hidden rounded border border-gray-400 ${
                                                    selected == address.id
                                                        ? 'bg-gray-100'
                                                        : 'cursor-pointer bg-white hover:border-sky-900 hover:bg-gray-50 hover:shadow'
                                                }`}
                                                // onClick={() => setSelectedAddress(address.id)}
                                                onClick={() =>
                                                    onSelect(address.id)
                                                }
                                            >
                                                <div className="flex gap-x-3 px-2 py-2">
                                                    <CheckoutAddressCard
                                                        address={address}
                                                        className="flex-1"
                                                    />
                                                    {selected == address.id && (
                                                        <Check size={20} />
                                                    )}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex h-full flex-col items-center justify-center">
                                        <House
                                            size={42}
                                            className="mb-1 text-gray-400"
                                        />
                                        <p className="mb text-lg font-bold text-gray-900">
                                            No address found in your profile.
                                        </p>
                                        <p className="text-gray-600">
                                            Looks like you haven't added any
                                            address yet.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                        {tab == 'add' && (
                            <AddressForm
                                data={null}
                                keys={['addresses']}
                                onCancel={() => onClose()}
                                onSuccess={handleAddSuccess}
                            />
                        )}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export default ShippingAddressSelectModal;
