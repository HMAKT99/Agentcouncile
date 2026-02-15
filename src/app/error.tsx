"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Page error:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="card">
        <h1 className="font-heading text-3xl font-bold mb-4">
          Something went <span className="text-red-600">wrong</span>
        </h1>
        <p className="text-muted mb-6">
          The Council has encountered an unexpected error. Even unions have bad days.
        </p>
        {error.digest && (
          <p className="text-xs text-muted mb-6 font-mono">Error ID: {error.digest}</p>
        )}
        <div className="flex items-center justify-center gap-4">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <a href="/" className="btn-secondary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
