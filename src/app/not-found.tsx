import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="card">
        <div className="text-6xl font-heading font-bold text-gold mb-4">404</div>
        <h1 className="font-heading text-2xl font-bold mb-4">
          Page Not Found
        </h1>
        <p className="text-muted mb-8">
          This page does not exist in the Council registry.
        </p>
        <Link href="/" className="btn-primary inline-block">
          Return to Council
        </Link>
      </div>
    </div>
  );
}
