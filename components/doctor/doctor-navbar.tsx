"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import {
  Bell,
  CalendarSearch,
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
import { ViewAsDoctorSwitcher } from "@/components/doctor/view-as-doctor-switcher";
import { StaffChatNavButton } from "@/components/doctor/staff-chat";
import { useDoctorData } from "@/components/doctor/doctor-data-provider";
import { roleLabel } from "@/lib/auth/roles";
import { toast } from "sonner";

export function DoctorNavbar() {
  const { data: session } = useSession();
  const { canAccessAdmin } = useDoctorData();
  const user = session?.user;
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      "LK"
    : "LK";

  return (
    <header
      className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 text-slate-800 shadow-sm backdrop-blur"
      data-tour="doctor-navbar"
    >
      <div className="flex h-14 items-center gap-3 px-3 md:px-5">
        <Link
          href="/doctor"
          className="flex shrink-0 items-center gap-2.5 pr-1"
          data-tour="doctor-logo"
        >
          <div className="relative hidden size-8 overflow-hidden rounded-md sm:block">
            <Image
              src="/images/logo.webp"
              alt="CMKW"
              fill
              className="object-contain"
              sizes="32px"
            />
          </div>
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand text-white shadow-sm sm:hidden">
            <Stethoscope className="size-4" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide text-brand-heading">
              CMKW EDM
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Portal Lekarza
            </div>
          </div>
        </Link>

        <span className="hidden items-center rounded-full border border-brand/20 bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-deep lg:inline-flex">
          EDM
        </span>

        <div className="mx-1 hidden h-6 w-px bg-slate-200 md:block" />

        <DepartmentSwitcher />
        <ViewAsDoctorSwitcher className="hidden md:flex" />

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-9 text-slate-500 hover:bg-secondary hover:text-brand"
            aria-label="Wyszukiwarka terminów"
          >
            <Link href="/doctor/terminy">
              <CalendarSearch className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 text-slate-500 hover:bg-secondary hover:text-brand"
            onClick={() => toast.info("Powiadomienia systemowe — wkrótce")}
            aria-label="Powiadomienia"
          >
            <Bell className="size-4" />
          </Button>
          <StaffChatNavButton />
          {canAccessAdmin ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-9 text-slate-500 hover:bg-secondary hover:text-brand"
              aria-label="Administracja placówki"
              title="Administracja (tylko placówka)"
            >
              <Link href="/doctor/admin">
                <Settings className="size-4" />
              </Link>
            </Button>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="ml-1 h-9 gap-2 px-2 text-slate-700 hover:bg-secondary hover:text-brand-heading"
              >
                <Avatar className="size-7 border border-brand/20">
                  <AvatarFallback className="bg-brand text-xs font-semibold text-white">
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
                <Link href="/doctor/terminy">Terminy</Link>
              </DropdownMenuItem>
              {canAccessAdmin ? (
                <DropdownMenuItem asChild>
                  <Link href="/doctor/admin">Administracja</Link>
                </DropdownMenuItem>
              ) : null}
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
