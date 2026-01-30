import { Circle } from 'lucide-react';

interface AddressModalProps {
    disabled: boolean;
    checked: boolean;
    onChange: () => void;
    className?: string;
    label: string;
}

const CheckButton: React.FC<AddressModalProps> = ({
    label,
    disabled,
    checked,
    onChange,
    className,
}) => {
    return (
        <button
            type="button"
            className={`flex cursor-pointer items-center rounded-full border border-gray-400 bg-white shadow hover:bg-gray-50 ${className}`}
            onClick={onChange}
            disabled={disabled}
        >
            <span className="border-e">
                <Circle
                    size={14}
                    className={`m-1 text-sky-900 ${
                        checked ? 'fill-current' : ''
                    }`}
                />
            </span>

            <span className="ps-2 pe-3 text-xs font-semibold text-gray-600">
                {label}
            </span>
        </button>
    );
};

export default CheckButton;
