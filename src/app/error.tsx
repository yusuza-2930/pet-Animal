"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-site grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <h1 className="font-display text-3xl font-extrabold text-slate">Something went wrong</h1>
        <p className="mt-3 text-muted">An unexpected error occurred. Please try again — your cart is safe.</p>
        <div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="btn-primary">Try again</button><Link href="/" className="btn-ghost">Go home</Link></div>
      </div>
    </div>
  );
}
