import CustomButton from '@/components/store/CustomButton';
import PromptMessage from '@/components/store/PromptMessage';
import TextInput from '@/components/store/TextInput';
import TitleBar from '@/components/store/TitleBar';
import { formRules } from '@/data';
import CustomLayout from '@/layouts/app-custom-layout';
import { ResetPasswordPayload } from '@/types/store';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface ResetPasswordProps {
    token: string;
    email: string;
}

const ResetPassword = ({ token, email }: ResetPasswordProps) => {
    // const [success, setSuccess] = useState('');

    const { data, setData, processing, hasErrors, errors, reset, post } =
        useForm<ResetPasswordPayload>({
            token: token,
            email: email,
            password: '',
            password_confirmation: '',
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        post('/reset-password', {
            // Fortify's default reset route
            onFinish: () => reset(),
        });
    };

    return (
        <>
            <Head title="Reset Password" />
            <div className="mx-auto mt-6 max-w-md px-3">
                <TitleBar title="Reset Password" className="mb-2" />

                {hasErrors && (
                    <PromptMessage
                        type="error"
                        errors={errors}
                        className="mt-1 mb-3"
                    />
                )}

                <form onSubmit={handleSubmit} className="space-y-2">
                    <TextInput
                        type="text"
                        className=""
                        placeholder="email"
                        value={data.email}
                        readOnly={true}
                        required={true}
                        // rules={formRules.email}
                    />
                    <TextInput
                        type="password"
                        className=""
                        placeholder="password"
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        required={true}
                        rules={formRules.password}
                    />
                    <TextInput
                        type="password"
                        className=""
                        placeholder="confirm password"
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required={true}
                        rules={formRules.passwordConfirmation}
                    />

                    <CustomButton
                        type="submit"
                        label="Submit"
                        color="primary"
                        size="lg"
                        loading={processing}
                        disabled={processing}
                        className="w-full"
                    />
                </form>
            </div>
        </>
    );
};

ResetPassword.layout = (page: React.ReactNode) => (
    <CustomLayout>{page}</CustomLayout>
);

export default ResetPassword;
