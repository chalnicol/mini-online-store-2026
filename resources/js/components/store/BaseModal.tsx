import gsap from 'gsap';
import { useEffect, useRef } from 'react';

interface BaseModalProps {
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const BaseModal: React.FC<BaseModalProps> = ({ children, size = 'md' }) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const widthCls: Record<string, string> = {
        sm: 'w-full max-w-sm',
        md: 'w-full max-w-md',
        lg: 'w-full max-w-lg',
        xl: 'w-full max-w-xl',
    };

    useEffect(() => {
        if (modalRef.current) {
            gsap.fromTo(
                modalRef.current,
                { scale: 0 },
                { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.6)' },
            );
        }
        return () => {
            gsap.killTweensOf(modalRef.current);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 z-50 flex h-dvh w-full items-center justify-center overflow-hidden p-4">
            <div className="absolute top-0 left-0 h-full w-full bg-gray-500 bg-gray-500/70"></div>
            <div ref={modalRef} className={widthCls[size]}>
                {children}
            </div>
        </div>
    );
};
export default BaseModal;
