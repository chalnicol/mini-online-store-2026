import { useOutsideClick } from '@/hooks/user-outside-click';
import { cn } from '@/lib/utils';
import gsap from 'gsap';
import { ChevronDown, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DropdownSelectProps<T> {
  options: { label: string; value: T }[];
  optionsView: 'grid' | 'grand' | 'list';
  value: T; // This is the INDEX
  onChange: (value: T) => void;
  highlighted?: T | null;
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'danger' | 'info' | 'success' | 'warning' | 'light';
  renderedLabel?: (value: T) => string;
  disabled?: boolean;
  loading?: boolean;
}

const DropdownSelectButton = <T,>({
  options,
  optionsView = 'list',
  size = 'md',
  value,
  onChange,
  highlighted,
  className,
  position = 'bottom-left',
  color = 'light',
  renderedLabel,
  disabled,
  loading,
}: DropdownSelectProps<T>) => {
  const [showOptions, setShowOptions] = useState(false);
  const contRef = useOutsideClick<HTMLDivElement>(() => setShowOptions(false));

  const optionsRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    'bottom-left': 'top-full mt-1',
    'bottom-right': 'top-full mt-1 right-0',
    'top-left': 'bottom-full mb-1',
    'top-right': 'bottom-full mb-1 right-0',
  };

  const optionsClass = {
    grid: 'grid grid-cols-[repeat(3,min-content)] max-h-30 overflow-y-auto overflow-x-hidden p-1.5 gap-1 min-w-full',
    grand: 'grid grid-cols-[repeat(5,min-content)] max-h-30 overflow-y-auto overflow-x-hidden p-1.5 gap-1 min-w-full',
    list: 'flex flex-col max-h-44 overflow-y-auto p-1.5 gap-1 min-w-full',
  };

  const txtClass = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const optionTxtClass = {
    xs: 'text-[10px]',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const clrClass = {
    primary: 'bg-sky-900 text-white divide-gray-200 hover:bg-sky-800',
    secondary: 'bg-gray-200 text-gray-600 divide-gray-300 hover:bg-gray-100',
    danger: 'bg-rose-600 text-white divide-gray-200 hover:bg-rose-500',
    info: 'bg-sky-500 text-white divide-gray-200 hover:bg-sky-400',
    success: 'bg-emerald-900 text-white divide-gray-200 hover:bg-emerald-800',
    warning: 'bg-amber-500 text-white divide-gray-200 hover:bg-amber-400',
    light: 'bg-white  text-slate-600 divide-gray-300 hover:bg-gray-50',
  };

  const getLabel = useCallback(() => {
    return options.find((option) => option.value === value)?.label ?? '--';
  }, [value, options]);

  useEffect(() => {
    if (showOptions && optionsRef.current) {
      gsap.fromTo(
        optionsRef.current,
        { scale: 0 },
        {
          scale: 1,
          duration: 0.5,
          ease: 'elastic.out(1, 0.6)',
          // ease: 'power3.out',
          transformOrigin: position === 'top-left' || position === 'top-right' ? 'bottom center' : 'top center',
        },
      );
    }
    return () => {
      if (optionsRef.current) {
        gsap.killTweensOf(optionsRef.current);
      }
    };
  }, [showOptions]);

  return (
    <div ref={contRef} className={cn('0 relative inline-block', className)}>
      <button
        type="button"
        className={cn(
          'border-gray-30 flex w-full cursor-pointer items-center justify-between divide-x rounded border border-gray-400 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-500 disabled:opacity-60',
          txtClass[size],
          clrClass[color],
        )}
        disabled={disabled}
        onClick={() => setShowOptions((prev) => !prev)}
      >
        <p className="flex flex-1 items-center px-3 py-1 text-left">
          {loading && <Loader2 size={14} className="animate-spin text-gray-500" />}

          {renderedLabel ? renderedLabel(value) : getLabel()}
        </p>
        <p className="px-1">
          <ChevronDown size={14} className={cn('transition-transform duration-300', showOptions && 'rotate-180')} />
        </p>
      </button>

      {showOptions && (
        <div
          ref={optionsRef}
          className={cn(
            'absolute z-50 rounded border border-gray-300 bg-white shadow',
            optionsClass[optionsView],
            positionClasses[position],
          )}
        >
          {options.map((option, i) => (
            <button
              key={i}
              type="button"
              className={cn(
                'cursor-pointer rounded border border-gray-200 px-2 py-0.5 text-left transition-colors hover:bg-sky-50 disabled:cursor-default disabled:bg-sky-900 disabled:font-semibold disabled:text-gray-600 disabled:text-white',
                optionTxtClass[size],
                highlighted === option.value && 'bg-gray-100 font-semibold',
              )}
              disabled={option.value === value}
              onClick={() => {
                onChange(option.value);
                setShowOptions(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSelectButton;
