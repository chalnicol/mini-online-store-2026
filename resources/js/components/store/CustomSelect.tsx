import { useOutsideClick } from '@/hooks/user-outside-click';
import { cn } from '@/lib/utils';
import { SelectOptionsType } from '@/types/store';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CustomSelectProps<T> {
    value: T;
    options: SelectOptionsType<T>[];
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onChange?: (value: T) => void;
    placeholder?: string;
}

const CustomSelect = <T,>({
    value,
    options,
    placeholder,
    size = 'md',
    onChange,
    className,
}: CustomSelectProps<T>) => {
    const textCls: Record<string, string> = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const contRef = useOutsideClick<HTMLDivElement>(() => {
        // 2. Callback function: close the dropdown when an outside click occurs
        setIsOpen(false);
    });

    const selectedOption = options.find((opt) => opt.value === value);

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const handleOptionClick = (option: SelectOptionsType<T>) => {
        setIsOpen(false);
        if (onChange) {
            onChange(option.value);
        }
    };

    return (
        /* 1. Use 'inline-flex flex-col' so the container wraps its children tightly */
        <div
            ref={contRef}
            className={cn('relative inline-flex flex-col', className)}
        >
            <button
                type="button"
                /* 2. Remove 'w-full' and use 'min-w-max' to ensure the button 
                  doesn't shrink smaller than the text */
                className={`relative flex items-center justify-between gap-x-2 rounded border border-gray-400 bg-white px-3 py-0.5 shadow ${textCls[size]}`}
                onClick={() => setIsOpen((prev) => !prev)}
            >
                <span className="whitespace-nowrap">
                    {selectedOption
                        ? selectedOption.label
                        : placeholder || 'Select'}
                </span>
                <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                /* 3. Use 'min-w-full' so the menu is AT LEAST as wide as the button, 
                  but can grow larger if an option is longer */
                <div className="absolute top-full left-0 z-50 mt-0.5 min-w-full overflow-hidden rounded border border-gray-400 bg-white shadow-lg">
                    <ul>
                        {options.map((option) => (
                            <li
                                key={option.id}
                                /* 4. 'whitespace-nowrap' is key here: it forces the 
                                  parent to respect the text width */
                                className={`cursor-pointer px-3 py-1.5 text-left whitespace-nowrap select-none ${
                                    value === option.value
                                        ? 'bg-sky-900 text-white'
                                        : 'hover:bg-gray-100'
                                }`}
                                onClick={() => handleOptionClick(option)}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
