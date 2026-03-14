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
  Home: <Home size={28} />,
  Office: <Building size={28} />,
  Other: <MapPin size={28} />,
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
      {/* <CustomButton color="primary" size="sm" onClick={() => setShowForm(true)} loading={processing}>
        <div className="flex items-center gap-x-1 p-1 text-xs">
          <Plus size={12} />
          <span>New Address</span>
        </div>
      </CustomButton> */}

      {/* {success && <PromptMessage type="success" message={success} className="my-2" />} */}
      {hasErrors && <PromptMessage type="error" errors={errors} className="my-2" />}

      {addresses.length > 0 ? (
        <>
          <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
            {addresses.map((address) => (
              <div key={address.id} className="flex rounded border border-gray-400 shadow">
                <div className="flex w-16 flex-none flex-col items-center justify-center gap-1 rounded-s bg-gray-100 py-3 text-gray-600">
                  {ICON_MAP[address.type]}
                  <span className="text-[10px] tracking-widest uppercase">{address.type}</span>
                </div>

                <div className="flex-1 space-y-1 border-s border-gray-400 px-3 py-2">
                  <p className="space-x-0.5 text-sm leading-normal font-semibold text-slate-600">
                    {address.isDefault && (
                      <span className="bg-sky-900 px-1.5 text-xs tracking-wider text-white uppercase">Default</span>
                    )}
                    <span> {address.fullAddress}</span>
                  </p>

                  <p className="space-x-1.5 text-sm font-semibold text-slate-400">
                    <span>{address.contactPerson}</span>
                    <span>|</span>
                    <span>{address.contactNumber}</span>
                  </p>

                  {/* Not serviceable warning */}
                  {address.serviceableArea && !address.serviceableArea.isActive && (
                    <div className="flex items-center gap-2 text-xs text-amber-600">
                      <AlertTriangle size={14} />
                      <span>Area not serviceable — cannot be used at checkout</span>
                    </div>
                  )}
                </div>
                <div className="p-2">
                  <MenuOptions
                    pageOptions={generateOptions(address.isDefault)}
                    onOptionsClick={(e) => handleOptionsClick(e, address.id)}
                  />
                </div>
              </div>
            ))}
            <button
              className="flex min-h-20 cursor-pointer items-center justify-center rounded border-2 border-dashed border-gray-400 bg-gray-100 text-lg font-bold text-slate-500 hover:border-gray-500 lg:h-auto"
              onClick={() => setShowForm(true)}
              disabled={processing}
            >
              <Plus size={20} />
              New Address
            </button>
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
