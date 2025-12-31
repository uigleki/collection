import { type ReactNode } from "react";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "./components/ErrorFallback";

interface ErrorBoundaryProps {
  children: ReactNode;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log to console in development
        console.error("Error caught by boundary:", error, errorInfo);

        // In production, send to error tracking service
        // Example: Sentry.captureException(error);
      }}
      onReset={() => {
        // Reset any state that might have caused the error
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
