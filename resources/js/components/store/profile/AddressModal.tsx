import { ADDRESS_TYPES, AddressDetailsType, formRules } from '@/data';
import { type AddressDetails, type AddressPayload } from '@/types/store';

import { useForm } from '@inertiajs/react';
import { Check, Circle } from 'lucide-react';
import BaseModal from '../BaseModal';
import CheckButton from '../CheckButton';
import CustomButton from '../CustomButton';
import PromptMessage from '../PromptMessage';
import TextInput from '../TextInput';

interface AddressModalProps {
    data: AddressDetails | null;
    onClose: (success: string | null) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ data, onClose }) => {
    const {
        data: form,
        setData,
        processing,
        errors,
        hasErrors,
        clearErrors,
        reset,
        post,
        patch,
    } = useForm<AddressPayload>({
        full_address: data?.fullAddress || '',
        contact_number: data?.contactNumber || '',
        contact_person: data?.contactPerson || '',
        type: data?.type || 'Home',
        is_default: data?.isDefault || false,
    });

    const mode = data ? 'edit' : 'add';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mode === 'add') {
            post('/profile/addresses', {
                onBefore: () => {
                    clearErrors();
                },
                onSuccess: () => {
                    onClose('Address added successfully');
                },
            });
            //..
        } else {
            patch(`/profile/addresses/${data?.id}`, {
                onBefore: () => {
                    clearErrors();
                },
                onSuccess: () => {
                    onClose('Address updated successfully');
                },
            });
        }
    };

    const handleSelectAddressType = (type: AddressDetailsType) => {
        setData('type', type);
    };

    const toggleDefault = () => {
        setData('is_default', !form.is_default);
    };

    const handleFormChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setData(name as keyof AddressPayload, value as string);
    };

    return (
        <BaseModal size="lg">
            <div className="overflow-hidden rounded bg-white px-4 py-3 shadow-lg">
                <p className="font-bold text-gray-600">
                    {!data ? 'Add New Address' : 'Edit Address'}
                </p>
                <hr className="mt-1 mb-3 border-gray-400" />

                {hasErrors && (
                    <PromptMessage
                        type="error"
                        // message={error.message}
                        errors={errors}
                        className="mt-1 mb-3"
                    />
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-2.5 rounded-b bg-white"
                >
                    <div className="">
                        <div className="grid grid-cols-3 text-sm">
                            {ADDRESS_TYPES.map((type, index) => {
                                const isActive = form.type === type;
                                const isFirst = index === 0;
                                const isLast =
                                    index === ADDRESS_TYPES.length - 1;

                                return (
                                    <button
                                        key={type}
                                        className={`flex items-center justify-center gap-x-1 border border-gray-400 px-3 py-0.5 font-semibold ${isFirst ? 'rounded-l-full' : ''} ${isLast ? 'rounded-r-full' : ''} ${!isLast ? 'border-e-0' : ''} ${
                                            isActive
                                                ? 'bg-sky-900 text-white'
                                                : 'cursor-pointer bg-gray-200 shadow hover:bg-gray-100'
                                        }`}
                                        onClick={() =>
                                            handleSelectAddressType(type)
                                        }
                                        disabled={isActive}
                                    >
                                        {isActive ? (
                                            <Check size={14} />
                                        ) : (
                                            <Circle size={14} />
                                        )}
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <TextInput
                        type="text"
                        // label="Contact Person"
                        name="contact_person"
                        value={form.contact_person}
                        onChange={handleFormChange}
                        placeholder="contact person"
                        required={true}
                        rules={formRules.contactPerson}
                    />
                    <TextInput
                        type="text"
                        // label="Contact Number"
                        name="contact_number"
                        value={form.contact_number}
                        onChange={handleFormChange}
                        placeholder="contact number"
                        required={true}
                        rules={formRules.contactNumber}
                    />
                    <textarea
                        value={form.full_address}
                        name="full_address"
                        placeholder="full address"
                        onChange={handleFormChange}
                        required={true}
                        className="block w-full rounded border border-gray-500 bg-white px-2 py-1 focus:ring-1 focus:ring-sky-900 focus:outline-none"
                    ></textarea>

                    <CheckButton
                        label="Set as Default"
                        onChange={toggleDefault}
                        checked={form.is_default || false}
                        disabled={processing}
                    />

                    <div className="mt-4 flex items-center space-x-1.5">
                        <CustomButton
                            type="button"
                            label="Cancel"
                            color="secondary"
                            onClick={() => onClose(null)}
                            disabled={processing}
                        />
                        <CustomButton
                            type="submit"
                            label={!data ? 'Submit' : 'Update'}
                            color="primary"
                            loading={processing}
                            disabled={processing}
                        />
                    </div>
                </form>
            </div>
        </BaseModal>
    );
};
export default AddressModal;
