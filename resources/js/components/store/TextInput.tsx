import { useOutsideClick } from '@/hooks/user-outside-click';
import React from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    rules?: string[];
    label?: string;
    className?: string;
}
const TextInput: React.FC<TextInputProps> = ({
    rules,
    label,
    className,
    ...props
}) => {
    const [showRules, setShowRules] = React.useState(false);
    const parentRef = useOutsideClick<HTMLDivElement>(() => {
        // 2. Callback function: close the dropdown when an outside click occurs
        setShowRules(false);
    });
    return (
        <div>
            {label && (
                <p className="inline-block min-w-38 rounded-t bg-gray-300 px-2 py-1 text-xs font-bold text-gray-600">
                    {label}
                </p>
            )}
            <div className="relative -mt-0.5">
                <input
                    {...props}
                    className={`autofill:text-fill-gray-900 z-10 h-full w-full rounded border border-gray-500 bg-white px-2 py-1 text-foreground focus:ring-1 focus:ring-sky-800 focus:outline-none ${className}`}
                />
                {rules && rules.length > 0 && (
                    <>
                        <div
                            className="absolute top-1/2 right-2 z-10 -translate-y-1/2"
                            tabIndex={-1}
                            ref={parentRef}
                        >
                            <button
                                tabIndex={-1}
                                type="button"
                                className={`z-20 flex h-4 w-4 cursor-pointer items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                                    showRules
                                        ? 'bg-sky-700'
                                        : 'bg-sky-800 hover:bg-sky-700'
                                }`}
                                onClick={() => setShowRules((prev) => !prev)}
                            >
                                ?
                            </button>
                            {showRules && (
                                <ul className="absolute top-0 right-full min-w-40 list-inside list-disc rounded border border-gray-400 bg-white px-2 py-1 text-xs font-bold whitespace-nowrap text-gray-900 shadow-lg">
                                    {rules.map((rule, index) => (
                                        <li key={index}>{rule}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TextInput;
