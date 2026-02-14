import { formRules } from '@/data';
import { cn } from '@/lib/utils';
import type { AddressDetails } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import BaseModal from './BaseModal';
import CheckoutAddressCard from './CheckoutAddressCard';
import CustomButton from './CustomButton';
import PromptMessage from './PromptMessage';
import TextInput from './TextInput';

interface SelectAddressModalProps {
    addresses: AddressDetails[];
    onClose: () => void;
    onSelect: (id: number) => void;
    selected: number;
}
type Tab = 'select' | 'add';

const SelectAddressModal: React.FC<SelectAddressModalProps> = ({
    addresses,
    selected,
    onSelect,
    onClose,
}) => {
    // const [selectedAddress, setSelectedAddress] = useState<number>(selected);
    const [tab, setTab] = useState<Tab>('select');

    const {
        data,
        setData,
        processing,
        post,
        reset,
        clearErrors,
        errors,
        hasErrors,
    } = useForm({
        type: 'Home',
        full_address: '',
        contact_person: '',
        contact_number: '',
        is_default: false,
    });

    const handleSubmitNewAddress = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post('/profile/addresses', {
            // only: ['addresses'],
            preserveScroll: true,
            // preserveState: true,
            onBefore: () => clearErrors(),
            onSuccess: (page) => {
                const { addresses } = page.props as any; // or just page.props.addresses

                if (addresses.length > 0) {
                    // Find the address with the maximum ID

                    const newest = addresses.reduce(
                        (prev: AddressDetails, current: AddressDetails) =>
                            prev.id > current.id ? prev : current,
                    );
                    // console.log('n', newest);
                    reset();
                    onSelect(newest.id);
                    onClose();
                }
            },
        });
    };

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
                            onClick={() => setTab('select')}
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
                            onClick={() => setTab('add')}
                            disabled={tab == 'add'}
                        >
                            New Address
                        </button>
                    </div>

                    {tab == 'select' && (
                        <div>
                            {addresses.length > 0 ? (
                                <ul className="h-[216px] space-y-1.5 overflow-y-auto">
                                    {addresses.map((address) => (
                                        <li
                                            key={address.id}
                                            className={`overflow-hidden rounded border border-gray-400 ${
                                                selected == address.id
                                                    ? 'bg-gray-100'
                                                    : 'cursor-pointer bg-white hover:border-sky-900 hover:bg-gray-50 hover:shadow'
                                            }`}
                                            // onClick={() => setSelectedAddress(address.id)}
                                            onClick={() => onSelect(address.id)}
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
                                <div className="flex min-h-24 items-center justify-center rounded border border-gray-300 bg-gray-100 shadow">
                                    <p className="font-bold text-gray-400">
                                        No address found in your profile.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    {tab == 'add' && (
                        <div>
                            {hasErrors && (
                                <PromptMessage
                                    type="error"
                                    errors={errors}
                                    className="mt-1 mb-3"
                                />
                            )}
                            <form
                                className="space-y-2"
                                onSubmit={handleSubmitNewAddress}
                            >
                                <div className="item-center flex overflow-hidden rounded border border-gray-400 text-sm">
                                    <button
                                        type="button"
                                        className={cn(
                                            'flex-1 py-0.5 font-semibold',
                                            data.type === 'Home'
                                                ? 'bg-gray-300 text-gray-700'
                                                : 'hover:bg-gray-100',
                                        )}
                                        onClick={() => setData('type', 'Home')}
                                    >
                                        Home
                                    </button>
                                    <button
                                        type="button"
                                        className={cn(
                                            'flex-1 border-x border-gray-400 py-0.5 font-semibold',
                                            data.type === 'Office'
                                                ? 'bg-gray-300 text-gray-700'
                                                : 'cursor-pointer hover:bg-gray-100',
                                        )}
                                        onClick={() =>
                                            setData('type', 'Office')
                                        }
                                    >
                                        Office
                                    </button>
                                    <button
                                        type="button"
                                        className={cn(
                                            'flex-1 py-0.5 font-semibold',
                                            data.type === 'Other'
                                                ? 'bg-gray-300 text-gray-700'
                                                : 'cursor-pointer hover:bg-gray-100',
                                        )}
                                        onClick={() => setData('type', 'Other')}
                                    >
                                        Other
                                    </button>
                                </div>
                                <TextInput
                                    type="text"
                                    // label="Full Address"
                                    // className="text-sm"
                                    value={data.full_address}
                                    onChange={(e) =>
                                        setData('full_address', e.target.value)
                                    }
                                    rules={formRules.address}
                                    placeholder="input full address"
                                    required
                                />
                                <TextInput
                                    type="text"
                                    // className="text-sm"
                                    value={data.contact_person}
                                    onChange={(e) =>
                                        setData(
                                            'contact_person',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="input contact person"
                                    rules={formRules.contactPerson}
                                    required
                                />
                                <TextInput
                                    type="text"
                                    // className="text-sm"
                                    value={data.contact_number}
                                    onChange={(e) =>
                                        setData(
                                            'contact_number',
                                            e.target.value,
                                        )
                                    }
                                    rules={formRules.contactNumber}
                                    placeholder="input contact number"
                                    required
                                />

                                <div className="flex items-center gap-x-1">
                                    <input
                                        type="checkbox"
                                        id="is_default"
                                        className="h-4 w-4 accent-sky-900"
                                        checked={data.is_default}
                                        onChange={(e) =>
                                            setData(
                                                'is_default',
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <label
                                        htmlFor="is_default"
                                        className="text-xs"
                                    >
                                        Set as default address
                                    </label>
                                </div>

                                <div className="mt-4 flex items-center gap-x-2">
                                    <CustomButton
                                        type="button"
                                        onClick={onClose}
                                        label="Cancel"
                                        disabled={processing}
                                        color="secondary"
                                    />
                                    <CustomButton
                                        type="submit"
                                        label="Submit"
                                        disabled={processing}
                                        loading={processing}
                                        color="primary"
                                    />
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </BaseModal>
    );
};

export default SelectAddressModal;
