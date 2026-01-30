import CustomButton from '@/components/store/CustomButton';
import PromptMessage from '@/components/store/PromptMessage';
import TextInput from '@/components/store/TextInput';
import TitleBar from '@/components/store/TitleBar';
import CustomLayout from '@/layouts/app-custom-layout';
import { Head, useForm } from '@inertiajs/react';
import React from 'react';

interface ForgotPasswordProps {
    status?: string;
}

const ForgotPassword = ({ status }: ForgotPasswordProps) => {
    const { data, setData, processing, hasErrors, errors, reset, post } =
        useForm({
            email: '',
        });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle forgot password logic here
        // console.log({ email });
        post('/forgot-password', {
            onFinish: () => {
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="mx-auto mt-3 max-w-md px-3">
                <TitleBar title="Forgot Password" className="mb-2" />

                {hasErrors && (
                    <PromptMessage
                        type="error"
                        errors={errors}
                        className="mt-1 mb-3"
                    />
                )}
                {status && (
                    <PromptMessage
                        type="success"
                        message={status}
                        className="mt-1 mb-3"
                    />
                )}

                <p className="my-2 text-sm leading-normal">
                    Enter your email address below and we'll send you
                    instructions to reset.
                </p>
                <form onSubmit={handleSubmit} className="space-y-2">
                    <TextInput
                        type="text"
                        className=""
                        placeholder="email"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required={true}
                    />
                    <CustomButton
                        type="submit"
                        label="Submit"
                        color="primary"
                        size="lg"
                        loading={processing}
                        disabled={processing}
                        className="mt-2 w-full"
                    />
                </form>
            </div>
        </>
    );
};

ForgotPassword.layout = (page: React.ReactNode) => (
    <CustomLayout>{page}</CustomLayout>
);

export default ForgotPassword;
