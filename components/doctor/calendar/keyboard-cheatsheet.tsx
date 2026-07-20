"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { KEYBOARD_CHEATSHEET } from "@/lib/doctor/calendar-constants";

export function KeyboardCheatsheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-brand-heading">
            Skróty klawiszowe kalendarza
          </DialogTitle>
          <DialogDescription>
            Przyspiesz pracę w EDM — działa poza polami formularza.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-2">
          {KEYBOARD_CHEATSHEET.map((row) => (
            <li
              key={row.keys}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="text-slate-700">{row.action}</span>
              <kbd className="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-semibold text-brand-deep shadow-sm">
                {row.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
