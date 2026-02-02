interface QuantityFormProps {
    value: number;
    max: number;
    disabled: boolean;
    onChange: (value: number) => void;
    loading?: boolean;
}

const QuantityForm = ({
    value,
    max,
    loading,
    disabled,
    onChange,
}: QuantityFormProps) => {
    const handleQuantityChange = (type: 'increment' | 'decrement') => {
        onChange(type === 'increment' ? value + 1 : value - 1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        if (isNaN(Number(value))) {
            onChange(1);
        } else {
            onChange(Number(value));
        }
    };

    return (
        <div className="flex">
            <button
                className="cursor-pointer rounded-l border border-gray-400 bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-default disabled:bg-gray-100 disabled:opacity-60"
                onClick={() => handleQuantityChange('decrement')}
                disabled={disabled || loading || value <= 1}
            >
                -
            </button>
            <input
                type="text"
                value={value}
                className="w-16 border-t border-b border-gray-400 text-center focus:outline-none"
                onChange={handleInputChange}
                min={1}
                max={max}
                // disabled={disabled}
                readOnly={disabled}
            />
            <button
                className={`cursor-pointer rounded-r border border-gray-400 bg-gray-200 px-3 py-1 hover:bg-gray-300 disabled:cursor-default disabled:bg-gray-100 disabled:opacity-60`}
                onClick={() => handleQuantityChange('increment')}
                disabled={disabled || loading || value >= max}
            >
                +
            </button>
        </div>
    );
};

export default QuantityForm;
