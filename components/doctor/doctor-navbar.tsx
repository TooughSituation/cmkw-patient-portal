"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Bell,
  MessageSquare,
  Settings,
  Stethoscope,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/auth/logout-button";
import { DepartmentSwitcher } from "@/components/doctor/department-switcher";
import { roleLabel } from "@/lib/auth/roles";
import { toast } from "sonner";

export function DoctorNavbar({
  departmentId,
  onDepartmentChange,
}: {
  departmentId: string;
  onDepartmentChange: (id: string) => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      "LK"
    : "LK";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0f172a] text-slate-100">
      <div className="flex h-14 items-center gap-3 px-3 md:px-4">
        {/* Logo */}
        <Link
          href="/doctor"
          className="flex shrink-0 items-center gap-2.5 pr-2"
        >
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#0849b0] shadow-sm">
            <Stethoscope className="size-4 text-white" />
          </div>
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold tracking-wide text-white">
              CMKW EDM
            </div>
            <div className="text-[10px] uppercase tracking-wider text-slate-400">
              Portal Lekarza
            </div>
          </div>
        </Link>

        {/* ZnanyLekarz badge (opcjonalny) */}
        <span className="hidden items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300 lg:inline-flex">
          ZnanyLekarz
        </span>

        <div className="mx-1 hidden h-6 w-px bg-slate-700 md:block" />

        <DepartmentSwitcher
          value={departmentId}
          onChange={onDepartmentChange}
        />

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => toast.info("Powiadomienia — wkrótce (Etap 2)")}
            aria-label="Powiadomienia"
          >
            <Bell className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => toast.info("Wiadomości — wkrótce (Etap 2)")}
            aria-label="Wiadomości"
          >
            <MessageSquare className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-slate-300 hover:bg-white/10 hover:text-white"
            onClick={() => toast.info("Ustawienia — wkrótce (Etap 2)")}
            aria-label="Ustawienia"
          >
            <Settings className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="ml-1 h-9 gap-2 px-2 text-slate-100 hover:bg-white/10 hover:text-white"
              >
                <Avatar className="size-7 border border-slate-600">
                  <AvatarFallback className="bg-[#0849b0] text-xs font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[120px] truncate text-left text-sm md:block">
                  {user ? `${user.firstName} ${user.lastName}` : "Użytkownik"}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">
                    {user
                      ? `${user.firstName} ${user.lastName}`
                      : "Użytkownik"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {roleLabel(user?.role)}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/doctor">Kalendarz</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/doctor/wizyty">Lista wizyt</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-1">
                <LogoutButton
                  className="h-8 w-full justify-start border-0 shadow-none"
                  label="Wyloguj"
                />
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
