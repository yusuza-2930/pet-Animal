import Link from "next/link";
import { Star } from "lucide-react";
import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";

export function Stars({ value, size = 14, label }: { value: number; size?: number; label?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label ?? `Rated ${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} style={{ width: size, height: size }} className={i <= Math.round(value) ? "fill-[#F5B544] text-[#F5B544]" : "fill-line text-line"} aria-hidden />
      ))}
    </span>
  );
}

export function EmptyState({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line bg-pale/50 px-6 py-14 text-center">
      <div className="mb-4 grid size-16 place-items-center rounded-full bg-white text-slate shadow-soft">{icon}</div>
      <h2 className="text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-sm text-[15px] text-muted">{text}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-3.5" aria-hidden />}
            {it.href ? <Link href={it.href} className="hover:text-ink">{it.label}</Link> : <span aria-current="page" className="font-medium text-ink">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function PageHeader({ title, sub, crumbs }: { title: string; sub?: string; crumbs?: { label: string; href?: string }[] }) {
  return (
    <div className="bg-pale">
      <div className="container-site py-10 md:py-14">
        {crumbs && <Breadcrumbs items={crumbs} />}
        <h1 className="mt-3 text-[clamp(1.9rem,1.3rem+2vw,3rem)] font-extrabold leading-tight text-slate">{title}</h1>
        {sub && <p className="mt-2 max-w-2xl text-muted">{sub}</p>}
      </div>
    </div>
  );
}

export function DemoNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#F0D9A8] bg-[#FFF8E8] px-4 py-3 text-[13px] leading-relaxed text-[#7A5512]" role="note">
      <strong className="font-semibold">Demo mode: </strong>
      {children}
    </div>
  );
}
