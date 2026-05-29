import ErrorBoundary from '@/components/ErrorBoundary';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      fallback={({ error, reset }) => (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Something went wrong</h2>
            <p className="text-sm text-muted-foreground max-w-sm">
              {error?.message || 'An unexpected error occurred on this page.'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={reset} size="sm" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try again
            </Button>
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link to="/dashboard"><Home className="w-4 h-4" /> Dashboard</Link>
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
}