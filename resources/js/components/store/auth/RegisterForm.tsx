import { formRules } from '@/data';
import { RegisterPayload } from '@/types/store';
import { Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import CustomButton from '../CustomButton';
import PromptMessage from '../PromptMessage';
import TextInput from '../TextInput';

interface LoginFormProps {
    tab: 'login' | 'register';
}

const RegisterForm: React.FC<LoginFormProps> = ({ tab }) => {
    const {
        data,
        setData,
        post,
        reset,
        hasErrors,
        errors,
        clearErrors,
        processing,
    } = useForm<RegisterPayload>({
        fname: '',
        lname: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleFormUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // setFormData((prev) => ({
        //     ...prev, // Copy all existing fields
        //     [name]: value, // Update only the field that changed
        // }));
        setData(name as keyof RegisterPayload, value as string);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        post('/register', {
            onBefore: () => {
                clearErrors();
            },
            onError: () => {
                reset('password', 'password_confirmation');
            },
            onSuccess: () => {
                reset();
            },
        });
    };

    useEffect(() => {
        if (tab !== 'register') {
            reset();
        }
    }, [tab]);

    //
    return (
        <>
            {hasErrors && (
                <PromptMessage
                    type="error"
                    errors={errors}
                    className="mt-1 mb-4"
                />
            )}

            <form onSubmit={handleRegister} className="my-2 space-y-3">
                <TextInput
                    type="text"
                    className=""
                    placeholder="first name"
                    name="fname"
                    value={data.fname}
                    onChange={handleFormUpdate}
                    rules={formRules.firstName}
                    required={true}
                />

                <TextInput
                    type="text"
                    placeholder="last name"
                    name="lname"
                    value={data.lname}
                    onChange={handleFormUpdate}
                    rules={formRules.lastName}
                    required={true}
                />

                <TextInput
                    type="email"
                    placeholder="email"
                    name="email"
                    value={data.email}
                    onChange={handleFormUpdate}
                    rules={formRules.email}
                    required={true}
                />

                <TextInput
                    type="password"
                    placeholder="password"
                    name="password"
                    value={data.password}
                    onChange={handleFormUpdate}
                    rules={formRules.password}
                    required={true}
                />

                <TextInput
                    type="password"
                    placeholder="confirm password"
                    name="password_confirmation"
                    value={data.password_confirmation}
                    onChange={handleFormUpdate}
                    rules={formRules.passwordConfirmation}
                    required={true}
                />
                <p className="mb-4 ps-0.5 text-sm">
                    By registering, you agree to our{' '}
                    <Link href="#" className="text-sky-900 hover:underline">
                        Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="#" className="text-sky-900 hover:underline">
                        Privacy Policy
                    </Link>
                    .
                </p>

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
        </>
    );
};

export default RegisterForm;
