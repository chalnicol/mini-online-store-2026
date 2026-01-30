type PromptType = 'error' | 'warning' | 'info' | 'success';

interface PromptMessageProps {
    type: PromptType;
    message?: string;
    errors?: Record<string, string>;
    className?: string;
}

const PromptMessage: React.FC<PromptMessageProps> = ({
    type, // Destructured fix
    message,
    errors,
    className = '',
}) => {
    // 1. Map for Container Colors
    const containerClass: Record<PromptType, string> = {
        error: 'bg-rose-50 border-rose-500',
        warning: 'bg-yellow-50 border-yellow-500',
        info: 'bg-sky-50 border-sky-500',
        success: 'bg-emerald-100 border-emerald-500',
    };

    // 2. Map for Main Message text
    const messageTextClass: Record<PromptType, string> = {
        error: 'text-rose-800',
        warning: 'text-yellow-900',
        info: 'text-sky-900',
        success: 'text-green-900',
    };

    // 3. Map for Label text (the "EMAIL:" part)
    const labelTextClass: Record<PromptType, string> = {
        error: 'text-rose-700',
        warning: 'text-yellow-700',
        info: 'text-sky-700',
        success: 'text-green-700',
    };

    // 4. Map for Divider lines and Bullet points
    const detailClass: Record<PromptType, string> = {
        error: 'border-rose-200 text-rose-600',
        warning: 'border-yellow-200 text-yellow-600',
        info: 'border-sky-200 text-sky-600',
        success: 'border-green-200 text-green-600',
    };

    const hasFieldErrors = errors && Object.keys(errors).length > 0;

    return (
        <div
            className={`rounded-e border-l-4 p-3 ${containerClass[type]} ${className}`}
        >
            {hasFieldErrors && (
                <div className={`space-y-2 ${detailClass[type]}`}>
                    {Object.entries(errors).map(([key, messages]) => (
                        <div key={key}>
                            <span
                                className={`${labelTextClass[type]} text-xs font-bold uppercase italic`}
                            >
                                {key.replace('_', ' ')}:
                            </span>
                            <span className="ms-2 text-sm">{messages}</span>
                            {/* <ul className="ml-1 list-none">
                                {messages.map((err, i) => (
                                    <li key={`${key}_${i}`} className="text-sm">
                                        • {err}
                                    </li>
                                ))}
                            </ul> */}
                        </div>
                    ))}
                </div>
            )}

            {message && (
                <p
                    className={`${messageTextClass[type]} text-sm font-semibold`}
                >
                    {message}
                </p>
            )}
        </div>
    );
};

export default PromptMessage;
