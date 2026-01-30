// src/hooks/useOutsideClick.ts
import { useEffect, useRef, type RefObject } from "react";

/**
 * Custom hook to detect clicks outside of a specified element.
 *
 * @param callback The function to call when an outside click occurs.
 * @returns A ref object to attach to the element you want to monitor for outside clicks.
 */
export function useOutsideClick<T extends HTMLElement>(
	callback: () => void
): RefObject<T> {
	// <--- The return type here also needs to reflect the possibility of null
	// Corrected: useRef should be typed to allow null
	const ref = useRef<T | null>(null); // Type 'T | null' for the ref's current value

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Corrected: Check if ref.current is not null before using it
			if (ref.current && !ref.current.contains(event.target as Node)) {
				callback();
			}
		};

		// Add the event listener to the document
		document.addEventListener("mousedown", handleClickOutside);

		// Cleanup the event listener on component unmount
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [callback]);

	// We return ref as RefObject<T> because the consumer component will
	// typically assign it directly to a JSX element's `ref` prop,
	// which expects `RefObject<T>` where T is the element type.
	// Although `ref.current` can be null internally, the contract for `ref` prop
	// in JSX is typically just the element type.
	// The consumer won't typically need to worry about the nullability,
	// as React handles attaching the DOM node to `ref.current`.
	// However, the *internal* type of `ref` itself should correctly include `null`.
	return ref as RefObject<T>; // Cast to the expected return type
}
