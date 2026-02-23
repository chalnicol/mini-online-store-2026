import { cn } from '@/lib/utils';
import { useRef } from 'react';

type SizeType = 'sm' | 'md';

interface TitleBarProps {
    title: string;
    className?: string;
    size?: SizeType;
}

const TitleBar: React.FC<TitleBarProps> = ({
    title,
    size = 'md',
    className,
}) => {
    const titleRef = useRef<HTMLDivElement>(null);

    const textSizeClass: Record<SizeType, string> = {
        sm: 'text-sm md:text-base',
        md: ' md:text-lg',
    };

    return (
        <>
            <div
                className={cn(
                    'relative mb-3 overflow-hidden border-b border-gray-300 p-1 font-bold',
                    textSizeClass[size],
                    className,
                )}
            >
                {title}
            </div>
        </>
    );
};

export default TitleBar;
