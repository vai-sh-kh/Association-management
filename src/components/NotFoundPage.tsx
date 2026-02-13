import { Link } from "@tanstack/react-router";
import { FileQuestion, Home } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light p-4">
      <div className="w-full max-w-lg card text-center">
        <div className="flex justify-center mb-4" aria-hidden>
          <div className="w-16 h-16 flex items-center justify-center bg-surface-gray">
            <FileQuestion className="w-8 h-8 text-text-muted" />
          </div>
        </div>
        <h1 className="text-text-main text-2xl font-bold mb-2">
          Page not found
        </h1>
        <p className="text-text-secondary text-base mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" aria-hidden />
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
