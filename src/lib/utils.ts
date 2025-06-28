import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useCallback, useRef, DependencyList } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Custom hook that memoizes a callback function and allows dynamic props to be passed in
 * without triggering re-renders or re-creating the callback function.
 * 
 * @param callback The callback function to be memoized
 * @param deps Dependency array for the useCallback hook
 * @returns A memoized function that forwards all arguments to the original callback
 */
export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T {
  // Use a ref to store the latest callback function
  const callbackRef = useRef<T>(callback);
  
  // Update the ref whenever the callback changes
  callbackRef.current = callback;
  
  // Create a stable function that calls the latest callback
  return useCallback(
    ((...args: any[]) => {
      return callbackRef.current(...args);
    }) as T,
    deps
  );
}