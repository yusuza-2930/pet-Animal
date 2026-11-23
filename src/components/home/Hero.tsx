"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, BadgeCheck, Headset, RotateCcw, Truck } from "lucide-react";
import { PawIcon } from "@/components/ui/Logo";
import { Magnetic } from "@/components/motion/Motion";

const VIDEO_SRC = "https://vibology-ai.github.io/vibology-video-media/Dogs_catching.mp4";
const POSTER_SRC = "/images/hero-video-poster.jpg";
const DEFAULT_DURATION = 10;

const benefits = [
  { icon: BadgeCheck, title: "Genuine products", text: "Sourced from trusted brands" },
  { icon: Truck, title: "Fast delivery", text: "Dispatched within 48 hours" },
  { icon: RotateCcw, title: "Easy returns", text: "14 days on unused items" },
  { icon: Headset, title: "Friendly support", text: "Real people, real help" },
];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function Hero() {
  const containerRef = useRef<HTMLElement>(null);
  const pinStageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(DEFAULT_DURATION);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const container = containerRef.current;
    const stage = pinStageRef.current;
    const video = videoRef.current;
    if (!container || !stage || !video) return;

    let targetTime = 0;
    let rafId = 0;
    let st: ScrollTrigger | null = null;
    let currentDur = DEFAULT_DURATION;

    // Synchronize video duration and prime first frame
    const handleVideoReady = () => {
      if (video.duration && !isNaN(video.duration) && video.duration > 0) {
        currentDur = video.duration;
        setDuration(video.duration);
      }
      setIsReady(true);
      // Nudge currentTime slightly so browser decodes and paints frame 0 over poster immediately
      if (video.currentTime === 0 && targetTime === 0) {
        try {
          video.currentTime = 0.001;
        } catch { }
      }
      ScrollTrigger.refresh();
    };

    if (video.readyState >= 1) {
      handleVideoReady();
    } else {
      video.addEventListener("loadedmetadata", handleVideoReady, { once: true });
      video.addEventListener("loadeddata", handleVideoReady, { once: true });
      video.addEventListener("canplay", handleVideoReady, { once: true });
      try {
        video.load();
      } catch { }
    }

    // Video error fallback
    const handleVideoError = () => {
      console.warn("Video failed to load, falling back to static poster.");
      setIsReady(true);
    };
    video.addEventListener("error", handleVideoError, { once: true });

    // Smooth RAF update loop: synchronizes video.currentTime to targetTime
    const renderLoop = () => {
      if (video && video.readyState >= 1) {
        const diff = Math.abs(video.currentTime - targetTime);
        if (diff > 0.02 && !video.seeking) {
          try {
            video.currentTime = targetTime;
          } catch { }
        }
      }
      rafId = requestAnimationFrame(renderLoop);
    };
    rafId = requestAnimationFrame(renderLoop);

    const ctx = gsap.context(() => {
      // Content entrance animation
      const items = stage.querySelectorAll("[data-hero-item]");
      const card = stage.querySelector("[data-hero-card]");
      gsap.set(items, { autoAlpha: 0, y: 24 });
      if (card) gsap.set(card, { autoAlpha: 0, y: 20 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(items, { clearProps: "transform,opacity,visibility" });
          if (card) gsap.set(card, { clearProps: "transform,opacity,visibility" });
        },
      });
      tl.to(items, { autoAlpha: 1, y: 0, duration: 0.85, stagger: 0.08 }, 0.15)
        .to(card, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.45);

      // Pin and scrub configuration
      const isMobile = window.innerWidth < 1024;
      const scrollDistance = isMobile ? 1600 : 2400;

      st = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: `+=${scrollDistance}`,
        pin: stage,
        pinSpacing: true,
        scrub: 0.15,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = Math.max(0, Math.min(1, self.progress));
          setProgress(p);
          const dur = video.duration && !isNaN(video.duration) && video.duration > 0 ? video.duration : currentDur;
          targetTime = Math.min(dur - 0.001, Math.max(0, p * dur));
        },
        onLeave: () => {
          const dur = video.duration && !isNaN(video.duration) && video.duration > 0 ? video.duration : currentDur;
          targetTime = Math.max(0, dur - 0.001);
          if (video && !video.seeking) {
            try { video.currentTime = targetTime; } catch { }
          }
        },
        onLeaveBack: () => {
          targetTime = 0.001;
          if (video && !video.seeking) {
            try { video.currentTime = 0.001; } catch { }
          }
        },
      });
    }, container);

    // Parallax paws on pointer move (decorative)
    let pawRaf = 0;
    const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
    const paws = [...stage.querySelectorAll<HTMLElement>("[data-paw]")];
    const fine = window.matchMedia("(pointer: fine)").matches;
    const onMove = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      target.x = gsap.utils.clamp(-1, 1, ((e.clientX - r.left) / r.width) * 2 - 1);
      target.y = gsap.utils.clamp(-1, 1, ((e.clientY - r.top) / r.height) * 2 - 1);
    };
    const onLeave = () => { target.x = 0; target.y = 0; };
    const tick = () => {
      cur.x += (target.x - cur.x) * 0.08;
      cur.y += (target.y - cur.y) * 0.08;
      paws.forEach((p) => {
        const d = Number(p.dataset.paw);
        p.style.transform = `translate3d(${cur.x * d}px, ${cur.y * d}px, 0) rotate(${p.dataset.rot}deg)`;
      });
      pawRaf = requestAnimationFrame(tick);
    };
    if (fine) {
      stage.addEventListener("pointermove", onMove);
      stage.addEventListener("pointerleave", onLeave);
      pawRaf = requestAnimationFrame(tick);
    }

    return () => {
      ctx.revert();
      if (st) st.kill();
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(pawRaf);
      video.removeEventListener("loadedmetadata", handleVideoReady);
      video.removeEventListener("loadeddata", handleVideoReady);
      video.removeEventListener("canplay", handleVideoReady);
      video.removeEventListener("error", handleVideoError);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <section
      ref={containerRef}
      aria-labelledby="hero-title"
      className="relative w-full overflow-hidden bg-slate-950 isolate"
    >
      {/* Pinned Viewport Stage */}
      <div
        ref={pinStageRef}
        className="relative flex h-[100svh] min-h-[640px] w-full flex-col justify-between overflow-hidden"
      >
        {/* Full-bleed Cinematic Video Background (Layer 0) */}
        <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-700 ease-out ${isReady ? "opacity-100" : "opacity-0"}`}>
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            poster={POSTER_SRC}
            playsInline
            muted
            preload="auto"
            className="h-full w-full object-cover object-[center_35%] lg:object-center pointer-events-none"
            aria-label="Cinematic slow-motion video of dogs playfully catching treats"
          />
        </div>

        {/* Cinematic Readability Gradients & Vignettes (Layer 10) */}
        {/* Left scrim gradient for high text contrast without obscuring dogs on right */}
        <div
          className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-r from-slate-950/85 via-slate-950/50 to-transparent sm:w-4/5 lg:w-3/5"
          aria-hidden
        />
        {/* Top bar vignette */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-slate-950/70 via-slate-950/20 to-transparent"
          aria-hidden
        />
        {/* Bottom vignette */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-36 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent"
          aria-hidden
        />

        {/* Decorative Floating Paws (Layer 10) */}
        <PawIcon className="pointer-events-none absolute top-12 left-[52%] z-10 size-14 text-white/20" data-paw="10" data-rot="-14" />
        <PawIcon className="pointer-events-none absolute bottom-24 left-8 z-10 size-20 text-white/15" data-paw="16" data-rot="18" />
        <PawIcon className="pointer-events-none absolute top-1/4 right-8 z-10 hidden size-12 text-white/20 lg:block" data-paw="8" data-rot="22" />

        {/* Top-Right Cinematic Scrub HUD (Layer 30) */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 sm:top-6 sm:right-8">
          <div className="flex items-center gap-2.5 rounded-full border border-white/20 bg-slate-900/75 px-3.5 py-1.5 text-[11px] font-semibold text-white/90 shadow-soft backdrop-blur-md">
            <span className="size-2 rounded-full bg-coral animate-pulse" aria-hidden />
            <span className="hidden sm:inline font-mono text-white/80">
              {formatTime(progress * duration)} / {formatTime(duration)}
            </span>
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-white/20 sm:w-20" aria-hidden>
              <div
                className="h-full bg-coral transition-[width] duration-75"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[10.5px] text-white/70">
              {Math.round(progress * 100)}%
            </span>
          </div>
        </div>

        {/* Main Foreground Content: Left-Aligned Headline matching Image 2 (Layer 20) */}
        <div className="container-site relative z-20 flex flex-1 flex-col justify-start pt-4 sm:pt-8 lg:justify-center lg:pt-8 pb-24 lg:pb-28">
          <div className="max-w-xl lg:max-w-2xl">
            {/* Eyebrow Badge */}
            <p
              data-hero-item
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md"
            >
              <span className="size-1.5 rounded-full bg-coral animate-pulse" aria-hidden />
              New season essentials · Up to 25% off
            </p>

            {/* Main Headline */}
            <h1
              id="hero-title"
              data-hero-item
              className="mt-3.5 sm:mt-5 font-display text-[clamp(2rem,1.2rem+2.6vw,3.6rem)] font-extrabold leading-[1.08] tracking-[-0.025em] text-white drop-shadow-sm"
            >
              <span className="block whitespace-nowrap">Everything Your Pet</span>
              <span className="block">Needs to</span>
              <span className="relative inline-block text-coral">
                Feel Loved.
                {/* Decorative curved underline swoosh matching Image 2 */}
                <svg
                  className="absolute -bottom-2 left-0 w-full text-coral overflow-visible pointer-events-none"
                  viewBox="0 0 240 18"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path
                    d="M3 13 C 65 3, 175 3, 237 11"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
          </div>
        </div>

        {/* CTA Buttons: Centered Directly Beneath the Dog matching Image 2 (Layer 20) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-36 sm:bottom-24 lg:bottom-24 z-20 flex justify-center px-4">
          <div data-hero-item className="pointer-events-auto flex flex-row items-center justify-center gap-3 sm:gap-4">
            <Magnetic>
              <Link
                href="/shop?sort=popularity"
                className="btn-coral min-h-12 px-6 sm:px-8 sm:min-h-13 text-[14px] sm:text-[15px] font-semibold shadow-lift active:scale-95 transition-all duration-200 whitespace-nowrap"
              >
                Shop Bestsellers <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Magnetic>
            <Link
              href="#collections"
              className="btn min-h-12 border border-white/40 bg-white/15 px-6 sm:px-8 sm:min-h-13 text-[14px] sm:text-[15px] font-semibold text-white backdrop-blur-md transition-all duration-200 hover:bg-white hover:text-slate active:scale-95 shadow-soft whitespace-nowrap"
            >
              Explore Collections
            </Link>
          </div>
        </div>

        {/* Floating Glass Promise Card (Layer 20 - Desktop Bottom Right) */}
        <div
          data-hero-card
          className="absolute right-8 bottom-10 z-20 hidden w-[310px] rounded-[22px] border border-white/20 bg-slate-900/85 p-4 text-white shadow-lift backdrop-blur-xl xl:block"
        >
          <p className="mb-2.5 text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
            The Sneak Connect promise
          </p>
          <ul className="grid grid-cols-2 gap-3">
            {benefits.map((b) => (
              <li key={b.title} className="flex items-start gap-2">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 text-white">
                  <b.icon className="size-3.5" aria-hidden />
                </span>
                <span className="text-[11.5px] leading-tight font-semibold text-white/95">
                  {b.title}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Mobile / Tablet Benefit Strip (Layer 20 - Bottom Bar) */}
        <div className="relative z-20 w-full px-4 pb-4 sm:px-6 xl:hidden">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {benefits.map((b) => (
              <li
                key={b.title}
                className="flex items-center gap-2 rounded-xl border border-white/15 bg-slate-900/80 p-2.5 text-white backdrop-blur-md"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/15 text-white">
                  <b.icon className="size-3.5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-bold text-white">{b.title}</span>
                  <span className="block truncate text-[10.5px] text-white/70">{b.text}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
