import Link from "next/link";
import { PawIcon } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="container-site grid min-h-[60vh] place-items-center py-16 text-center">
      <div>
        <PawIcon className="mx-auto size-16 text-coral" />
        <h1 className="mt-6 font-display text-4xl font-extrabold text-slate">This page wandered off</h1>
        <p className="mt-3 text-muted">We couldn&apos;t find what you were looking for.</p>
        <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn-primary">Go home</Link><Link href="/shop" className="btn-ghost">Browse the shop</Link></div>
      </div>
    </div>
  );
}
