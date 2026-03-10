import { AddressDetailsType } from '@/data';
import type { AddressDetails, ServiceableArea } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Building, Home, MapPin, NotebookTabs, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmationModal from '../ConfirmationModal';
import CustomButton from '../CustomButton';
import MenuOptions from '../MenuOptions';
import PromptMessage from '../PromptMessage';
import AddressModal from './AddressModal';

interface AddressListProps {
  addresses: AddressDetails[];
  serviceableAreas: ServiceableArea[];
}

const ICON_MAP: Record<AddressDetailsType, React.ReactNode> = {
  Home: <Home size={30} />,
  Office: <Building size={30} />,
  Other: <MapPin size={30} />,
};

const AddressList: React.FC<AddressListProps> = ({ addresses, serviceableAreas }) => {
  const { delete: destroy, patch, processing, errors, hasErrors, clearErrors } = useForm({});

  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [toEdit, setToEdit] = useState<AddressDetails | null>(null);
  const [toDelete, setToDelete] = useState<AddressDetails | null>(null);

  const handleEditAddress = (address: AddressDetails) => {
    setToEdit(address);
    setShowForm(true);
  };

  const handleCloseForm = (success: string | null) => {
    if (success) setSuccess(success);
    setToEdit(null);
    setShowForm(false);
  };

  const handleDeleteAddress = () => {
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

  const handleSetDefault = (id: number) => {
    //..
    patch(`/profile/addresses/${id}/make-default`, {
      onBefore: () => {
        setSuccess(null);
        clearErrors();
      },
      onSuccess: () => {
        setSuccess('Address has been set as default successfully');
        setToDelete(null);
      },
    });
  };

  useEffect(() => {
    if (showForm || toDelete) {
      setSuccess(null);
      clearErrors();
    }
  }, [showForm, toDelete]);

  const handleOptionsClick = (value: string | number | null, id: number) => {
    const address = addresses.find((a) => a.id === id);
    if (!address) return;
    if (value == 'edit') {
      handleEditAddress(address);
    } else if (value == 'delete') {
      setToDelete(address);
    } else if (value == 'default') {
      handleSetDefault(id);
    }
  };

  const generateOptions = (isDefault: boolean) => {
    const baseOptions = [
      { label: 'Edit', value: 'edit' },
      { label: 'Delete', value: 'delete' },
    ];

    if (!isDefault) {
      baseOptions.unshift({ label: 'Make Default', value: 'default' });
    }

    return baseOptions;
  };

  return (
    <div className="relative">
      <CustomButton color="primary" onClick={() => setShowForm(true)} loading={processing}>
        <div className="flex items-center gap-x-1">
          <Plus size={16} />
          <span>New Address</span>
        </div>
      </CustomButton>

      {success && <PromptMessage type="success" message={success} className="my-2" />}
      {hasErrors && <PromptMessage type="error" errors={errors} className="my-2" />}

      {addresses.length > 0 ? (
        <>
          <div className="mt-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="flex items-start gap-x-2 border-t border-gray-300 px-2 py-2.5 last:border-b even:bg-gray-100"
              >
                <div className="flex flex-1 items-start gap-x-2.5">
                  <div className="flex aspect-square w-16 flex-none flex-col items-center justify-center overflow-hidden rounded border border-gray-300 bg-white shadow">
                    {ICON_MAP[address.type]}
                  </div>

                  <div className="space-y-0.5">
                    <div className="mt-1 space-x-1 text-[10px] font-semibold tracking-widest text-sky-800 uppercase">
                      <span>{address.type}</span>
                      {address.isDefault && <span>| Default</span>}
                    </div>

                    <p className="space-x-0.5 text-sm text-slate-600">
                      <span> {address.fullAddress}</span>
                    </p>

                    <div className="space-x-1.5 text-sm font-semibold text-slate-500">
                      <span>{address.contactPerson}</span>
                      <span>|</span>
                      <span>{address.contactNumber}</span>
                    </div>

                    {/* Not serviceable warning */}
                    {address.serviceableArea && !address.serviceableArea.isActive && (
                      <div className="flex items-center gap-2 text-xs text-amber-600">
                        <AlertTriangle size={14} />
                        <span>Area not serviceable — cannot be used at checkout</span>
                      </div>
                    )}

                    {/* <div className="mt-4 flex items-center space-x-1.5">
                    <CustomButton
                      type="button"
                      label="Edit"
                      color="secondary"
                      size="xs"
                      onClick={() => handleEditAddress(address)}
                    />
                    <CustomButton
                      type="button"
                      label="Delete"
                      color="danger"
                      size="xs"
                      onClick={() => setToDelete(address)}
                    />
                  </div> */}
                  </div>
                </div>
                <div>
                  <MenuOptions
                    pageOptions={generateOptions(address.isDefault)}
                    onOptionsClick={(e) => handleOptionsClick(e, address.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <NotebookTabs size={64} className="mb-4 text-gray-300" />
          <h2 className="text-2xl font-bold text-gray-800">No addresses found.</h2>
          <p className="mb-6 text-gray-500">You haven't added any addresses yet.</p>
          <CustomButton label="Add Address" type="button" size="lg" color="primary" onClick={() => setShowForm(true)} />
        </div>
      )}

      {showForm && <AddressModal data={toEdit} serviceableAreas={serviceableAreas} onClose={handleCloseForm} />}

      {toDelete && (
        <ConfirmationModal
          message="Are you sure you want to delete this address?"
          details={toDelete.fullAddress}
          onClose={() => setToDelete(null)}
          onConfirm={handleDeleteAddress}
          isLoading={processing}
          isProcessing={processing}
        />
      )}
    </div>
  );
};

export default AddressList;
