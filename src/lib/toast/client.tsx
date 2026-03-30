"use client";

import type { CSSProperties } from "react";
import toast, { type Toast as HotToast } from "react-hot-toast";

const baseStyle: CSSProperties = {
  background: "#18181b",
  color: "#fafafa",
  borderRadius: "0.5rem",
  boxShadow: "0 12px 40px -12px rgba(0, 0, 0, 0.55)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  fontSize: "14px",
  padding: "12px 16px",
  maxWidth: "min(100vw - 2rem, 22rem)",
};

const brandAccentStyle: CSSProperties = {
  ...baseStyle,
  borderLeft: "3px solid #f97316",
};

export function successToast(message: string) {
  return toast.success(message, {
    duration: 3500,
    position: "top-right",
    style: brandAccentStyle,
  });
}

/** Neutral notices with a dismiss (×) control. */
export function brandToast(message: string, options?: { id?: string; onDismiss?: () => void }) {
  const onDismiss = options?.onDismiss;
  return toast.custom(
    (t: HotToast) => (
      <div
        role="status"
        className="pointer-events-auto relative flex items-start gap-2 pr-2 font-sans text-sm leading-snug !text-zinc-50 shadow-lg"
        style={{
          ...brandAccentStyle,
          padding: "10px 40px 10px 14px",
        }}
      >
        <span className="min-w-0 flex-1 pt-0.5">{message}</span>
        <button
          type="button"
          className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-zinc-200 transition hover:bg-white/20 hover:text-white"
          onClick={() => {
            onDismiss?.();
            toast.dismiss(t.id);
          }}
          aria-label="Dismiss notification"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    ),
    {
      ...(options?.id != null ? { id: options.id } : {}),
      duration: 4000,
      position: "top-right",
    }
  );
}

export function errorToast(message: string) {
  return toast.error(message, {
    duration: 5000,
    position: "top-right",
    style: brandAccentStyle,
  });
}

export function loadingToast(message: string) {
  return toast.loading(message, {
    position: "top-right",
    style: brandAccentStyle,
  });
}

export function replaceLoadingWithSuccess(id: string, message: string) {
  toast.success(message, {
    id,
    duration: 3500,
    position: "top-right",
    style: brandAccentStyle,
  });
}

export function replaceLoadingWithError(id: string, message: string) {
  toast.error(message, {
    id,
    duration: 5000,
    position: "top-right",
    style: brandAccentStyle,
  });
}
