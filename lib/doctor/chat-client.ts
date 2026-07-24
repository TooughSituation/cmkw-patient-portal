import { SEED_CHAT_MESSAGES } from "@/lib/doctor/seed-chat";
import type { ChatPriority, StaffChatMessage } from "@/lib/doctor/chat-types";
import { CHAT_RECEPTION_ID } from "@/lib/doctor/chat-types";

export const STAFF_CHAT_STORAGE_KEY = "cmkw-doctor-staff-chat-v1";
export const STAFF_CHAT_EVENT = "cmkw-staff-chat-updated";

function cloneSeed(): StaffChatMessage[] {
  return structuredClone(SEED_CHAT_MESSAGES);
}

export function loadChatFromLocalStorage(): StaffChatMessage[] {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = localStorage.getItem(STAFF_CHAT_STORAGE_KEY);
    if (!raw) {
      const seed = cloneSeed();
      localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as StaffChatMessage[];
    if (!Array.isArray(parsed)) {
      const seed = cloneSeed();
      localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return parsed.map(normalizeMessage);
  } catch {
    return cloneSeed();
  }
}

export function saveChatToLocalStorage(messages: StaffChatMessage[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STAFF_CHAT_STORAGE_KEY, JSON.stringify(messages));
    window.dispatchEvent(
      new CustomEvent(STAFF_CHAT_EVENT, { detail: { count: messages.length } })
    );
  } catch {
    // ignore quota
  }
}

export function resetChatLocalStorage(): StaffChatMessage[] {
  const seed = cloneSeed();
  saveChatToLocalStorage(seed);
  return seed;
}

function normalizeMessage(m: Partial<StaffChatMessage>): StaffChatMessage {
  const priority: ChatPriority =
    m.priority === "urgent" || m.priority === "fyi" ? m.priority : "normal";
  return {
    id: m.id ?? `msg-${crypto.randomUUID().slice(0, 8)}`,
    fromUserId: m.fromUserId ?? "",
    fromName: m.fromName ?? "?",
    fromRole: m.fromRole ?? "",
    toUserId: m.toUserId ?? CHAT_RECEPTION_ID,
    toName: m.toName ?? "Recepcja",
    body: m.body ?? "",
    priority,
    createdAt: m.createdAt ?? new Date().toISOString(),
    readBy: Array.isArray(m.readBy) ? m.readBy : [],
  };
}

export function createChatMessage(input: {
  fromUserId: string;
  fromName: string;
  fromRole: string;
  toUserId: string;
  toName: string;
  body: string;
  priority?: ChatPriority;
}): StaffChatMessage {
  return {
    id: `msg-${crypto.randomUUID().slice(0, 10)}`,
    fromUserId: input.fromUserId,
    fromName: input.fromName,
    fromRole: input.fromRole,
    toUserId: input.toUserId,
    toName: input.toName,
    body: input.body.trim(),
    priority: input.priority ?? "normal",
    createdAt: new Date().toISOString(),
    readBy: [input.fromUserId],
  };
}

/**
 * Wiadomość dotyczy użytkownika, jeśli:
 * - jest nadawcą lub odbiorcą bezpośrednim
 * - adresowana do recepcji i user ma rolę reception/facility
 * - adresowana do recepcji i user jest lekarzem (widzi kanał recepcji w EDM)
 */
export function messageVisibleTo(
  msg: StaffChatMessage,
  userId: string,
  role: string | undefined
): boolean {
  if (msg.fromUserId === userId || msg.toUserId === userId) return true;
  if (msg.toUserId === CHAT_RECEPTION_ID) {
    // Kanał recepcji widoczny dla całego personelu EDM
    return (
      role === "reception" ||
      role === "facility" ||
      role === "doctor" ||
      role === "admin"
    );
  }
  return false;
}

export function isUnreadFor(
  msg: StaffChatMessage,
  userId: string
): boolean {
  if (msg.fromUserId === userId) return false;
  return !msg.readBy.includes(userId);
}

/** Krótki beep powiadomienia (Web Audio API) */
export function playChatNotificationSound(): void {
  if (typeof window === "undefined") return;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.28);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
    osc.onended = () => {
      void ctx.close();
    };
  } catch {
    // autoplay / API niedostępne — cicho
  }
}
