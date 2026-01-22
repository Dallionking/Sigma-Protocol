"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for graceful error handling in React
 *
 * Features:
 * - Catches render errors in child component tree
 * - Displays fallback UI with retry capability
 * - Logs errors to console for debugging
 * - Styled consistently with AgentFloor theme
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With custom fallback
 * <ErrorBoundary fallback={<CustomError />}>
 *   <MyComponent />
 * </ErrorBoundary>
 *
 * // With error callback
 * <ErrorBoundary onError={(error) => logToService(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // AC3: Log error to console
    console.error("[ErrorBoundary] Caught error:", error);
    console.error("[ErrorBoundary] Component stack:", errorInfo.componentStack);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // AC2 & AC4: Default fallback UI with retry button, styled with floor theme
      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-6 bg-floor-panel rounded-lg border border-floor-accent">
          <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-floor-accent">
            <AlertTriangle className="w-8 h-8 text-floor-highlight" />
          </div>

          <h2 className="text-lg font-semibold text-floor-text mb-2">
            Something went wrong
          </h2>

          <p className="text-floor-muted text-sm text-center mb-4 max-w-md">
            An unexpected error occurred. You can try again or refresh the page.
          </p>

          {/* Error message for debugging */}
          {this.state.error && (
            <div className="w-full max-w-md mb-4 p-3 bg-floor-bg rounded border border-floor-accent">
              <p className="text-xs font-mono text-floor-muted break-all">
                {this.state.error.message}
              </p>
            </div>
          )}

          {/* AC2: Retry button */}
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-floor-highlight text-white rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-floor-highlight focus:ring-offset-2 focus:ring-offset-floor-panel"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook-friendly wrapper for using error boundary with functional components
 * Provides a way to programmatically trigger errors for testing
 */
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;
