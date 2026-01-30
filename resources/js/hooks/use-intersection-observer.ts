import { useEffect, useRef } from 'react';

export function useIntersectionObserver(
    callback: () => void,
    enabled: boolean,
) {
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!enabled) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    callback();
                }
            },
            { threshold: 0.1 }, // Trigger when 10% of the element is visible
        );

        const currentRef = observerRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [callback, enabled]);

    return observerRef;
}
