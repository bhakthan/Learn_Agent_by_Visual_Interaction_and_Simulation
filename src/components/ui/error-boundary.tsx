import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, Bug } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component to catch JavaScript errors in child component tree
 * and prevent them from crashing the entire application
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { 
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Filter out ResizeObserver errors to prevent logging noise
    if (error.message && (
      error.message.includes("ResizeObserver loop") || 
      error.message.includes("ResizeObserver was created") ||
      error.message.includes("undelivered notifications") ||
      error.message.includes("ResizeObserver completed")
    )) {
      // For ResizeObserver errors, just reset the error state silently
      this.setState({ 
        hasError: false,
        error: null,
        errorInfo: null
      });
      
      // Trigger a resize event to help ReactFlow recover
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
      
      return;
    }
    
    // Handle other errors normally
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = (): void => {
    // Reset the error boundary state
    this.setState({ 
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Call the optional onReset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Check for ResizeObserver errors and handle them silently
      if (this.state.error && this.state.error.message && (
        this.state.error.message.includes("ResizeObserver loop") || 
        this.state.error.message.includes("ResizeObserver was created")
      )) {
        // For ResizeObserver errors, render the children and recover silently
        this.setState({ hasError: false, error: null, errorInfo: null });
        return this.props.children;
      }
      
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <Alert variant="destructive" className="my-4">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle className="ml-2">Something went wrong</AlertTitle>
          <AlertDescription className="ml-2">
            <div className="mt-2 text-sm text-muted-foreground">
              {this.state.error && (
                <p className="font-mono">{this.state.error.toString()}</p>
              )}
            </div>
            <div className="mt-2">
              <Button 
                onClick={this.handleReset}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Bug size={16} />
                Reset and try again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };