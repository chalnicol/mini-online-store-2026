import { useOutsideClick } from '@/hooks/user-outside-click';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface DropdownSelectProps {
    options: (number | string)[];
    optionsView: 'grid' | 'gridWide' | 'list';
    selected: number; // This is the INDEX
    onSelect: (index: number) => void;
    className?: string;
    position?: 'top' | 'bottom';
    highlightIndex?: number;
}

const DropdownSelect = ({
    options = [],
    optionsView = 'list',
    selected,
    onSelect,
    className,
    position = 'bottom',
    highlightIndex,
}: DropdownSelectProps) => {
    const [showOptions, setShowOptions] = useState(false);
    const contRef = useOutsideClick(() => setShowOptions(false));

    const positionClasses = {
        top: 'bottom-[calc(100%+4px)]',
        bottom: 'top-[calc(100%+4px)]',
    };

    const optionsClass = {
        grid: 'grid grid-cols-3 max-h-32 overflow-y-auto p-1.5 gap-1 w-full',
        gridWide:
            'grid grid-cols-4 max-h-32 overflow-y-auto p-1.5 gap-1 w-full',
        list: 'flex flex-col max-h-32 overflow-y-auto p-1.5 gap-1 min-w-[80px]',
    };

    return (
        <div ref={contRef as any} className="relative flex-1">
            <button
                type="button"
                className={cn(
                    'flex w-full items-center justify-between bg-white px-2 py-1.5 text-sm transition-all',
                    className,
                )}
                onClick={() => setShowOptions((prev) => !prev)}
            >
                <span className="truncate font-medium text-slate-700">
                    {options[selected] !== undefined ? options[selected] : '—'}
                </span>
                <ChevronDown
                    size={14}
                    className={cn(
                        'ml-1 text-slate-400',
                        showOptions && 'rotate-180',
                    )}
                />
            </button>

            {showOptions && (
                <div
                    className={cn(
                        'absolute left-0 z-[100] rounded border border-gray-300 bg-white shadow-xl',
                        optionsClass[optionsView],
                        positionClasses[position],
                    )}
                >
                    {/* {options.map((option, i) => (
                        <button
                            key={i}
                            type="button"
                            className={cn(
                                'rounded px-2 py-1 text-center text-xs transition-colors',
                                selected === i
                                    ? 'bg-sky-900 font-bold text-white'
                                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-900',
                            )}
                            onClick={() => {
                                onSelect(i);
                                setShowOptions(false);
                            }}
                        >
                            {option}
                        </button>
                    ))} */}
                    {options.map((option, i) => (
                        <button
                            key={i}
                            type="button"
                            className={cn(
                                'rounded px-2 py-1 text-center text-xs transition-colors',
                                // Selected state (Priority)
                                selected === i
                                    ? 'bg-sky-900 font-bold text-white'
                                    : i === highlightIndex
                                      ? 'bg-sky-100 font-semibold text-sky-900' // Highlight state
                                      : 'text-slate-600 hover:bg-sky-50',
                            )}
                            onClick={() => {
                                onSelect(i);
                                setShowOptions(false);
                            }}
                        >
                            {option}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownSelect;
