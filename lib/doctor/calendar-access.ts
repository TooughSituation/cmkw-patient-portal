/**
 * Udostępnianie kalendarzy między lekarzami.
 * Klucz = doctorId przeglądającego, wartość = lista doctorId, których kalendarze może widzieć.
 * Własny kalendarz jest zawsze widoczny — nie trzeba go dopisywać.
 */
export type DoctorCalendarAccessMap = Record<string, string[]>;

export const CALENDAR_ACCESS_STORAGE_KEY = "cmkw-doctor-calendar-access-v1";
export const VIEW_AS_DOCTOR_KEY = "cmkw-doctor-view-as-v1";
/** Lekarz: podgląd udostępnionego kalendarza (null = własny) */
export const SHARED_PREVIEW_KEY = "cmkw-doctor-shared-preview-v1";

/** Seed demo: Tomasz Wenta widzi kalendarz Jana Kiryluka */
export const SEED_CALENDAR_ACCESS: DoctorCalendarAccessMap = {
  wenta: ["kiryluk"],
};

export function normalizeAccessMap(
  raw: unknown
): DoctorCalendarAccessMap {
  if (!raw || typeof raw !== "object") return {};
  const out: DoctorCalendarAccessMap = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!k || !Array.isArray(v)) continue;
    const ids = v
      .filter((x): x is string => typeof x === "string" && x.length > 0)
      .filter((id) => id !== k);
    out[k] = Array.from(new Set(ids));
  }
  return out;
}

export function getSharedDoctorIds(
  map: DoctorCalendarAccessMap,
  viewerDoctorId: string | undefined | null
): string[] {
  if (!viewerDoctorId) return [];
  return map[viewerDoctorId] ?? [];
}

/**
 * Lista doctorId filtrujących dane w danym momencie.
 * - canSeeAll + brak viewAs → "all"
 * - canSeeAll + viewAs → [viewAs]
 * - klinicysta: domyślnie TYLKO własny; przy podglądzie udostępnionego → tylko ten ID
 *   (nigdy jednocześnie własny + cudzy w jednym widoku)
 */
export function resolveVisibleDoctorIds(opts: {
  canSeeAll: boolean;
  ownDoctorId?: string | null;
  sharedIds?: string[];
  /** Facility: filtr „jako lekarz” */
  viewAsDoctorId?: string | null;
  /** Klinicysta: aktywny podgląd udostępnionego doctorId */
  sharedPreviewDoctorId?: string | null;
}): string[] | "all" {
  if (opts.canSeeAll) {
    if (opts.viewAsDoctorId) return [opts.viewAsDoctorId];
    return "all";
  }
  const own = opts.ownDoctorId?.trim();
  if (!own) return [];
  const preview = opts.sharedPreviewDoctorId?.trim();
  if (preview && preview !== own) {
    const allowed = (opts.sharedIds ?? []).includes(preview);
    if (allowed) return [preview];
  }
  return [own];
}

export function canViewDoctorCalendar(
  visible: string[] | "all",
  doctorId: string
): boolean {
  if (visible === "all") return true;
  return visible.includes(doctorId);
}

export function canEditDoctorData(
  opts: {
    canSeeAll: boolean;
    ownDoctorId?: string | null;
  },
  targetDoctorId: string
): boolean {
  if (opts.canSeeAll) return true;
  return Boolean(opts.ownDoctorId && opts.ownDoctorId === targetDoctorId);
}
