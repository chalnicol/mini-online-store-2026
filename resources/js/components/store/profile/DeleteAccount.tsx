// import { Link } from "react-router-dom";

import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import CustomButton from '../CustomButton';
import PromptMessage from '../PromptMessage';
import TextInput from '../TextInput';

interface DeleteUserPayload {
  password: string;
}

const DeleteAccount: React.FC = () => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const {
    data,
    setData,
    delete: destroy,
    processing,
    reset,
    hasErrors,
    clearErrors,
    errors,
  } = useForm<DeleteUserPayload>({
    password: '', // This starts empty
  });

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    destroy('/settings/profile');
  };

  const contRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {hasErrors && <PromptMessage type="error" errors={errors} className="mt-1 mb-3" />}

      <div>
        <h2 className="text-lg font-bold text-gray-600">Delete Account</h2>
        <p className="text-sm text-gray-500">Deleting your account is permanent and cannot be undone.</p>

        <form onSubmit={handleDelete} className="mt-4 space-y-3">
          <TextInput
            type="password"
            placeholder="input account password here"
            value={data.password}
            onChange={(e) => setData('password', e.target.value)}
            required={true}
          />
          <CustomButton label="Delete Account" color="danger" size="lg" loading={processing} disabled={processing} />
        </form>
      </div>
    </>
  );
};
export default DeleteAccount;
