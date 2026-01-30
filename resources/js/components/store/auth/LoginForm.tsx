import { LoginPayload } from '@/types/store';
import { Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import CheckButton from '../CheckButton';
import CustomButton from '../CustomButton';
import PromptMessage from '../PromptMessage';
import TextInput from '../TextInput';
// import CustomButton from "../CustomButton";

interface LoginFormProps {
    tab: 'login' | 'register';
    canResetPassword: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ tab, canResetPassword }) => {
    const {
        data,
        setData,
        processing,
        hasErrors,
        errors,
        clearErrors,
        post,
        reset,
    } = useForm<LoginPayload>({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        if (tab !== 'login') {
            reset();
        }
    }, [tab]);

    const handleFormUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as keyof LoginPayload, value as string);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Handle login lo
        post('/login', {
            onBefore: () => {
                clearErrors();
            },
            onError: () => {
                reset('password');
            },
            onSuccess: () => {
                reset();
            },
        });
    };

    return (
        <>
            {hasErrors && (
                <PromptMessage
                    type="error"
                    errors={errors}
                    className="mt-1 mb-4"
                />
            )}

            <form onSubmit={handleSubmit} className="my-2 space-y-3">
                <TextInput
                    type="text"
                    className=""
                    placeholder="email"
                    name="email"
                    value={data.email}
                    onChange={handleFormUpdate}
                    required={true}
                />
                <TextInput
                    type="password"
                    className=""
                    placeholder="password"
                    name="password"
                    value={data.password}
                    onChange={handleFormUpdate}
                    required={true}
                />
                <CheckButton
                    label="Remember Me"
                    onChange={() => setData('remember', !data.remember)}
                    checked={data.remember || false}
                    disabled={processing}
                />

                <CustomButton
                    type="submit"
                    color="primary"
                    label="Submit"
                    size="lg"
                    loading={processing}
                    disabled={processing}
                    className="w-full"
                />
            </form>

            {canResetPassword && (
                <Link
                    href="/forgot-password"
                    className="text-sm text-sky-900 hover:underline"
                >
                    Forgot password?
                </Link>
            )}
        </>
    );
};

export default LoginForm;
