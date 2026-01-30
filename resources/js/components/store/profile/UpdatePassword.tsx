import { formRules } from '@/data';
import { UpdatePasswordPayload } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../CustomButton';
import PromptMessage from '../PromptMessage';
import TextInput from '../TextInput';

const UpdatePassword: React.FC = () => {
    const [success, setSuccess] = useState<string | null>(null);

    const {
        data,
        setData,
        processing,
        hasErrors,
        errors,
        clearErrors,
        reset,
        put,
    } = useForm<UpdatePasswordPayload>({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        put('/settings/password', {
            onBefore: () => {
                setSuccess(null);
                clearErrors();
            },
            onSuccess: () => {
                setSuccess('Password updated successfully');
            },
            onFinish: () => {
                reset();
            },
        });
        //..
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as keyof UpdatePasswordPayload, value as string);
    };

    const handleReset = () => {
        reset();
        clearErrors();
        setSuccess(null);
    };

    return (
        <>
            {hasErrors && (
                <PromptMessage
                    type="error"
                    errors={errors}
                    className="mt-1 mb-3"
                />
            )}
            {success && (
                <PromptMessage
                    type="success"
                    message={success}
                    className="mt-1 mb-3"
                />
            )}

            <form className="space-y-2" onSubmit={handleSubmit}>
                <TextInput
                    type="password"
                    label="Current Password"
                    value={data.current_password}
                    name="current_password"
                    onChange={handleFormChange}
                    // placeholder="current password"
                    required={true}
                />
                <TextInput
                    type="password"
                    label="New Password"
                    value={data.password}
                    name="password"
                    onChange={handleFormChange}
                    // placeholder="new password"
                    rules={formRules.password}
                    required={true}
                />
                <TextInput
                    type="password"
                    label="Confirm New Password"
                    value={data.password_confirmation}
                    name="password_confirmation"
                    onChange={handleFormChange}
                    // placeholder="confirm new password"
                    rules={formRules.passwordConfirmation}
                    required={true}
                />

                <div className="mt-4 flex items-center space-x-1.5">
                    <CustomButton
                        type="button"
                        label="Reset"
                        color="secondary"
                        onClick={handleReset}
                        disabled={processing}
                    />
                    <CustomButton
                        type="submit"
                        label="Update"
                        color="primary"
                        loading={processing}
                        disabled={processing}
                    />
                </div>
            </form>
        </>
    );
};
export default UpdatePassword;
