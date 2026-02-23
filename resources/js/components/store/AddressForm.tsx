import { ADDRESS_TYPES, AddressDetailsType, formRules } from '@/data';
import { type AddressDetails, type AddressPayload } from '@/types/store';

import { useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import CheckButton from './CheckButton';
import CustomButton from './CustomButton';
import PromptMessage from './PromptMessage';
import TextInput from './TextInput';

interface AddressFormProps {
    data: AddressDetails | null;
    keys?: string[];
    onCancel: () => void;
    onSuccess: (props: any) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({
    data,
    keys,
    onCancel,
    onSuccess,
}) => {
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const baseOptions: any = {
            onBefore: () => clearErrors(),
            onSuccess: (page: any) => onSuccess(page.props),
            ...(mode === 'edit' && { preserveScroll: true }),
            ...(keys && keys.length > 0 && { keys }),
        };

        if (mode === 'add') {
            post('/profile/addresses', baseOptions);
            //..
        } else {
            patch(`/profile/addresses/${data?.id}`, baseOptions);
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
        <div>
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
                            const isLast = index === ADDRESS_TYPES.length - 1;

                            return (
                                <button
                                    key={type}
                                    className={`flex items-center justify-center gap-x-1 border border-gray-400 px-3 py-0.5 font-semibold ${isFirst ? 'rounded-l' : ''} ${isLast ? 'rounded-r' : ''} ${!isLast ? 'border-e-0' : ''} ${
                                        isActive
                                            ? 'bg-gray-200 text-gray-700'
                                            : 'cursor-pointer bg-white shadow hover:bg-gray-100'
                                    }`}
                                    onClick={() =>
                                        handleSelectAddressType(type)
                                    }
                                    disabled={isActive}
                                >
                                    {isActive && <Check size={14} />}
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
                    placeholder="full address line"
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
                        onClick={onCancel}
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
    );
};
export default AddressForm;
