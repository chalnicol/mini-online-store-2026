import { cn } from '@/lib/utils';
import { Minus, Plus } from 'lucide-react';
import CustomButton from './CustomButton';

interface QuantityControlsProps {
    value: number;
    max: number;
    disabled: boolean;
    onChange: (value: number) => void;
    loading?: boolean;
    size?: 'sm' | 'md';
}

const QuantityControls = ({
    value,
    max,
    loading,
    disabled,
    size = 'md',
    onChange,
}: QuantityControlsProps) => {
    const handleQuantityChange = (type: 'increment' | 'decrement') => {
        onChange(type === 'increment' ? value + 1 : value - 1);
    };

    // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const { value } = e.target;
    //     if (isNaN(Number(value))) {
    //         onChange(1);
    //     } else {
    //         onChange(Number(value));
    //     }
    // };

    return (
        <div className={cn('flex', size === 'sm' ? 'text-sm' : '')}>
            <CustomButton
                color="secondary"
                onClick={() => handleQuantityChange('decrement')}
                disabled={disabled || loading || value <= 1}
                // loading={loading}
                className="-me-0.5"
            >
                <Minus size={14} />
            </CustomButton>

            <div className="z-10 w-11 flex-none border border-gray-400 bg-white text-center font-semibold select-none">
                {value}
            </div>
            <CustomButton
                color="secondary"
                onClick={() => handleQuantityChange('increment')}
                disabled={disabled || loading || value >= max}
                // loading={loading}
                className="-ms-0.5"
            >
                <Plus size={14} />
            </CustomButton>
        </div>
    );
};

export default QuantityControls;
