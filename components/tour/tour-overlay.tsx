"use client";

import { useLayoutEffect, useState } from "react";
import { useTour } from "@/components/tour/tour-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PADDING = 10;

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

/**
 * Spotlight tour w stylu Akwen:
 * przyciemnienie + dziura wokół elementu + tooltip z licznikiem PRZEWODNIK n / m
 */
export function TourOverlay() {
  const { isActive, step, stepIndex, totalSteps, next, prev, endTour } =
    useTour();
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);

  useLayoutEffect(() => {
    if (!isActive || !step) {
      setRect(null);
      return;
    }

    let attempts = 0;
    let raf = 0;
    let timer = 0;

    const measure = () => {
      const el = document.querySelector(step.target) as HTMLElement | null;
      if (!el) {
        attempts += 1;
        setMissing(true);
        if (attempts < 25) {
          timer = window.setTimeout(measure, 120);
        }
        return;
      }
      setMissing(false);
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: Math.max(r.width + PADDING * 2, 40),
        height: Math.max(r.height + PADDING * 2, 40),
      });
      const fullyVisible =
        r.top >= 8 &&
        r.bottom <= window.innerHeight - 8 &&
        r.left >= 0 &&
        r.right <= window.innerWidth;
      if (!fullyVisible) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
        timer = window.setTimeout(() => {
          const r2 = el.getBoundingClientRect();
          setRect({
            top: r2.top - PADDING,
            left: r2.left - PADDING,
            width: Math.max(r2.width + PADDING * 2, 40),
            height: Math.max(r2.height + PADDING * 2, 40),
          });
        }, 300);
      }
    };

    // Czekaj na nawigację Next.js
    timer = window.setTimeout(measure, 80);
    const onResize = () => {
      raf = window.requestAnimationFrame(measure);
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      window.cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [isActive, step, stepIndex]);

  if (!isActive || !step) return null;

  const tooltipStyle = getTooltipStyle(rect);

  return (
    <div
      className="fixed inset-0 z-[200]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cmkw-tour-title"
      aria-describedby="cmkw-tour-desc"
    >
      <div className="absolute inset-0" aria-hidden>
        {rect ? (
          <div
            className="absolute rounded-xl transition-all duration-200"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              boxShadow: "0 0 0 9999px rgba(8, 20, 50, 0.72)",
              outline: "2px solid #0849b0",
              outlineOffset: 3,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-[#081432]/70" />
        )}
      </div>

      <div
        className={cn(
          "absolute z-[201] w-[min(100%-2rem,22rem)] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl",
          !rect && "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        )}
        style={rect ? tooltipStyle : undefined}
      >
        <p className="text-[11px] font-semibold tracking-wider text-brand uppercase">
          Przewodnik · {stepIndex + 1} / {totalSteps}
        </p>
        <h2
          id="cmkw-tour-title"
          className="mt-1 text-lg font-semibold text-brand-heading"
        >
          {step.title}
        </h2>
        <p
          id="cmkw-tour-desc"
          className="mt-2 text-sm leading-relaxed text-slate-600"
        >
          {step.description}
        </p>
        {missing ? (
          <p className="mt-2 text-xs text-amber-700">
            Ładowanie elementu… Jeśli nie widać podświetlenia, kliknij
            Następny.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-slate-600"
            onClick={endTour}
          >
            Zakończ
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={prev}
              disabled={stepIndex === 0}
            >
              Poprzedni
            </Button>
            <Button
              type="button"
              size="sm"
              className="bg-brand text-white hover:bg-brand-deep"
              onClick={next}
            >
              {stepIndex >= totalSteps - 1 ? "Gotowe" : "Następny"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTooltipStyle(rect: Rect | null): React.CSSProperties | undefined {
  if (!rect || typeof window === "undefined") return undefined;

  const gap = 14;
  const tooltipWidth = Math.min(window.innerWidth - 32, 352);
  const tooltipApproxHeight = 230;

  let top = rect.top + rect.height + gap;
  let left = rect.left;

  if (top + tooltipApproxHeight > window.innerHeight - 16) {
    top = rect.top - tooltipApproxHeight - gap;
  }
  if (top < 16) top = 16;

  if (left + tooltipWidth > window.innerWidth - 16) {
    left = window.innerWidth - tooltipWidth - 16;
  }
  if (left < 16) left = 16;

  return { top, left, maxWidth: tooltipWidth };
}
