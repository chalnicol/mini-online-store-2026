import gsap from 'gsap';
import { useEffect, useRef } from 'react';

interface TitleBarProps {
    title: string;
    className?: string;
    animated?: boolean;
    size?: 'sm' | 'md' | 'lg';
    color?: 'primary' | 'secondary';
}

const TitleBar: React.FC<TitleBarProps> = ({
    title,
    animated = false,
    size = 'md',
    color = 'primary',
    className,
}) => {
    const titleRef = useRef<HTMLDivElement>(null);

    const textCls: Record<string, string> = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    const colorCls: Record<string, string> = {
        primary: 'bg-sky-900 text-white',
        secondary: ' border-gray-300 bg-gray-100 text-gray-500',
    };

    useEffect(() => {
        if (animated && titleRef.current) {
            gsap.fromTo(
                titleRef.current,
                { yPercent: 100 },
                {
                    yPercent: 0,
                    duration: 0.5,
                    ease: 'power2.out',
                },
            );
        }

        return () => {
            if (animated && titleRef.current) {
                gsap.killTweensOf(titleRef.current);
            }
        };
    }, [animated]);

    return (
        <div
            className={`relative overflow-hidden border-b border-gray-300 ${className}`}
        >
            <p
                ref={titleRef}
                className={`inline-block min-w-31 rounded-t rounded-tr-lg border border-b-0 px-3 py-1 font-bold shadow ${colorCls[color]} ${textCls[size]}`}
            >
                {title}
            </p>
        </div>
    );
};

export default TitleBar;
