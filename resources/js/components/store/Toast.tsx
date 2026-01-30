// components/Toast.tsx
import gsap from 'gsap';
import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Toast({
    message,
    type = 'success',
    onClose,
}: {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}) {
    const contRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(onClose, 4000); // Auto-hide after 4s
        return () => clearTimeout(timer);
    }, [onClose]);

    useEffect(() => {
        if (contRef.current) {
            gsap.fromTo(
                contRef.current,
                { yPercent: 200 },
                {
                    yPercent: 0,
                    duration: 0.8,
                    ease: 'elastic.out(1, 0.5)',
                },
            );
        }
        return () => {
            gsap.killTweensOf(contRef.current);
        };
    }, []);

    return (
        <div
            ref={contRef}
            className={`fixed right-0 bottom-5 w-full rounded-lg px-2 text-sm font-semibold md:right-3 md:max-w-sm`}
        >
            <div
                className={`flex items-center justify-between rounded px-4 py-3 shadow-lg ${
                    type === 'success'
                        ? 'bg-green-200 text-green-700'
                        : 'bg-rose-100 text-rose-700'
                }`}
            >
                <span>{message}</span>
                <button
                    onClick={onClose}
                    className="cursor-pointer hover:text-gray-600"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
