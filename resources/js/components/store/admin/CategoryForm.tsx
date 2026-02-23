import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import CustomButton from '../CustomButton';

const CategoryForm = ({
    categoryName,
    onSubmit,
    onCancel,
    loading,
    error,
}: {
    categoryName?: string | null;
    onSubmit: (name: string) => void;
    onCancel?: () => void;
    loading: boolean;
    error?: string | null;
}) => {
    const [name, setName] = useState(categoryName || '');

    const mode = !categoryName ? 'create' : 'update';

    const formDivRef = useRef<HTMLFormElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (formDivRef.current) {
            gsap.fromTo(
                formDivRef.current,
                {
                    width: 0,
                },
                {
                    width: 'auto',
                    transformOrigin: 'top right',
                    duration: 0.5,
                    ease: 'power4.out',
                    onComplete: () => {
                        nameRef.current?.focus();
                    },
                },
            );
        }

        return () => {
            if (formDivRef.current) {
                gsap.killTweensOf(formDivRef.current);
            }
        };
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(name);
    };

    return (
        <div className="space-y-2 rounded border border-gray-400 p-2 shadow">
            {error && (
                <p className="border-s-4 border-rose-400 bg-red-50 p-2 text-xs font-semibold text-rose-600">
                    {error}
                </p>
            )}
            <form
                onSubmit={handleSubmit}
                ref={formDivRef}
                className="overflow-hidden"
            >
                <div className="flex flex-col gap-x-2 gap-y-1.5 sm:flex-row md:items-center">
                    <input
                        ref={nameRef}
                        type="text"
                        className="w-full rounded border border-gray-400 px-2 outline-none"
                        placeholder="input name here"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <div className="flex items-center gap-x-1.5">
                        {onCancel && (
                            <CustomButton
                                type="button"
                                label="Cancel"
                                color="secondary"
                                size="sm"
                                onClick={onCancel}
                                disabled={loading}
                            />
                        )}
                        <CustomButton
                            label="Update"
                            color="primary"
                            size="sm"
                            disabled={loading}
                            loading={loading}
                        />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CategoryForm;
