import type { StaffChatMessage } from "@/lib/doctor/chat-types";
import { CHAT_RECEPTION_ID } from "@/lib/doctor/chat-types";

/** Seed demonstracyjny — komunikator personelu EDM */
export const SEED_CHAT_MESSAGES: StaffChatMessage[] = [
  {
    id: "msg-001",
    fromUserId: "user-reception-anna",
    fromName: "Anna Nowak",
    fromRole: "reception",
    toUserId: "user-doctor-kiryluk",
    toName: "Jan Kiryluk",
    body: "Dzień dobry Panie Doktorze — pani Kowalska dzwoniła, prosi o przesunięcie wizyty o 15 min.",
    priority: "normal",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    readBy: [],
  },
  {
    id: "msg-002",
    fromUserId: "user-doctor-wenta",
    fromName: "Tomas Wenta",
    fromRole: "doctor",
    toUserId: CHAT_RECEPTION_ID,
    toName: "Recepcja",
    body: "Proszę o potwierdzenie telefoniczne pacjenta z 14:00 — nie ma w systemie telepotwierdzenia.",
    priority: "urgent",
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    readBy: [],
  },
  {
    id: "msg-003",
    fromUserId: "user-facility-cmkw",
    fromName: "Centrum CMKW",
    fromRole: "facility",
    toUserId: CHAT_RECEPTION_ID,
    toName: "Recepcja",
    body: "Przypomnienie: jutro dyżur w Hajnówce — proszę o listę pacjentów do dr. Zawadzkiego.",
    priority: "fyi",
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    readBy: [],
  },
  {
    id: "msg-004",
    fromUserId: "user-doctor-kiryluk",
    fromName: "Jan Kiryluk",
    fromRole: "admin",
    toUserId: "user-reception-anna",
    toName: "Anna Nowak",
    body: "OK, proszę przełożyć Kowalską na 10:15 jeśli slot wolny.",
    priority: "normal",
    createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    readBy: ["user-reception-anna"],
  },
];
