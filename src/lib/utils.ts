import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { useCallback, useRef, DependencyList } from "react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Creates a debounced function that delays invoking `func` until after `wait` milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * 
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @param options Additional options for controlling behavior
 * @returns A debounced version of the original function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let result: ReturnType<T>;
  let lastCallTime: number | null = null;
  
  const { leading = false, trailing = true } = options;
  
  function invokeFunc() {
    if (lastArgs && lastThis) {
      const callTime = Date.now();
      result = func.apply(lastThis, lastArgs);
      lastCallTime = callTime;
      lastThis = lastArgs = null;
    }
  }
  
  function shouldInvoke(time: number) {
    if (lastCallTime === null) return true;
    const timeSinceLastCall = time - lastCallTime;
    return timeSinceLastCall >= wait;
  }
  
  function timerExpired() {
    const time = Date.now();
    if (shouldInvoke(time)) {
      return invokeFunc();
    }
    
    // Schedule new timer
    timeout = setTimeout(timerExpired, wait);
  }
  
  function debounced(this: any, ...args: Parameters<T>): void {
    const time = Date.now();
    const isInvoking = shouldInvoke(time);
    
    lastArgs = args;
    lastThis = this;
    lastCallTime = time;
    
    if (isInvoking) {
      if (timeout === null) {
        if (leading) {
          return invokeFunc();
        }
        timeout = setTimeout(timerExpired, wait);
        return undefined;
      }
    }
    
    if (timeout === null) {
      timeout = setTimeout(timerExpired, wait);
    }
    
    if (trailing) {
      clearTimeout(timeout);
      timeout = setTimeout(timerExpired, wait);
    }
    
    return undefined;
  }
  
  return debounced;
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