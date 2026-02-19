import { AddressDetailsType } from '@/data';
import type { AddressDetails } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { Building, Home, MapPin, NotebookTabs, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmationModal from '../ConfirmationModal';
import CustomButton from '../CustomButton';
import PromptMessage from '../PromptMessage';
import AddressModal from './AddressModal';
// import { myAddresses } from "../../data";

interface AddressListProps {
    addresses: AddressDetails[];
}

const AddressList: React.FC<AddressListProps> = ({ addresses }) => {
    const {
        data,
        delete: destroy,
        processing,
        errors,
        hasErrors,
        clearErrors,
    } = useForm({});

    const [showForm, setShowForm] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);

    const [toEdit, setToEdit] = useState<AddressDetails | null>(null);
    const [toDelete, setToDelete] = useState<AddressDetails | null>(null);

    const handleEditAddress = (address: AddressDetails) => {
        setToEdit(address);
        setShowForm(true);
    };
    const handleCloseForm = (success: string | null) => {
        if (success) {
            setSuccess(success);
        }
        setToEdit(null);
        setShowForm(false);
    };
    const handleCloseConfirmation = () => {
        setToDelete(null);
    };

    const handleDeleteAddress = async () => {
        console.log(toDelete);
        if (!toDelete) return;
        destroy(`/profile/addresses/${toDelete.id}`, {
            onBefore: () => {
                setSuccess(null);
                clearErrors();
            },
            onSuccess: () => {
                setSuccess('Address deleted successfully');
                setToDelete(null);
            },
        });
    };

    const ICON_MAP: Record<AddressDetailsType, React.ReactNode> = {
        Home: <Home size={30} />,
        Office: <Building size={30} />,
        Other: <MapPin size={30} />, // You can use MapPin or any other icon for "Other"
    };

    useEffect(() => {
        if (showForm || toDelete) {
            setSuccess(null);
            clearErrors();
        }
    }, [showForm, toDelete]);

    return (
        <div className="relative">
            {success && (
                <PromptMessage
                    type="success"
                    message={success}
                    className="mt-1 mb-3"
                />
            )}

            {hasErrors && (
                <PromptMessage
                    type="error"
                    errors={errors}
                    className="mt-1 mb-3"
                />
            )}

            {addresses.length > 0 ? (
                <>
                    <div>
                        {addresses.map((address) => (
                            <div
                                key={address.id}
                                className="flex items-start gap-x-2.5 border-b border-gray-300 px-2 py-2.5 first:pt-0 even:bg-gray-100"
                            >
                                <div className="flex aspect-square w-20 flex-none flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-gray-300 bg-white shadow">
                                    <div className="flex flex-grow items-center justify-center">
                                        {ICON_MAP[address.type]}
                                    </div>
                                    <p className="w-full bg-gray-200 text-center text-sm font-semibold text-gray-600">
                                        {address.type}
                                    </p>
                                </div>
                                <div className="flex-1 space-y-1.5 leading-tight">
                                    {/* default */}

                                    {/* full address */}
                                    <p className="text-sm font-semibold text-gray-800">
                                        {address.isDefault && (
                                            <span className="me-2 rounded bg-sky-900 px-2 text-xs font-bold text-white">
                                                Default
                                            </span>
                                        )}

                                        {address.fullAddress}
                                    </p>
                                    {/* contact person */}
                                    <div className="space-x-1.5 text-sm font-bold text-slate-600">
                                        <span>{address.contactPerson}</span>
                                        <span>|</span>
                                        <span>{address.contactNumber}</span>
                                    </div>

                                    {/* edit and delete */}

                                    <div className="mt-4 flex items-center space-x-1.5">
                                        <CustomButton
                                            type="button"
                                            label="Edit"
                                            color="secondary"
                                            size="xs"
                                            onClick={() =>
                                                handleEditAddress(address)
                                            }
                                        />
                                        <CustomButton
                                            type="button"
                                            label="Delete"
                                            color="danger"
                                            size="xs"
                                            onClick={() => setToDelete(address)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <CustomButton
                        color="primary"
                        onClick={() => setShowForm(true)}
                        className="my-2"
                        loading={processing}
                    >
                        <div className="flex items-center gap-x-1">
                            <Plus size={16} />
                            <span>New Address</span>
                        </div>
                    </CustomButton>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                    <NotebookTabs size={64} className="mb-4 text-gray-300" />
                    <h2 className="text-2xl font-bold text-gray-800">
                        No addresses found.
                    </h2>
                    <p className="mb-6 text-gray-500">
                        You haven't added any addresses yet.
                    </p>
                    <CustomButton
                        label="Add Address"
                        type="button"
                        size="lg"
                        color="primary"
                        onClick={() => setShowForm(true)}
                    />
                </div>
            )}

            {showForm && (
                <AddressModal onClose={handleCloseForm} data={toEdit} />
            )}

            {toDelete && (
                <ConfirmationModal
                    message="Are you sure you want to delete this address?"
                    details={toDelete.fullAddress}
                    onClose={handleCloseConfirmation}
                    onConfirm={handleDeleteAddress}
                    isLoading={processing}
                    isProcessing={processing}
                />
            )}
        </div>
    );
};
export default AddressList;
