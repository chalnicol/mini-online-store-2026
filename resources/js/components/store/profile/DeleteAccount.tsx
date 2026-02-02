// import { Link } from "react-router-dom";

import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import BaseModal from '../BaseModal';
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

    const handleDelete = () => {
        reset();
        clearErrors();
        setShowConfirmation(true);
    };

    const handleConfirmDelete = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmation(false);
        destroy('/settings/profile');
    };

    const contRef = useRef<HTMLDivElement>(null);

    return (
        <>
            {hasErrors && (
                <PromptMessage
                    type="error"
                    errors={errors}
                    className="mt-1 mb-3"
                />
            )}

            <div>
                <div></div>
                <p className="text-lg font-bold text-gray-600">
                    Deleting your account is permanent and cannot be undone.
                </p>

                <CustomButton
                    label="Delete Account"
                    color="danger"
                    size="lg"
                    loading={processing}
                    disabled={processing}
                    onClick={handleDelete}
                    className="mt-3"
                />
            </div>

            {showConfirmation && (
                <BaseModal size="lg">
                    <div className="w-full overflow-hidden rounded bg-white px-4 py-3 shadow-lg">
                        <form
                            className="space-y-2"
                            onSubmit={handleConfirmDelete}
                        >
                            <p className="font-semibold text-gray-600">
                                Please input your account password to confirm
                                deletion.
                            </p>
                            <TextInput
                                type="password"
                                placeholder="input password here"
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                required={true}
                            />

                            <div className="mt-4 flex items-center space-x-2">
                                <CustomButton
                                    type="button"
                                    label="Cancel"
                                    color="secondary"
                                    loading={processing}
                                    disabled={processing}
                                    onClick={() => setShowConfirmation(false)}
                                />
                                <CustomButton
                                    type="submit"
                                    label="Confirm Delete"
                                    color="danger"
                                    loading={processing}
                                    disabled={processing}
                                />
                            </div>
                        </form>
                    </div>
                </BaseModal>
            )}
        </>
    );
};
export default DeleteAccount;
