"use client";

import { useEffect } from "react";
import type { CalMode } from "@/lib/doctor/calendar-constants";

type Opts = {
  enabled?: boolean;
  mode: CalMode;
  onModeChange: (m: CalMode) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
  onQuickVisit: () => void;
  onFocusSearch: () => void;
  onToggleHelp: () => void;
  /** Close overlays (help, confirm move, quick visit) — never opens them */
  onEscape?: () => void;
};

function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (el.isContentEditable) return true;
  return Boolean(el.closest("[role='dialog'], [data-slot='dialog-content']"));
}

export function useCalendarKeyboard(opts: Opts) {
  const {
    enabled = true,
    mode,
    onModeChange,
    onToday,
    onPrev,
    onNext,
    onQuickVisit,
    onFocusSearch,
    onToggleHelp,
    onEscape,
  } = opts;

  useEffect(() => {
    if (!enabled) return;

    function onKeyDown(e: KeyboardEvent) {
      if (isTypingTarget(e.target)) {
        if (e.key === "Escape") {
          (e.target as HTMLElement).blur?.();
        }
        return;
      }

      if (e.key === "Escape") {
        onEscape?.();
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        onToggleHelp();
        return;
      }

      const k = e.key.toLowerCase();
      if (k === "n" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onQuickVisit();
        return;
      }
      if (k === "f" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onFocusSearch();
        return;
      }
      if (k === "t" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        onToday();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onPrev();
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNext();
        return;
      }
      if (e.key === "1") {
        e.preventDefault();
        onModeChange("day");
        return;
      }
      if (e.key === "2") {
        e.preventDefault();
        onModeChange("week");
        return;
      }
      if (e.key === "3") {
        e.preventDefault();
        onModeChange("month");
        return;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [
    enabled,
    mode,
    onModeChange,
    onToday,
    onPrev,
    onNext,
    onQuickVisit,
    onFocusSearch,
    onToggleHelp,
    onEscape,
  ]);
}
