/**
 * Global type definitions for the application
 */

// Define spark API types
declare global {
  interface Window {
    // Spark API
    spark: {
      llmPrompt: (strings: TemplateStringsArray, ...values: any[]) => string;
      llm: (prompt: string, modelName?: string, jsonMode?: boolean) => Promise<string>;
      user: () => Promise<{
        avatarUrl: string;
        email: string;
        id: string;
        isOwner: boolean;
        login: string;
      }>;
      kv: {
        keys: () => Promise<string[]>;
        get: <T>(key: string) => Promise<T | undefined>;
        set: <T>(key: string, value: T) => Promise<void>;
        delete: (key: string) => Promise<void>;
      };
    };
    
    // ReactFlow-specific globals
    __reactFlowInstance?: any;
    
    // ResizeObserver error tracking
    __resizeObserverErrorCount?: number;
    __resizeRecoveryScheduled?: boolean;
    __lastResizeObserverError?: number;
    
    // Flow handlers
    fitView?: () => void;
    
    // Fix and recovery functions
    fixReactFlow?: () => void;
    
    // Type definitions for standard functions to make TypeScript happy
    requestAnimationFrame(callback: FrameRequestCallback): number;
    cancelAnimationFrame(handle: number): void;
  }
  
  // Add to EventTarget interface to support custom event handling
  interface WindowEventMap {
    'flow-force-fitview': Event;
    'flow-force-stabilize': CustomEvent<{ timestamp: number; recovery: boolean; attempt: number }>;
    'layout-update': Event;
    'content-resize': Event;
  }
}

// Export empty object to make this a module
export {};