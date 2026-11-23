import Link from "next/link";
import { siteConfig } from "@/config/site";

export function PawIcon({ className = "", title, ...rest }: { className?: string; title?: string } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} fill="currentColor" {...rest}>
      {title && <title>{title}</title>}
      <ellipse cx="9" cy="11" rx="3.2" ry="4.2" transform="rotate(-18 9 11)" />
      <ellipse cx="23" cy="11" rx="3.2" ry="4.2" transform="rotate(18 23 11)" />
      <ellipse cx="13.4" cy="6.4" rx="3" ry="4" />
      <ellipse cx="18.6" cy="6.4" rx="3" ry="4" />
      <path d="M16 15c-4.6 0-8.4 4.7-8.4 8.2 0 2.6 2 3.8 4.3 3.8 1.7 0 2.6-.8 4.1-.8s2.4.8 4.1.8c2.3 0 4.3-1.2 4.3-3.8 0-3.5-3.8-8.2-8.4-8.2Z" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  const [first, ...rest] = siteConfig.name.split(" ");
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 ${className}`} aria-label={`${siteConfig.name} — home`}>
      <span className="grid size-10 place-items-center rounded-2xl bg-coral text-white shadow-soft transition-transform duration-300 group-hover:-rotate-6">
        <PawIcon className="size-6" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="flex gap-[0.28em] font-display text-[17px] font-extrabold tracking-tight text-slate">
          {[first, ...rest.slice(0, -1)].map((w) => <span key={w}>{w}</span>)}
        </span>
        <span className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.28em] text-coral">
          {rest.slice(-1)[0]}
        </span>
      </span>
    </Link>
  );
}
