"use client";

import { SessionProvider } from "next-auth/react";
import { TourProvider } from "@/components/tour/tour-context";
import { TourOverlay } from "@/components/tour/tour-overlay";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TourProvider>
        {children}
        <TourOverlay />
      </TourProvider>
    </SessionProvider>
  );
}
