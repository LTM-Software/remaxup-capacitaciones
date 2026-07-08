"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Preview } from "@/components/preview";

interface HtmlPreviewModalProps {
  title?: string;
  content?: string | null;
  children: React.ReactNode; // trigger
}

// Vista previa in-app del contenido HTML de un documento (sección Documentos).
export const HtmlPreviewModal = ({
  title,
  content,
  children,
}: HtmlPreviewModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-8 line-clamp-1">
            {title || "Documento"}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-white rounded-md border p-3">
          <Preview value={content || "<p>Sin contenido</p>"} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
