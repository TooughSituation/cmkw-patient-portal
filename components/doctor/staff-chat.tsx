"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { format, parseISO } from "date-fns";
import { pl } from "date-fns/locale";
import {
  AlertTriangle,
  Info,
  Loader2,
  MessageSquare,
  Send,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useStaffChat } from "@/hooks/use-staff-chat";
import {
  CHAT_PRIORITY_LABELS,
  type ChatPriority,
} from "@/lib/doctor/chat-types";
import { roleLabel } from "@/lib/auth/roles";
import { cn } from "@/lib/utils";

type StaffChatApi = ReturnType<typeof useStaffChat>;

const StaffChatContext = createContext<StaffChatApi | null>(null);

export function StaffChatRoot({ children }: { children: ReactNode }) {
  const chat = useStaffChat();
  return (
    <StaffChatContext.Provider value={chat}>
      {children}
      <StaffChatPanel />
    </StaffChatContext.Provider>
  );
}

export function useStaffChatContext() {
  const ctx = useContext(StaffChatContext);
  if (!ctx) {
    throw new Error("useStaffChatContext must be used within StaffChatRoot");
  }
  return ctx;
}

/** Panel komunikatora — otwierany z navbara EDM */
function StaffChatPanel() {
  const {
    open,
    setOpen,
    loading,
    threads,
    threadMessages,
    activeThreadId,
    setActiveThreadId,
    sendMessage,
    currentUserId,
    currentUserLabel,
  } = useStaffChatContext();

  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<ChatPriority>("normal");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [open, threadMessages.length, activeThreadId]);

  function handleSend() {
    const text = body.trim();
    if (!text) {
      toast.error("Wpisz treść wiadomości");
      return;
    }
    const msg = sendMessage(text, priority);
    if (msg) {
      setBody("");
      setPriority("normal");
      toast.success("Wiadomość wysłana");
    }
  }

  const activeThread = threads.find(
    (t) => t.participant.id === activeThreadId
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex h-full w-full flex-col gap-0 p-0 sm:max-w-2xl"
        data-tour="staff-chat-panel"
      >
        <SheetHeader className="border-b border-slate-200 px-4 py-3 text-left">
          <SheetTitle className="flex items-center gap-2 text-brand-heading">
            <MessageSquare className="size-4 text-brand" />
            Komunikator personelu
          </SheetTitle>
          <SheetDescription className="text-xs">
            {currentUserLabel || "CMKW EDM"} — wiadomości wewnętrzne (lekarz ↔
            recepcja)
          </SheetDescription>
        </SheetHeader>

        {loading ? (
          <div className="flex flex-1 items-center justify-center gap-2 text-slate-500">
            <Loader2 className="size-4 animate-spin" />
            Ładowanie…
          </div>
        ) : (
          <div className="flex min-h-0 flex-1">
            <aside className="flex w-[38%] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80">
              <div className="border-b border-slate-200 px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Rozmowy
              </div>
              <ScrollArea className="flex-1">
                <ul className="p-1">
                  {threads.map(({ participant, unread, lastAt }) => {
                    const active = participant.id === activeThreadId;
                    return (
                      <li key={participant.id}>
                        <button
                          type="button"
                          onClick={() => setActiveThreadId(participant.id)}
                          className={cn(
                            "flex w-full flex-col gap-0.5 rounded-md px-2 py-2 text-left text-sm transition",
                            active
                              ? "bg-brand text-white shadow-sm"
                              : "hover:bg-white hover:shadow-sm"
                          )}
                        >
                          <span className="flex items-center justify-between gap-1">
                            <span className="flex min-w-0 items-center gap-1 font-medium">
                              {participant.isChannel ? (
                                <Users
                                  className={cn(
                                    "size-3.5 shrink-0",
                                    active ? "text-white/90" : "text-brand"
                                  )}
                                />
                              ) : null}
                              <span className="truncate">{participant.name}</span>
                            </span>
                            {unread > 0 ? (
                              <span
                                className={cn(
                                  "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold",
                                  active
                                    ? "bg-white text-brand"
                                    : "bg-destructive text-white"
                                )}
                              >
                                {unread > 9 ? "9+" : unread}
                              </span>
                            ) : null}
                          </span>
                          <span
                            className={cn(
                              "truncate text-[10px]",
                              active ? "text-white/75" : "text-muted-foreground"
                            )}
                          >
                            {participant.isChannel
                              ? "Kanał recepcji"
                              : roleLabel(participant.role)}
                            {lastAt
                              ? ` · ${format(parseISO(lastAt), "d MMM HH:mm", { locale: pl })}`
                              : ""}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </ScrollArea>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
              <div className="border-b border-slate-200 bg-white px-3 py-2">
                <p className="text-sm font-semibold text-brand-heading">
                  {activeThread?.participant.name ?? "Wybierz rozmowę"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {activeThread?.participant.isChannel
                    ? "Wiadomość widoczna dla całego personelu EDM"
                    : "Wiadomość prywatna (1:1)"}
                </p>
              </div>

              <ScrollArea className="flex-1 bg-white">
                <div className="space-y-3 p-3">
                  {threadMessages.length === 0 ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                      Brak wiadomości. Napisz pierwszą do{" "}
                      {activeThread?.participant.name ?? "odbiorcy"}.
                    </p>
                  ) : (
                    threadMessages.map((m) => {
                      const mine = m.fromUserId === currentUserId;
                      return (
                        <div
                          key={m.id}
                          className={cn(
                            "flex flex-col gap-1",
                            mine ? "items-end" : "items-start"
                          )}
                        >
                          <div className="flex flex-wrap items-center gap-1.5 px-0.5">
                            <span className="text-[11px] font-medium text-slate-600">
                              {mine ? "Ty" : m.fromName}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {format(parseISO(m.createdAt), "d MMM HH:mm", {
                                locale: pl,
                              })}
                            </span>
                            {m.priority !== "normal" ? (
                              <PriorityBadge priority={m.priority} />
                            ) : null}
                          </div>
                          <div
                            className={cn(
                              "max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm",
                              mine
                                ? "rounded-br-md bg-brand text-white"
                                : m.priority === "urgent"
                                  ? "rounded-bl-md border border-red-200 bg-red-50 text-slate-800"
                                  : m.priority === "fyi"
                                    ? "rounded-bl-md border border-amber-200 bg-amber-50 text-slate-800"
                                    : "rounded-bl-md border border-slate-200 bg-slate-50 text-slate-800"
                            )}
                          >
                            {m.body}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>
              </ScrollArea>

              <div className="border-t border-slate-200 bg-slate-50/90 p-3">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {(
                    [
                      ["normal", "Zwykła"],
                      ["urgent", "Pilne"],
                      ["fyi", "Do wiadomości"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPriority(id)}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                        priority === id
                          ? id === "urgent"
                            ? "border-red-300 bg-red-50 text-red-800"
                            : id === "fyi"
                              ? "border-amber-300 bg-amber-50 text-amber-900"
                              : "border-brand/30 bg-secondary text-brand-deep"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      )}
                    >
                      {id === "urgent" ? (
                        <AlertTriangle className="size-3" />
                      ) : id === "fyi" ? (
                        <Info className="size-3" />
                      ) : null}
                      {label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder={`Napisz do ${activeThread?.participant.name ?? "…"}…`}
                    rows={2}
                    className="min-h-[64px] flex-1 resize-none bg-white text-[15px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    className="h-auto shrink-0 gap-1.5 self-end bg-brand px-3 text-white hover:bg-brand-deep"
                    onClick={handleSend}
                    aria-label="Wyślij"
                  >
                    <Send className="size-4" />
                    <span className="hidden sm:inline">Wyślij</span>
                  </Button>
                </div>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  Ctrl+Enter — wyślij · Historia w localStorage (demo)
                </p>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function PriorityBadge({ priority }: { priority: ChatPriority }) {
  if (priority === "urgent") {
    return (
      <Badge
        variant="outline"
        className="h-5 gap-0.5 border-red-200 bg-red-50 px-1.5 text-[10px] text-red-800"
      >
        <AlertTriangle className="size-2.5" />
        {CHAT_PRIORITY_LABELS.urgent}
      </Badge>
    );
  }
  if (priority === "fyi") {
    return (
      <Badge
        variant="outline"
        className="h-5 gap-0.5 border-amber-200 bg-amber-50 px-1.5 text-[10px] text-amber-900"
      >
        <Info className="size-2.5" />
        {CHAT_PRIORITY_LABELS.fyi}
      </Badge>
    );
  }
  return null;
}

/** Przycisk w navbarze z badge nieprzeczytanych */
export function StaffChatNavButton() {
  const { setOpen, unreadCount } = useStaffChatContext();
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative size-9 text-slate-500 hover:bg-secondary hover:text-brand"
      onClick={() => setOpen(true)}
      aria-label={
        unreadCount > 0
          ? `Wiadomości (${unreadCount} nieprzeczytanych)`
          : "Wiadomości personelu"
      }
      data-tour="staff-chat-nav"
    >
      <MessageSquare className="size-4" />
      {unreadCount > 0 ? (
        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[9px] font-bold text-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Button>
  );
}
