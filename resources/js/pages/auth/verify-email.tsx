import CustomButton from '@/components/store/CustomButton';
import PromptMessage from '@/components/store/PromptMessage';
import TitleBar from '@/components/store/TitleBar';
import CustomLayout from '@/layouts/app-custom-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

interface VerifyEmailProps {
    status?: string;
}

const VerifyEmail = ({ status }: VerifyEmailProps) => {
    const [success, setSuccess] = useState('');
    const { post, processing } = useForm({});

    const handleResendEmail = () => {
        // Handle resend email logic here
        // console.log({ email });
        post('/email/verification-notification', {
            onFinish: () => {
                setSuccess('Email sent successfully');
            },
        });
    };

    const message =
        ' A verification link has been sent to your email address. Please click the link to confirm your account.';

    return (
        <>
            <Head title="Verify Email" />
            <div className="mx-auto mt-6 max-w-md px-3">
                <TitleBar title="Verify Email" className="mb-3" />

                <div className="space-y-3">
                    {status && (
                        <PromptMessage
                            type="success"
                            message={message}
                            className="mt-1 mb-3"
                        />
                    )}

                    <div className="space-y-2 rounded border border-gray-300 px-3 py-2 shadow">
                        <p className="text-sm font-semibold text-gray-500">
                            Didn't receive the email?
                        </p>
                        <CustomButton
                            type="button"
                            label="Resend Email"
                            color="primary"
                            size="lg"
                            loading={processing}
                            disabled={processing}
                            onClick={handleResendEmail}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

VerifyEmail.layout = (page: React.ReactNode) => (
    <CustomLayout>{page}</CustomLayout>
);

export default VerifyEmail;
