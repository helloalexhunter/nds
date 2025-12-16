// src/hooks/useDebounce.js
import { useState, useEffect } from 'preact/hooks';

/**
 * Custom hook to debounce a value.
 * Delays updating the value until a user pauses their input for the specified delay.
 */
export default function useDebounce(value, delay) {
	const [debouncedValue, setDebouncedValue] = useState(value);

	useEffect(() => {
		// Set up a timer to update the debounced value after the delay
		const handler = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// Cleanup function: If value changes before the delay, cancel the previous timer
		return () => {
			clearTimeout(handler);
		};
	}, [value, delay]);

	return debouncedValue;
}
