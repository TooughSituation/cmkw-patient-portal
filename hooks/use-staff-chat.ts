"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import {
  createChatMessage,
  isUnreadFor,
  loadChatFromLocalStorage,
  messageVisibleTo,
  playChatNotificationSound,
  saveChatToLocalStorage,
  STAFF_CHAT_EVENT,
  STAFF_CHAT_STORAGE_KEY,
} from "@/lib/doctor/chat-client";
import type {
  ChatParticipant,
  ChatPriority,
  StaffChatMessage,
} from "@/lib/doctor/chat-types";
import { CHAT_RECEPTION_ID } from "@/lib/doctor/chat-types";
import { ALL_DEMO_ACCOUNTS } from "@/lib/demo-accounts";
import { roleLabel } from "@/lib/auth/roles";

export function useStaffChat() {
  const { data: session } = useSession();
  const user = session?.user;
  const userId = user?.id ?? "";
  const role = user?.role;

  const [messages, setMessages] = useState<StaffChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string>(CHAT_RECEPTION_ID);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const soundReadyRef = useRef(false);

  const reload = useCallback(() => {
    const all = loadChatFromLocalStorage();
    setMessages(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
    // Po pierwszym załadowaniu — zapamiętaj ID (bez dźwięku na seed)
    const all = loadChatFromLocalStorage();
    knownIdsRef.current = new Set(all.map((m) => m.id));
    soundReadyRef.current = true;

    function onStorage(e: StorageEvent) {
      if (e.key === STAFF_CHAT_STORAGE_KEY) reload();
    }
    function onCustom() {
      reload();
    }
    window.addEventListener("storage", onStorage);
    window.addEventListener(STAFF_CHAT_EVENT, onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(STAFF_CHAT_EVENT, onCustom);
    };
  }, [reload]);

  // Dźwięk + aktualizacja przy nowych wiadomościach od innych
  useEffect(() => {
    if (!soundReadyRef.current || !userId) return;
    const incoming = messages.filter(
      (m) =>
        !knownIdsRef.current.has(m.id) &&
        m.fromUserId !== userId &&
        messageVisibleTo(m, userId, role)
    );
    for (const m of messages) knownIdsRef.current.add(m.id);
    if (incoming.length > 0) {
      playChatNotificationSound();
    }
  }, [messages, userId, role]);

  const visibleMessages = useMemo(() => {
    if (!userId) return [];
    return messages
      .filter((m) => messageVisibleTo(m, userId, role))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, [messages, userId, role]);

  const unreadCount = useMemo(() => {
    if (!userId) return 0;
    return visibleMessages.filter((m) => isUnreadFor(m, userId)).length;
  }, [visibleMessages, userId]);

  const participants: ChatParticipant[] = useMemo(() => {
    const list: ChatParticipant[] = [
      {
        id: CHAT_RECEPTION_ID,
        name: "Recepcja",
        role: "reception",
        isChannel: true,
      },
    ];
    for (const acc of ALL_DEMO_ACCOUNTS) {
      if (acc.role === "patient") continue;
      if (acc.id === userId) continue;
      list.push({
        id: acc.id,
        name: `${acc.firstName} ${acc.lastName}`,
        role: acc.role,
      });
    }
    return list;
  }, [userId]);

  /** Wątki: recepcja + bezpośrednie rozmowy z osobami */
  const threads = useMemo(() => {
    const map = new Map<
      string,
      { participant: ChatParticipant; lastAt: string; unread: number }
    >();

    const reception = participants.find((p) => p.id === CHAT_RECEPTION_ID)!;
    map.set(CHAT_RECEPTION_ID, {
      participant: reception,
      lastAt: "",
      unread: 0,
    });

    for (const p of participants) {
      if (p.id === CHAT_RECEPTION_ID) continue;
      map.set(p.id, { participant: p, lastAt: "", unread: 0 });
    }

    for (const m of visibleMessages) {
      let threadId: string | null = null;
      if (m.toUserId === CHAT_RECEPTION_ID || m.fromUserId === CHAT_RECEPTION_ID) {
        // wiadomość do/z kanału — ale fromUserId nigdy nie jest "reception"
        if (m.toUserId === CHAT_RECEPTION_ID) threadId = CHAT_RECEPTION_ID;
      }
      if (!threadId) {
        if (m.fromUserId === userId) threadId = m.toUserId;
        else if (m.toUserId === userId) threadId = m.fromUserId;
        else if (m.toUserId === CHAT_RECEPTION_ID) threadId = CHAT_RECEPTION_ID;
      }
      if (!threadId || !map.has(threadId)) {
        if (m.toUserId === CHAT_RECEPTION_ID) threadId = CHAT_RECEPTION_ID;
        else continue;
      }
      const entry = map.get(threadId)!;
      if (!entry.lastAt || m.createdAt > entry.lastAt) entry.lastAt = m.createdAt;
      if (userId && isUnreadFor(m, userId) && messageInThread(m, threadId, userId)) {
        entry.unread += 1;
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      if (a.participant.id === CHAT_RECEPTION_ID) return -1;
      if (b.participant.id === CHAT_RECEPTION_ID) return 1;
      return (b.lastAt || "").localeCompare(a.lastAt || "");
    });
  }, [participants, visibleMessages, userId]);

  const threadMessages = useMemo(() => {
    if (!userId) return [];
    return visibleMessages.filter((m) =>
      messageInThread(m, activeThreadId, userId)
    );
  }, [visibleMessages, activeThreadId, userId]);

  const markThreadRead = useCallback(
    (threadId: string) => {
      if (!userId) return;
      const all = loadChatFromLocalStorage();
      let changed = false;
      const next = all.map((m) => {
        if (!messageVisibleTo(m, userId, role)) return m;
        if (!messageInThread(m, threadId, userId)) return m;
        if (m.fromUserId === userId) return m;
        if (m.readBy.includes(userId)) return m;
        changed = true;
        return { ...m, readBy: [...m.readBy, userId] };
      });
      if (changed) {
        saveChatToLocalStorage(next);
        setMessages(next);
      }
    },
    [userId, role]
  );

  useEffect(() => {
    if (open && activeThreadId) {
      markThreadRead(activeThreadId);
    }
  }, [open, activeThreadId, markThreadRead, threadMessages.length]);

  const sendMessage = useCallback(
    (body: string, priority: ChatPriority = "normal") => {
      if (!user || !userId || !body.trim()) return null;
      const participant =
        participants.find((p) => p.id === activeThreadId) ??
        participants[0];
      const msg = createChatMessage({
        fromUserId: userId,
        fromName: `${user.firstName} ${user.lastName}`,
        fromRole: String(user.role ?? ""),
        toUserId: participant.id,
        toName: participant.name,
        body,
        priority,
      });
      knownIdsRef.current.add(msg.id);
      const next = [...loadChatFromLocalStorage(), msg];
      saveChatToLocalStorage(next);
      setMessages(next);
      return msg;
    },
    [user, userId, activeThreadId, participants]
  );

  return {
    loading,
    open,
    setOpen,
    messages: visibleMessages,
    threadMessages,
    threads,
    participants,
    activeThreadId,
    setActiveThreadId,
    unreadCount,
    sendMessage,
    markThreadRead,
    currentUserId: userId,
    currentUserLabel: user
      ? `${user.firstName} ${user.lastName} · ${roleLabel(user.role)}`
      : "",
  };
}

function messageInThread(
  m: StaffChatMessage,
  threadId: string,
  userId: string
): boolean {
  if (threadId === CHAT_RECEPTION_ID) {
    return m.toUserId === CHAT_RECEPTION_ID;
  }
  // DM: para (userId, threadId)
  return (
    (m.fromUserId === userId && m.toUserId === threadId) ||
    (m.fromUserId === threadId && m.toUserId === userId)
  );
}
