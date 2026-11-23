"use client";

import { useEffect, useRef, useState, type ReactNode, type ElementType } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUp } from "lucide-react";
import { PawIcon } from "@/components/ui/Logo";
import { siteConfig } from "@/config/site";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Global Scroll Progress Bar
 * Fixed at the very top of the viewport (or below header), glowing coral bar
 */
export function ScrollProgress() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let rafId = 0;
    const updateProgress = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, Math.max(0, scrollY / docHeight)) : 0;
      bar.style.transform = `scaleX(${progress})`;
      rafId = requestAnimationFrame(updateProgress);
    };

    rafId = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed top-0 inset-x-0 z-[60] h-[2.5px] bg-transparent"
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-gradient-to-r from-coral via-coral-dark to-coral shadow-[0_0_8px_rgba(241,125,131,0.6)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

/**
 * Scroll reveal. Content renders visible on the server; elements below the fold
 * animate in with silky power3 easing and stagger children marked with [data-reveal-item].
 */
export function Reveal({
  children,
  as,
  className,
  stagger = 0.08,
  y = 28,
  id,
  ...rest
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  stagger?: number;
  y?: number;
  id?: string;
  "aria-labelledby"?: string;
  "aria-label"?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    const ctx = gsap.context(() => {
      const items = el.querySelectorAll("[data-reveal-item]");
      const targets = items.length ? items : [el];
      gsap.set(targets, { autoAlpha: 0, y });
      ScrollTrigger.create({
        trigger: el,
        start: "top 86%",
        once: true,
        onEnter: () =>
          gsap.to(targets, {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger,
            clearProps: "transform,opacity,visibility",
          }),
      });
    }, el);

    return () => ctx.revert();
  }, [stagger, y]);

  return (
    <Tag ref={ref} className={className} id={id} {...rest}>
      {children}
    </Tag>
  );
}

/**
 * ScrollParallax: Subtle scroll-driven parallax movement for decorative/editorial elements.
 */
export function ScrollParallax({
  children,
  speed = 12,
  className = "",
}: {
  children: ReactNode;
  speed?: number; // percentage of offset (-30 to +30)
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { yPercent: -speed },
        {
          yPercent: speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [speed]);

  return (
    <div ref={ref} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}

/** Magnetic CTA: translation proportional to pointer offset from centre, clamped. */
export function Magnetic({
  children,
  strength = 0.25,
  max = 8,
}: {
  children: ReactNode;
  strength?: number;
  max?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !window.matchMedia("(pointer: fine)").matches) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    const clamp = gsap.utils.clamp(-max, max);

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo(clamp((e.clientX - (r.left + r.width / 2)) * strength));
      yTo(clamp((e.clientY - (r.top + r.height / 2)) * strength));
    };

    const leave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [strength, max]);

  return <span ref={ref} className="inline-flex will-change-transform">{children}</span>;
}

/** Gentle 3D Tilt container for product cards (desktop fine pointers only). */
export function TiltCard({
  children,
  className = "",
  maxTilt = 5,
}: {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced() || !window.matchMedia("(pointer: fine)").matches) return;

    let rxTo: gsap.QuickToFunc | null = null;
    let ryTo: gsap.QuickToFunc | null = null;

    try {
      rxTo = gsap.quickTo(el, "rotationX", { duration: 0.35, ease: "power2.out" });
      ryTo = gsap.quickTo(el, "rotationY", { duration: 0.35, ease: "power2.out" });
    } catch {}

    const onMove = (e: PointerEvent) => {
      if (!rxTo || !ryTo) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width; // 0 to 1
      const py = (e.clientY - r.top) / r.height; // 0 to 1
      const rotY = (px - 0.5) * maxTilt * 2;
      const rotX = -(py - 0.5) * maxTilt * 2;
      rxTo(rotX);
      ryTo(rotY);
    };

    const onLeave = () => {
      if (rxTo && ryTo) {
        rxTo(0);
        ryTo(0);
      }
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [maxTilt]);

  return (
    <div
      ref={ref}
      className={`transform-gpu [perspective:1000px] [transform-style:preserve-3d] ${className}`}
    >
      {children}
    </div>
  );
}

/** Subtle ring follower for fine pointers only. Native cursor is never hidden. */
export function CustomCursor() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia("(pointer: fine) and (hover: hover)").matches && !prefersReduced());
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return;
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const interactive = (e.target as HTMLElement).closest("a, button, [role=option]");
      el.style.setProperty("--s", interactive ? "1.8" : "1");
      el.style.opacity = "1";
    };

    const hide = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", hide);
    return () => {
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", hide);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[90] opacity-0 transition-opacity duration-300"
    >
      <div
        className="-mt-4 -ml-4 size-8 rounded-full border border-slate/40 bg-coral/5 transition-transform duration-300 ease-out"
        style={{ transform: "scale(var(--s, 1))" }}
      />
    </div>
  );
}

/** Brief branded loader. Has a CSS-only timeout fallback so it can never block the page. */
export function LoadingScreen() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const finish = () => {
      (window as unknown as { __scpLoaded?: boolean }).__scpLoaded = true;
      window.dispatchEvent(new Event("scp:loaded"));
      setGone(true);
    };

    if (!el || prefersReduced()) {
      finish();
      return;
    }

    const paw = el.querySelector("[data-paw-badge]");
    const bar = el.querySelector("[data-bar]");

    const tl = gsap.timeline({ onComplete: finish, defaults: { ease: "power2.inOut" } });

    if (paw) {
      tl.fromTo(paw, { scale: 0.85, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.7)" });
    }
    if (bar) {
      tl.to(bar, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.2");
    }
    tl.to(el, { autoAlpha: 0, scale: 1.02, duration: 0.45, ease: "power2.out" }, "+=0.08");

    return () => {
      tl.kill();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={ref}
      className="scp-loader fixed inset-0 z-[100] grid place-items-center bg-white"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-4">
        <span
          data-paw-badge
          className="grid size-14 place-items-center rounded-2xl bg-coral text-white shadow-soft"
        >
          <PawIcon className="size-8" />
        </span>
        <span className="font-display text-sm font-extrabold tracking-[0.2em] text-slate uppercase">
          {siteConfig.name}
        </span>
        <span className="h-0.5 w-32 overflow-hidden rounded-full bg-line">
          <span
            data-bar
            className="block h-full origin-left scale-x-0 bg-coral shadow-[0_0_8px_rgba(241,125,131,0.5)]"
          />
        </span>
      </div>
      <style>{`.scp-loader{animation:scp-loader-out .4s ease 2.2s forwards}@keyframes scp-loader-out{to{opacity:0;visibility:hidden}}`}</style>
    </div>
  );
}

/** BackToTop button with smooth appearance and circular scroll indicator */
export function BackToTop() {
  const [show, setShow] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;
      setScrollPct(pct);
      setShow(scrollY > 600);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const circumference = 2 * Math.PI * 18; // radius = 18
  const strokeDashoffset = circumference - (scrollPct / 100) * circumference;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" })}
      aria-label="Back to top"
      tabIndex={show ? 0 : -1}
      className={`glass fixed right-4 bottom-20 z-30 grid size-12 place-items-center rounded-full text-slate shadow-soft transition-all duration-300 hover:scale-105 active:scale-95 sm:right-6 sm:bottom-6 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <svg className="absolute inset-0 size-12 -rotate-90 pointer-events-none" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="rgba(241, 125, 131, 0.2)"
          strokeWidth="2.5"
        />
        <circle
          cx="22"
          cy="22"
          r="18"
          fill="none"
          stroke="#f17d83"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-[stroke-dashoffset] duration-150"
        />
      </svg>
      <ArrowUp className="size-4 text-slate transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
}

export function Marquee({ items }: { items: readonly string[] }) {
  const row = [...items, ...items];
  return (
    <div
      className="group overflow-hidden border-y border-line bg-white py-3.5"
      aria-label={items.join(", ")}
      role="marquee"
    >
      <div
        className="flex w-max animate-marquee gap-10 group-hover:[animation-play-state:paused]"
        aria-hidden
      >
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 gap-10">
            {row.map((t, i) => (
              <span
                key={`${k}-${i}`}
                className="inline-flex items-center gap-10 font-display text-lg font-extrabold whitespace-nowrap text-slate/80 transition-colors hover:text-slate sm:text-xl"
              >
                {t}
                <PawIcon className="size-5 text-coral transition-transform group-hover:scale-110" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
