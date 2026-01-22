"use client";

import { useState } from "react";
import { ErrorBoundary, withErrorBoundary } from "./error-boundary";

/**
 * Test component that throws an error when triggered
 * Used for testing and demonstrating the ErrorBoundary component
 */
function BuggyComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Test error: This is a simulated render error");
  }
  return (
    <div className="p-4 bg-floor-accent rounded-lg">
      <p className="text-floor-text">Component rendered successfully!</p>
    </div>
  );
}

/**
 * Demo component showing ErrorBoundary in action
 */
export function ErrorBoundaryDemo() {
  const [triggerError, setTriggerError] = useState(false);
  const [key, setKey] = useState(0);

  const handleReset = () => {
    setTriggerError(false);
    setKey((k) => k + 1);
  };

  return (
    <div className="space-y-4 p-6 bg-floor-bg min-h-screen">
      <h1 className="text-2xl font-bold text-floor-text">Error Boundary Demo</h1>

      <div className="flex gap-4">
        <button
          onClick={() => setTriggerError(true)}
          className="px-4 py-2 bg-floor-highlight text-white rounded-lg hover:bg-opacity-90"
        >
          Trigger Error
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-floor-accent text-floor-text rounded-lg hover:bg-floor-panel"
        >
          Reset Demo
        </button>
      </div>

      <div className="mt-4">
        <ErrorBoundary
          key={key}
          onError={(error, info) => {
            console.log("[Demo] Error caught:", error.message);
            console.log("[Demo] Component stack:", info.componentStack);
          }}
          onReset={handleReset}
        >
          <BuggyComponent shouldThrow={triggerError} />
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Example of using the HOC wrapper
const WrappedBuggyComponent = withErrorBoundary(BuggyComponent, {
  onError: (error) => console.log("[HOC] Error:", error.message),
});

export { WrappedBuggyComponent };
