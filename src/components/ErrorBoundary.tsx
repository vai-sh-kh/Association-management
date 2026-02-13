import { Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error;
  info?: { componentStack: string };
  reset?: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light p-4">
      <div className="w-full max-w-lg card">
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 w-12 h-12 flex items-center justify-center bg-[#fef2f2]"
            aria-hidden
          >
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-text-main text-xl font-bold mb-1">
              Something went wrong
            </h1>
            <p className="text-text-secondary text-base mb-4">
              An unexpected error occurred. You can try again or return to the
              dashboard.
            </p>
            {error?.message && (
              <pre
                className="text-sm text-text-muted bg-surface-gray p-4 mb-4 overflow-x-auto wrap-break-word"
                role="alert"
              >
                {error.message}
              </pre>
            )}
            <div className="flex flex-wrap gap-3">
              {reset && (
                <button
                  type="button"
                  onClick={reset}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" aria-hidden />
                  Try again
                </button>
              )}
              <Link
                to="/"
                className="btn-secondary inline-flex items-center gap-2"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
