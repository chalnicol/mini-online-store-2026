import { cn } from '@/lib/utils';
import { useRef } from 'react';

interface TitleBarProps {
    title: string;
    className?: string;
}

const TitleBar: React.FC<TitleBarProps> = ({ title, className }) => {
    const titleRef = useRef<HTMLDivElement>(null);

    return (
        <>
            <div
                className={cn(
                    'relative mb-3 overflow-hidden border-b border-gray-300 p-1 font-bold md:text-lg',
                    className,
                )}
            >
                {title}
            </div>
        </>
    );
};

export default TitleBar;
