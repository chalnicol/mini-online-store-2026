import { formRules } from '@/data';
import type { UpdateProfilePayload } from '@/types/store';
import { User } from '@/types/store';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import CustomButton from '../CustomButton';
import PromptMessage from '../PromptMessage';
import TextInput from '../TextInput';

interface DetailsProps {
    user: User;
}

const Details: React.FC<DetailsProps> = ({ user }) => {
    // console.log(user);
    const [success, setSuccess] = useState<string | null>(null);

    const {
        data,
        setData,
        processing,
        hasErrors,
        errors,
        clearErrors,
        reset,
        patch,
    } = useForm<UpdateProfilePayload>({
        fname: user.fname,
        lname: user.lname,
        email: user.email,
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setData(name as keyof UpdateProfilePayload, value as string);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        //..
        patch('/settings/profile', {
            onBefore: () => {
                setSuccess(null);
                clearErrors();
            },
            onSuccess: () => {
                setSuccess('Profile updated successfully');
            },
        });
    };

    const handleReset = () => {
        reset();
        setSuccess(null);
    };

    return (
        <div className="w-full">
            {hasErrors && (
                <PromptMessage
                    type="error"
                    // message={error.message}
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
                    type="text"
                    label="First Name"
                    value={data.fname}
                    name="fname"
                    onChange={handleFormChange}
                    // placeholder="first name"
                    rules={formRules.firstName}
                    required={true}
                />
                <TextInput
                    type="text"
                    label="Last Name"
                    value={data.lname}
                    name="lname"
                    onChange={handleFormChange}
                    // placeholder="last name"
                    rules={formRules.lastName}
                    required={true}
                />
                <TextInput
                    type="text"
                    label="Email"
                    value={data.email}
                    name="email"
                    onChange={handleFormChange}
                    // placeholder="email"
                    rules={formRules.email}
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
        </div>
    );
};

export default Details;
