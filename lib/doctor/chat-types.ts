/** Priorytet wiadomości w komunikatorze personelu EDM */
export type ChatPriority = "normal" | "urgent" | "fyi";

export const CHAT_PRIORITY_LABELS: Record<ChatPriority, string> = {
  normal: "Zwykła",
  urgent: "Pilne",
  fyi: "Do wiadomości",
};

/** Specjalny adresat: kanał recepcji (wszyscy reception + facility) */
export const CHAT_RECEPTION_ID = "reception";

export type StaffChatMessage = {
  id: string;
  fromUserId: string;
  fromName: string;
  fromRole: string;
  /** userId odbiorcy albo CHAT_RECEPTION_ID */
  toUserId: string;
  toName: string;
  body: string;
  priority: ChatPriority;
  createdAt: string;
  /** ID użytkowników, którzy oznaczyli jako przeczytane */
  readBy: string[];
};

export type ChatParticipant = {
  id: string;
  name: string;
  role: string;
  /** true = kanał grupowy (recepcja) */
  isChannel?: boolean;
};
