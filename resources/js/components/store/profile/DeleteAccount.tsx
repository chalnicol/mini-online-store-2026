// import { Link } from "react-router-dom";

import { useForm } from '@inertiajs/react';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
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

    const handleConfirmDelete = (e: React.FormEvent) => {
        e.preventDefault();
        setShowConfirmation(false);
        destroy('/settings/profile');
    };

    const contRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (showConfirmation && contRef.current) {
            reset();
            clearErrors();
            gsap.fromTo(
                contRef.current,
                { scale: 0 },
                {
                    scale: 1,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)',
                },
            );
        }
        return () => {
            gsap.killTweensOf(contRef.current);
        };
    }, [showConfirmation]);

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
                    onClick={() => setShowConfirmation(true)}
                    className="mt-3"
                />
            </div>

            {showConfirmation && (
                <BaseModal>
                    <div
                        ref={contRef}
                        className="w-full max-w-lg overflow-hidden rounded bg-white px-4 py-3 shadow-lg"
                    >
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

                            <div className="mt-4 space-x-2">
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
