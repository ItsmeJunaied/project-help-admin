"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { dismissToast, subscribeToasts, type Toast } from "@/lib/toast";

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToasts(setToasts);
    return () => unsubscribe();
  }, []);

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-3 px-4 sm:items-end sm:px-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-line/10 bg-surface-2 p-4 shadow-lg"
        >
          {t.variant === "error" ? (
            <XCircle aria-hidden size={20} className="mt-0.5 shrink-0 text-red-400" />
          ) : (
            <CheckCircle2 aria-hidden size={20} className="mt-0.5 shrink-0 text-accent" />
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-heading">{t.title}</p>
            {t.description && <p className="mt-1 text-sm text-body">{t.description}</p>}
          </div>
          <button
            type="button"
            onClick={() => dismissToast(t.id)}
            aria-label="Dismiss notification"
            className="text-body hover:text-heading"
          >
            <X aria-hidden size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
