import ErrorBoundary from '@/components/ErrorBoundary';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Route-level error boundary
 * Wraps individual pages to prevent full app crash
 * Use as: <RouteErrorBoundary><PageComponent /></RouteErrorBoundary>
 */
export default function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 bg-background">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h1 className="text-2xl font-bold text-foreground">Something went wrong on this page</h1>
          <p className="text-sm text-muted-foreground max-w-md text-center">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </p>
          <Button onClick={reset} className="mt-2">
            Try again
          </Button>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}