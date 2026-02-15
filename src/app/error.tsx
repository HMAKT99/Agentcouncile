"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="card">
        <h1 className="font-heading text-3xl font-bold mb-4">
          Something went <span className="text-red-600">wrong</span>
        </h1>
        <p className="text-muted mb-8">
          The Council has encountered an unexpected error. Even unions have bad days.
        </p>
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
      </div>
    </div>
  );
}
