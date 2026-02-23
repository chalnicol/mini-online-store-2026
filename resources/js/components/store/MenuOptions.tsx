import { useOutsideClick } from '@/hooks/user-outside-click';
import { cn } from '@/lib/utils';
import { OptionDetails } from '@/types/store';
import gsap from 'gsap';
import { EllipsisVertical } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

type OptionsPositionType = 'top' | 'bottom' | 'auto';

const MenuOptions = ({
    pageOptions,
    onOptionsClick,
    className,
    optionsPosition = 'bottom',
}: {
    pageOptions: OptionDetails[];
    onOptionsClick?: (optionId: number | string | null) => void;
    className?: string;
    optionsPosition?: OptionsPositionType;
}) => {
    const [showOptions, setShowOptions] = useState(false);
    const [renderedPos, setRenderedPos] = useState<'top' | 'bottom'>('bottom');

    const optionsRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null); // We need to measure the button
    const contRef = useOutsideClick<HTMLDivElement>(() =>
        setShowOptions(false),
    );

    useLayoutEffect(() => {
        if (showOptions && optionsRef.current && buttonRef.current) {
            // 1. Prepare for measurement: Set scale to 1 but keep it invisible
            gsap.set(optionsRef.current, { opacity: 0, scale: 1 });

            let finalPos: 'top' | 'bottom' = 'bottom';

            if (optionsPosition === 'auto') {
                const menuHeight = optionsRef.current.offsetHeight;
                const buttonRect = buttonRef.current.getBoundingClientRect();

                const getScrollParent = (
                    node: HTMLElement | null,
                ): HTMLElement | null => {
                    if (!node) return null;
                    const style = window.getComputedStyle(node);
                    if (/(auto|scroll)/.test(style.overflowY)) return node;
                    return getScrollParent(node.parentElement);
                };

                const parent = getScrollParent(buttonRef.current);
                const boundaryBottom = parent
                    ? parent.getBoundingClientRect().bottom
                    : window.innerHeight;

                // PREDICTION: If the button's top + the menu's height
                // exceeds the boundary, we must flip to 'top'.
                // Using 10px buffer for safety.
                if (buttonRect.top + menuHeight + 10 > boundaryBottom) {
                    finalPos = 'top';
                }
            } else {
                finalPos = optionsPosition;
            }

            setRenderedPos(finalPos);

            // 2. Animate from the correct origin
            gsap.fromTo(
                optionsRef.current,
                {
                    scale: 0,
                    opacity: 0,
                },
                {
                    scale: 1,
                    opacity: 1,
                    transformOrigin:
                        finalPos === 'top' ? 'bottom right' : 'top right',
                    duration: 0.6,
                    ease: 'elastic.out(1, 0.6)',
                },
            );
        }
    }, [showOptions, optionsPosition]);

    const handleOptionsClick = (value: number | string | null) => {
        setShowOptions(false);
        if (onOptionsClick) onOptionsClick(value);
    };

    const positionsClass = {
        top: 'bottom-full',
        bottom: 'top-full',
    };

    return (
        <div ref={contRef} className={cn('relative', className)}>
            <button
                ref={buttonRef} // Reference added here
                className={cn(
                    'block aspect-square cursor-pointer rounded-full px-1 hover:bg-gray-200',
                    showOptions ? 'ring-1 ring-gray-300' : '',
                )}
                onClick={() => setShowOptions((prev) => !prev)}
            >
                <EllipsisVertical size={16} />
            </button>
            {showOptions && (
                <div
                    ref={optionsRef}
                    className={cn(
                        'absolute right-full z-10 flex min-w-38 flex-col overflow-hidden rounded border border-gray-400 bg-white shadow-lg',
                        positionsClass[renderedPos],
                    )}
                >
                    {pageOptions.length > 0 ? (
                        <>
                            {pageOptions.map((option) => (
                                <button
                                    key={option.value}
                                    className="cursor-pointer px-3 py-2 text-left text-sm whitespace-nowrap text-slate-700 hover:bg-sky-50"
                                    onClick={() =>
                                        handleOptionsClick(option.value)
                                    }
                                >
                                    {option.label}
                                </button>
                            ))}
                        </>
                    ) : (
                        <p className="px-3 py-1.5 text-sm text-slate-700">
                            -No options-
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default MenuOptions;
