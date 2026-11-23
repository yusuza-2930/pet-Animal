"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

function Portal({ children }: { children: ReactNode }) {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m ? createPortal(children, document.body) : null;
}
import { X } from "lucide-react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Shared dialog behaviour: Escape closes, focus trapped, focus restored, scroll locked. */
function useDialog(open: boolean, onClose: () => void, panel: React.RefObject<HTMLDivElement | null>) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = "hidden";
    document.body.style.paddingRight = `${sbw}px`;
    const t = setTimeout(() => {
      const el = panel.current?.querySelector<HTMLElement>("[data-autofocus]") ?? panel.current?.querySelector<HTMLElement>(FOCUSABLE);
      el?.focus();
    }, 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.stopPropagation(); onCloseRef.current(); }
      if (e.key === "Tab" && panel.current) {
        const items = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null);
        if (!items.length) return;
        const first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
      prev?.focus?.();
    };
  }, [open, panel]);
}

interface DrawerProps { open: boolean; onClose: () => void; title: string; side?: "left" | "right"; children: ReactNode; footer?: ReactNode; className?: string }

export function Drawer({ open, onClose, title, side = "right", children, footer, className = "" }: DrawerProps) {
  const panel = useRef<HTMLDivElement>(null);
  useDialog(open, onClose, panel);
  const hidden = side === "right" ? "translate-x-full" : "-translate-x-full";
  return (
    <Portal>
    <div className="fixed inset-0 z-[60]" style={{ visibility: open ? "visible" : "hidden", transition: `visibility 0s linear ${open ? "0s" : "0.35s"}` }} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 ease-out ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute top-0 ${side === "right" ? "right-0" : "left-0"} flex h-full w-full max-w-[440px] flex-col bg-white shadow-2xl transition-transform duration-[400ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : hidden} ${className}`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="grid size-10 place-items-center rounded-full transition-colors hover:bg-pale active:scale-95" aria-label={`Close ${title}`}>
            <X className="size-5 transition-transform duration-200 hover:rotate-90" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="border-t border-line p-5">{footer}</div>}
      </div>
    </div>
    </Portal>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useDialog(open, onClose, panel);
  if (!open) return null;
  return (
    <Portal>
    <div className="fixed inset-0 z-[70] grid place-items-end sm:place-items-center sm:p-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm transition-opacity duration-300 animate-[fade-up_.25s_ease]" onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-label={title} className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px] animate-[modal-zoom_.35s_cubic-bezier(0.16,1,0.3,1)]">
        <button onClick={onClose} className="glass absolute top-3 right-3 z-10 grid size-10 place-items-center rounded-full transition-all duration-200 hover:scale-105 active:scale-95" aria-label="Close dialog">
          <X className="size-5 transition-transform duration-200 hover:rotate-90" />
        </button>
        {children}
      </div>
    </div>
    </Portal>
  );
}
