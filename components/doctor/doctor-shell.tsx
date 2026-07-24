"use client";

import { Suspense } from "react";
import { DoctorNavbar } from "@/components/doctor/doctor-navbar";
import { DoctorTabs } from "@/components/doctor/doctor-tabs";
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar";
import { DoctorDataProvider } from "@/components/doctor/doctor-data-provider";
import { AccessDeniedToast } from "@/components/doctor/access-denied-toast";
import { StaffChatRoot } from "@/components/doctor/staff-chat";

export function DoctorShell({ children }: { children: React.ReactNode }) {
  return (
    <DoctorDataProvider>
      <StaffChatRoot>
        <div className="flex min-h-screen flex-col bg-slate-50 text-[15px] text-slate-800">
          <Suspense fallback={null}>
            <AccessDeniedToast />
          </Suspense>
          <DoctorNavbar />
          <DoctorTabs />
          <div className="flex min-h-0 flex-1">
            <div className="min-w-0 flex-1 overflow-auto">{children}</div>
            <DoctorSidebar />
          </div>
        </div>
      </StaffChatRoot>
    </DoctorDataProvider>
  );
}
