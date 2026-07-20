import { TOUR_STORAGE_PREFIX, type TourPathId } from "@/lib/tour/types";

function key(pathId: TourPathId, userId?: string | null) {
  return `${TOUR_STORAGE_PREFIX}:${pathId}:${userId ?? "anon"}`;
}

export function hasSeenTour(
  pathId: TourPathId,
  userId?: string | null
): boolean {
  if (typeof window === "undefined") return true;
  try {
    return localStorage.getItem(key(pathId, userId)) === "1";
  } catch {
    return true;
  }
}

export function markTourSeen(
  pathId: TourPathId,
  userId?: string | null
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key(pathId, userId), "1");
  } catch {
    // ignore
  }
}

export function clearTourSeen(
  pathId: TourPathId,
  userId?: string | null
): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(key(pathId, userId));
  } catch {
    // ignore
  }
}
