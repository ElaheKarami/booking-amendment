import type { ReactNode } from "react";
import type { ToastType } from "./ToastBanner";

export interface ToastItem {
  id: string;
  type: ToastType;
  description: ReactNode | string[];
  linkHref?: string;
  linkText?: string;
  duration: number; // ms; 0 = sticky (no auto-dismiss)
}

export interface ShowMessageOptions {
  duration?: number;
  linkHref?: string;
  linkText?: string;
  id?: string;
}

// Auto-dismiss defaults per type (ms). Loading is sticky until dismissed/replaced.
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: 8000,
  loading: 0,
};

// Module-level store so `showMessage` is callable from anywhere — including
// @erp/api-core's error handling wired via configureApiCore({ onErrorMessages }).
let toasts: ToastItem[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
let counter = 0;

function emit(): void {
  toasts = [...toasts];
  listeners.forEach((listener) => listener());
}

function scheduleDismiss(id: string, duration: number): void {
  if (duration <= 0) return;
  const timer = setTimeout(() => dismissMessage(id), duration);
  (timer as { unref?: () => void })?.unref?.();
  timers.set(id, timer);
}

/**
 * Imperatively show a toast. Returns the toast id (reuse it to update/replace).
 * @example showMessage("error", ["Field is required"]);
 */
export function showMessage(
  type: ToastType,
  description: ReactNode | string[],
  options: ShowMessageOptions = {},
): string {
  const id = options.id ?? `toast-${++counter}`;
  const duration = options.duration ?? DEFAULT_DURATIONS[type];

  const existingTimer = timers.get(id);
  if (existingTimer) clearTimeout(existingTimer);

  toasts = [
    ...toasts.filter((t) => t.id !== id),
    { id, type, description, linkHref: options.linkHref, linkText: options.linkText, duration },
  ];
  emit();
  scheduleDismiss(id, duration);
  return id;
}

export function dismissMessage(id: string): void {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

export function clearMessages(): void {
  timers.forEach((timer) => clearTimeout(timer));
  timers.clear();
  toasts = [];
  emit();
}

// Store hooks for ToastViewport (useSyncExternalStore-compatible).
export function subscribeToasts(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts(): ToastItem[] {
  return toasts;
}
