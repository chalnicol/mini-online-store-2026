import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';

type ButtonColor =
    | 'primary'
    | 'secondary'
    | 'info'
    | 'danger'
    | 'success'
    | 'dark';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children?: React.ReactNode;
    label?: string;
    size?: ButtonSize;
    color?: ButtonColor;
    onClick?: () => void;
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({
    children,
    label,
    className,
    size = 'md',
    color = 'primary',
    disabled,
    loading,
    onClick,
    ...props
}) => {
    const btnSizeClass: Record<ButtonSize, string> = {
        xs: 'px-2 py-0.5 text-xs',
        sm: 'px-2.5 py-0.5 text-sm',
        md: 'px-3 py-1',
        lg: 'px-3.5 py-1 text-lg',
    };

    const spinnerSizeClass: Record<ButtonSize, number> = {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 20,
    };

    const btnClrClass: Record<ButtonColor, string> = {
        primary: 'bg-sky-900 hover:bg-sky-800 text-white border-sky-800',
        secondary:
            'bg-gray-200 hover:bg-gray-100 text-gray-600 border-gray-400',
        info: 'bg-sky-500 hover:bg-sky-400 text-white border-sky-400',
        danger: 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500',
        dark: 'bg-gray-800 hover:bg-gray-700 text-white border-gray-700',
        success:
            'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-400',
    };

    // const btnClass =
    //     disabled || loading
    //         ? `border bg-gray-200 border-gray-300 text-gray-400 opacity-90`
    //         : `${btnClrClass[color]} cursor-pointer`;

    return (
        <button
            className={cn(
                'flex cursor-pointer items-center justify-center gap-x-1 rounded border font-semibold transition-colors duration-300 ease-in-out hover:shadow disabled:pointer-events-none disabled:cursor-default disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:opacity-90',
                btnSizeClass[size],
                btnClrClass[color],
                className,
            )}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <Loader
                    size={spinnerSizeClass[size]}
                    className="animate-spin"
                />
            )}

            {children ? (
                children
            ) : (
                <span className="whitespace-nowrap">{label}</span>
            )}
        </button>
    );
};

export default CustomButton;
