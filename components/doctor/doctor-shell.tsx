"use client";

import { useEffect, useState } from "react";
import { DoctorNavbar } from "@/components/doctor/doctor-navbar";
import { DoctorTabs } from "@/components/doctor/doctor-tabs";
import { DoctorSidebar } from "@/components/doctor/doctor-sidebar";
import { DoctorDataProvider } from "@/components/doctor/doctor-data-provider";
import { departments } from "@/lib/doctor/departments";

const DEPT_KEY = "cmkw-doctor-department";

export function DoctorShell({ children }: { children: React.ReactNode }) {
  const [departmentId, setDepartmentId] = useState(departments[0].id);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DEPT_KEY);
      if (saved && departments.some((d) => d.id === saved)) {
        setDepartmentId(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  function handleDepartmentChange(id: string) {
    setDepartmentId(id);
    try {
      localStorage.setItem(DEPT_KEY, id);
    } catch {
      // ignore
    }
  }

  return (
    <DoctorDataProvider>
      <div className="flex min-h-screen flex-col bg-slate-50 text-[15px] text-slate-800">
        <DoctorNavbar
          departmentId={departmentId}
          onDepartmentChange={handleDepartmentChange}
        />
        <DoctorTabs />
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 overflow-auto">{children}</div>
          <DoctorSidebar />
        </div>
      </div>
    </DoctorDataProvider>
  );
}
