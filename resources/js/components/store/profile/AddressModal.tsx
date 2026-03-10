import { type AddressDetails, type ServiceableArea } from '@/types/store';
import AddressForm from '../AddressForm';
import BaseModal from '../BaseModal';

interface AddressModalProps {
  data: AddressDetails | null;
  serviceableAreas: ServiceableArea[];
  onClose: (success: string | null) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({ data, serviceableAreas, onClose }) => {
  const handleSuccess = () => {
    onClose(data ? 'Address updated successfully' : 'Address added successfully');
  };

  return (
    <BaseModal size="2xl">
      <div className="flex justify-end">
        <button
          className="cursor-pointer rounded-t bg-sky-900 px-2 py-0.5 text-xs text-white hover:bg-sky-800"
          onClick={() => onClose(null)}
        >
          CLOSE
        </button>
      </div>
      <div className="overflow-hidden rounded rounded-tr-none bg-white px-4 pt-3 pb-4 shadow-lg">
        <p className="font-bold text-gray-600">{data ? 'Edit Address' : 'Add New Address'}</p>
        <hr className="mt-1 mb-3 border-gray-400" />
        <AddressForm
          data={data}
          serviceableAreas={serviceableAreas}
          onCancel={() => onClose(null)}
          onSuccess={handleSuccess}
        />
      </div>
    </BaseModal>
  );
};

export default AddressModal;
