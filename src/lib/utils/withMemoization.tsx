import React, { ComponentType, memo } from 'react';

/**
 * Higher-order component that wraps a component with React.memo
 * and provides a custom equality function to optimize rendering
 * 
 * @param Component - The component to memoize
 * @param areEqual - Optional custom equality function
 * @returns Memoized component
 */
export function withMemoization<P extends object>(
  Component: ComponentType<P>,
  areEqual?: (prevProps: Readonly<P>, nextProps: Readonly<P>) => boolean
): React.MemoExoticComponent<ComponentType<P>> {
  // Default comparison function that does deep comparison for arrays and objects
  const defaultAreEqual = (prevProps: Readonly<P>, nextProps: Readonly<P>): boolean => {
    // Skip if same reference
    if (prevProps === nextProps) return true;
    
    const prevKeys = Object.keys(prevProps);
    const nextKeys = Object.keys(nextProps);
    
    // Different number of props
    if (prevKeys.length !== nextKeys.length) return false;
    
    // Check each prop
    for (const key of prevKeys) {
      const prev = prevProps[key as keyof P];
      const next = nextProps[key as keyof P];
      
      // Different references
      if (prev !== next) {
        // Handle arrays
        if (Array.isArray(prev) && Array.isArray(next)) {
          if (prev.length !== next.length) return false;
          
          // Check if array items are the same
          for (let i = 0; i < prev.length; i++) {
            if (prev[i] !== next[i]) return false;
          }
        }
        // Handle objects (but not functions, DOM elements, etc.)
        else if (
          prev && 
          next && 
          typeof prev === 'object' && 
          typeof next === 'object' &&
          !(prev instanceof HTMLElement) &&
          !(next instanceof HTMLElement) &&
          Object.getPrototypeOf(prev) === Object.prototype &&
          Object.getPrototypeOf(next) === Object.prototype
        ) {
          const prevObjKeys = Object.keys(prev);
          const nextObjKeys = Object.keys(next);
          
          // Different number of keys
          if (prevObjKeys.length !== nextObjKeys.length) return false;
          
          // Check each key
          for (const k of prevObjKeys) {
            if ((prev as any)[k] !== (next as any)[k]) return false;
          }
        }
        // Simple values or complex objects we don't handle specially
        else {
          return false;
        }
      }
    }
    
    return true;
  };
  
  // Use the provided comparison function or the default one
  return memo(Component, areEqual || defaultAreEqual);
}

/**
 * Creates a memoized version of a component with a simple comparison function
 * that checks only specific props for changes
 * 
 * @param Component - The component to memoize
 * @param propsToCompare - List of prop names to check for equality
 * @returns Memoized component that only re-renders when specified props change
 */
export function withShallowMemoization<P extends object>(
  Component: ComponentType<P>,
  propsToCompare: Array<keyof P>
): React.MemoExoticComponent<ComponentType<P>> {
  return memo(Component, (prevProps, nextProps) => {
    // Check only the specified props
    for (const key of propsToCompare) {
      if (prevProps[key] !== nextProps[key]) {
        return false;
      }
    }
    return true;
  });
}

export default withMemoization;