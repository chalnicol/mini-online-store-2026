import { Supplier } from '@/types/store';
import { router, useForm } from '@inertiajs/react';
import CustomButton from '../../CustomButton';
import PromptMessage from '../../PromptMessage';
import TextInput from '../../TextInput';

const SupplierForm = ({ supplier }: { supplier?: Supplier | null }) => {
  const {
    data,
    setData,
    processing,
    post,
    put,
    errors,
    setError, // Added to set manual validation errors
    hasErrors,
    clearErrors,
  } = useForm({
    name: supplier?.name || '',
    contact_number: supplier?.contactNumber || '',
    contact_person: supplier?.contactPerson || '',
    email: supplier?.email || '',
  });

  const mode = supplier ? 'edit' : 'create';

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    //set data.usage_limit == null if no usage limit
    if (mode === 'create') {
      //..
      post('/admin/suppliers', {
        replace: true,
        onBefore: () => clearErrors(),
      });
    } else {
      put(`/admin/suppliers/${supplier?.id}`, {
        replace: true,
        onBefore: () => clearErrors(),
      });
      //..
    }
  };

  const handleCancel = () => {
    router.visit('/admin/suppliers');
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        {hasErrors && <PromptMessage type="error" errors={errors} className="my-3" />}

        <TextInput
          label="Name"
          value={data.name}
          onChange={(e) => setData('name', e.target.value)}
          required
          rules={['This is required.']}
        />
        <TextInput label="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} />

        <TextInput
          label="Contact Person"
          value={data.contact_person}
          onChange={(e) => setData('contact_person', e.target.value)}
        />
        <TextInput
          label="Contact Number"
          value={data.contact_number}
          onChange={(e) => setData('contact_number', e.target.value)}
        />

        <div className="mt-6 flex items-center gap-x-2">
          <CustomButton type="button" label="Cancel" color="secondary" disabled={processing} onClick={handleCancel} />
          <CustomButton
            type="submit"
            label={mode === 'create' ? 'Create' : 'Update'}
            color="primary"
            disabled={processing}
            loading={processing}
          />
        </div>
      </form>
    </>
  );
};

export default SupplierForm;
