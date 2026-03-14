import { ADDRESS_TYPES, AddressDetailsType, formRules } from '@/data';
import { type AddressDetails, type AddressPayload, type ServiceableArea } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Check } from 'lucide-react';
import CheckButton from './CheckButton';
import CustomButton from './CustomButton';
import PromptMessage from './PromptMessage';
import TextInput from './TextInput';

interface AddressFormProps {
  data: AddressDetails | null;
  keys?: string[];
  serviceableAreas: ServiceableArea[];
  onCancel: () => void;
  onSuccess: (props: any) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ data, keys, serviceableAreas, onCancel, onSuccess }) => {
  const {
    data: form,
    setData,
    processing,
    errors,
    hasErrors,
    clearErrors,
    post,
    patch,
  } = useForm<AddressPayload>({
    serviceable_area_id: data?.serviceableAreaId ?? null,
    street_address: data?.streetAddress ?? '',
    contact_person: data?.contactPerson ?? '',
    contact_number: data?.contactNumber ?? '',
    type: data?.type ?? 'Home',
    is_default: data?.isDefault ?? false,
  });

  const mode = data ? 'edit' : 'add';

  const selectedArea = serviceableAreas.find((a) => a.id === form.serviceable_area_id) ?? null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const baseOptions: any = {
      onBefore: () => clearErrors(),
      onSuccess: (page: any) => onSuccess(page.props),
      ...(mode === 'edit' && { preserveScroll: true }),
      ...(keys && keys.length > 0 && { keys }),
    };

    if (mode === 'add') {
      post('/profile/addresses', baseOptions);
    } else {
      patch(`/profile/addresses/${data?.id}`, baseOptions);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(name as keyof AddressPayload, value);
  };

  return (
    <div>
      {hasErrors && <PromptMessage type="error" errors={errors} className="mb-3" />}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-3 divide-x divide-gray-400 rounded border border-gray-400 text-sm">
          {ADDRESS_TYPES.map((type, index) => (
            <button
              key={type}
              type="button"
              disabled={form.type === type}
              className="flex cursor-pointer items-center justify-center gap-1 bg-gray-200 px-2 py-1 font-semibold uppercase shadow transition-colors duration-300 first:rounded-l last:rounded-r hover:bg-gray-100 disabled:cursor-default disabled:bg-sky-900 disabled:font-bold disabled:text-white disabled:shadow-none"
              onClick={() => setData('type', type as AddressDetailsType)}
            >
              {form.type === type && <Check size={14} />}
              {type}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-x-3 gap-y-2.5 md:grid-cols-[1fr_1fr]">
          {/* Right side — rest of the form */}
          <div className="space-y-2.5">
            {/* Address Type */}

            <TextInput
              label="Contact Person"
              type="text"
              name="contact_person"
              value={form.contact_person}
              onChange={handleFormChange}
              //   placeholder="Contact person"
              required
              rules={formRules.contactPerson}
            />

            <TextInput
              label="Contact Number"
              type="text"
              name="contact_number"
              value={form.contact_number}
              onChange={handleFormChange}
              //   placeholder="Contact number"
              required
              rules={formRules.contactNumber}
            />

            <div className="space-y-1">
              <p className="text-[10px] tracking-widest text-slate-500 uppercase">House no., Building, Street name</p>
              <textarea
                name="street_address"
                value={form.street_address}
                onChange={handleFormChange}
                // placeholder="House no., Building, Street name..."
                required
                rows={3}
                className="block w-full resize-none rounded border border-gray-500 bg-white px-2 py-1 text-sm focus:ring-1 focus:ring-sky-900 focus:outline-none"
              />
            </div>

            <CheckButton
              label="Set as Default"
              onChange={() => setData('is_default', !form.is_default)}
              checked={form.is_default ?? false}
              disabled={processing}
            />
          </div>
          {/* Barangay Picker — top on small, left column on larger */}
          <div className="order-first space-y-1 md:order-last">
            <p className="text-[10px] tracking-widest text-slate-500 uppercase">Barangay</p>
            <div className="h-[192px] overflow-y-auto rounded border border-gray-400 bg-white">
              {serviceableAreas.length > 0 ? (
                serviceableAreas.map((area) => {
                  const isSelected = form.serviceable_area_id === area.id;
                  return (
                    <button
                      key={area.id}
                      type="button"
                      disabled={!area.isActive}
                      onClick={() => setData('serviceable_area_id', area.id)}
                      className={`w-full border-b border-gray-300 px-2 py-1.5 text-left transition-colors duration-300 last:border-0 ${
                        isSelected
                          ? 'bg-sky-900 font-semibold text-white'
                          : area.isActive
                            ? 'cursor-pointer text-gray-700 hover:bg-sky-50'
                            : 'cursor-not-allowed text-gray-400 line-through'
                      }`}
                    >
                      <p className="text-sm">{area.barangay}</p>
                      <span className={`block text-[10px] ${isSelected ? 'text-sky-200' : 'text-gray-400'}`}>
                        {area.city}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="flex h-full items-center justify-center p-3 text-center">
                  <p className="text-xs text-gray-400">No areas available.</p>
                </div>
              )}
            </div>

            {selectedArea && !selectedArea.isActive && (
              <div className="mt-1 flex items-start gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-1.5">
                <AlertTriangle size={12} className="mt-0.5 flex-none text-amber-500" />
                <p className="text-[10px] text-amber-700">
                  Area not serviceable yet. You can save but cannot use at checkout.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center gap-1.5">
          <CustomButton type="button" label="Cancel" color="secondary" onClick={onCancel} disabled={processing} />
          <CustomButton
            type="submit"
            label={mode === 'add' ? 'Submit' : 'Update'}
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
