"use client";

import { useRef, useState } from "react";
import {
  Download,
  Eye,
  FileText,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/doctor/empty-state";
import { useDoctorDocuments } from "@/hooks/use-doctor-documents";
import {
  DOCUMENT_TYPE_LABELS,
  type DocumentType,
  type DoctorDocument,
} from "@/lib/doctor/types";
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from "date-fns";

export function DocumentsPanel({
  patientId,
  visitId,
  scope,
}: {
  patientId: string;
  visitId?: string;
  scope: "patient" | "visit";
}) {
  const { forPatient, forVisit, add, remove } = useDoctorDocuments();
  const [type, setType] = useState<DocumentType>("inne");
  const [preview, setPreview] = useState<DoctorDocument | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const docs =
    scope === "visit" && visitId
      ? forVisit(visitId)
      : forPatient(patientId);

  async function handleFile(file: File) {
    const text = await file.text().catch(() => `[plik binarny: ${file.name}]`);
    const content =
      text.slice(0, 8000) ||
      `Mock załącznik: ${file.name} (${file.type || "unknown"})`;
    const doc: DoctorDocument = {
      id: `doc-${crypto.randomUUID().slice(0, 8)}`,
      name: file.name,
      type,
      scope,
      patientId,
      visitId: scope === "visit" ? visitId : undefined,
      content,
      mimeType: file.type || "text/plain",
      sizeBytes: file.size || content.length,
      createdAt: new Date().toISOString(),
      createdBy: "Personel EDM",
    };
    add(doc);
    toast.success("Dokument dodany (mock storage).");
    if (inputRef.current) inputRef.current.value = "";
  }

  function downloadDoc(doc: DoctorDocument) {
    const blob = new Blob([doc.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = doc.name.endsWith(".txt") ? doc.name : `${doc.name}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Pobrano (mock).");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/80 p-4 sm:flex-row sm:items-end">
        <div className="space-y-1.5 sm:w-48">
          <Label className="text-xs">Typ dokumentu</Label>
          <Select
            value={type}
            onValueChange={(v) => setType(v as DocumentType)}
          >
            <SelectTrigger className="h-9 w-full bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map(
                (t) => (
                  <SelectItem key={t} value={t}>
                    {DOCUMENT_TYPE_LABELS[t]}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-brand-deep"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Upload mock — treść zapisywana w localStorage (nie chmura).
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-9 gap-1.5"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-4" />
          Wybierz plik
        </Button>
      </div>

      {docs.length === 0 ? (
        <EmptyState
          title="Brak dokumentów"
          description="Dodaj skierowanie, wynik, zgodę lub inny załącznik."
        />
      ) : (
        <ul className="divide-y rounded-lg border border-slate-200 bg-white">
          {docs.map((doc) => (
            <li
              key={doc.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-start gap-2">
                <FileText className="mt-0.5 size-4 shrink-0 text-brand" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{doc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOCUMENT_TYPE_LABELS[doc.type]} ·{" "}
                    {format(parseISO(doc.createdAt), "d.MM.yyyy HH:mm")} ·{" "}
                    {doc.createdBy}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {Math.max(1, Math.round(doc.sizeBytes / 1024))} KB
                </Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setPreview(doc)}
                  aria-label="Podgląd"
                >
                  <Eye className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => downloadDoc(doc)}
                  aria-label="Pobierz"
                >
                  <Download className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive"
                  onClick={() => {
                    remove(doc.id);
                    toast.message("Dokument usunięty");
                  }}
                  aria-label="Usuń"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-brand-heading">
              {preview?.name}
            </DialogTitle>
          </DialogHeader>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-xs text-slate-700">
            {preview?.content}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
}
