"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";

export function Toaster() {
  const { toasts, dismissToast } = useStore();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:right-5 sm:left-auto sm:items-end" role="region" aria-label="Notifications">
      {toasts.map((t) => {
        const Icon = t.tone === "error" ? AlertCircle : t.tone === "info" ? Info : CheckCircle2;
        return (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className="glass pointer-events-auto flex w-full max-w-sm animate-[toast-in_.35s_cubic-bezier(0.16,1,0.3,1)] items-center gap-3 rounded-2xl py-3 pr-2 pl-4 text-sm text-ink shadow-lift transition-all duration-300"
          >
            <Icon className={`size-5 shrink-0 ${t.tone === "error" ? "text-error" : t.tone === "info" ? "text-slate" : "text-success"}`} aria-hidden />
            <span className="flex-1 font-medium">{t.message}</span>
            {t.action && (
              <button onClick={() => { t.action!.onClick(); dismissToast(t.id); }} className="rounded-full px-3 py-1.5 text-[13px] font-semibold text-slate underline-offset-2 hover:underline active:scale-95">
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismissToast(t.id)} className="grid size-8 place-items-center rounded-full transition-colors hover:bg-black/5 active:scale-90" aria-label="Dismiss notification">
              <X className="size-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
