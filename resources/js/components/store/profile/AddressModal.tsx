import { type AddressDetails } from '@/types/store';

import AddressForm from '../AddressForm';
import BaseModal from '../BaseModal';

interface AddressModalProps {
    data: AddressDetails | null;
    onClose: (success: string | null) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ data, onClose }) => {
    const handleSuccess = () => {
        if (!data) {
            onClose('Address added successfully');
        } else {
            onClose('Address updated successfully');
        }
    };
    return (
        <BaseModal size="lg">
            <div className="overflow-hidden rounded bg-white px-4 py-3 shadow-lg">
                <p className="font-bold text-gray-600">
                    {!data ? 'Add New Address' : 'Edit Address'}
                </p>
                <hr className="mt-1 mb-3 border-gray-400" />
                <AddressForm
                    data={data}
                    onCancel={() => onClose(null)}
                    onSuccess={handleSuccess}
                />
            </div>
        </BaseModal>
    );
};
export default AddressModal;
