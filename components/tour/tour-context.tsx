"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { getTourPath } from "@/lib/tour/paths";
import { markTourSeen } from "@/lib/tour/storage";
import type { TourPathId, TourStep } from "@/lib/tour/types";

type TourContextValue = {
  isActive: boolean;
  pathId: TourPathId | null;
  stepIndex: number;
  step: TourStep | null;
  totalSteps: number;
  startTour: (pathId: TourPathId) => void;
  next: () => void;
  prev: () => void;
  endTour: () => void;
  goToStep: (index: number) => void;
};

const TourContext = createContext<TourContextValue | null>(null);

function pathMatches(pathname: string | null, href?: string): boolean {
  if (!href) return true;
  const target = href.split("?")[0]!;
  if (pathname === target) return true;
  // Podstrony wizyty / pacjenta: href=/doctor/wizyty pasuje do /doctor/wizyty/xxx tylko gdy dokładny start
  if (target === "/doctor" || target === "/portal" || target === "/login") {
    return pathname === target;
  }
  return Boolean(pathname?.startsWith(target));
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const pathname = usePathname();

  const [isActive, setIsActive] = useState(false);
  const [pathId, setPathId] = useState<TourPathId | null>(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);

  const endTour = useCallback(() => {
    if (pathId) markTourSeen(pathId, userId);
    setIsActive(false);
    setPathId(null);
    setStepIndex(0);
    setSteps([]);
  }, [pathId, userId]);

  const startTour = useCallback((id: TourPathId) => {
    const path = getTourPath(id);
    if (!path || path.steps.length === 0) return;
    setPathId(id);
    setSteps(path.steps);
    setStepIndex(0);
    setIsActive(true);
    const first = path.steps[0];
    if (first?.href && !pathMatches(pathname, first.href)) {
      router.push(first.href);
    }
  }, [pathname, router]);

  const goToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= steps.length) {
        endTour();
        return;
      }
      setStepIndex(index);
      const step = steps[index];
      if (step?.href && !pathMatches(pathname, step.href)) {
        router.push(step.href);
      }
    },
    [steps, endTour, pathname, router]
  );

  const next = useCallback(() => {
    if (stepIndex >= steps.length - 1) {
      endTour();
      return;
    }
    goToStep(stepIndex + 1);
  }, [stepIndex, steps.length, endTour, goToStep]);

  const prev = useCallback(() => {
    if (stepIndex <= 0) return;
    goToStep(stepIndex - 1);
  }, [stepIndex, goToStep]);

  // Utrzymaj nawigację przy aktywnym tourze
  useEffect(() => {
    if (!isActive) return;
    const step = steps[stepIndex];
    if (!step?.href) return;
    if (!pathMatches(pathname, step.href)) {
      router.push(step.href);
    }
  }, [isActive, stepIndex, steps, pathname, router]);

  // Esc = zakończ
  useEffect(() => {
    if (!isActive) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        endTour();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isActive, endTour, next, prev]);

  const step = isActive ? (steps[stepIndex] ?? null) : null;

  const value = useMemo(
    () => ({
      isActive,
      pathId,
      stepIndex,
      step,
      totalSteps: steps.length,
      startTour,
      next,
      prev,
      endTour,
      goToStep,
    }),
    [
      isActive,
      pathId,
      stepIndex,
      step,
      steps.length,
      startTour,
      next,
      prev,
      endTour,
      goToStep,
    ]
  );

  return (
    <TourContext.Provider value={value}>{children}</TourContext.Provider>
  );
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used within TourProvider");
  }
  return ctx;
}

/** Bezpieczny hook — null poza providerem */
export function useTourOptional() {
  return useContext(TourContext);
}
