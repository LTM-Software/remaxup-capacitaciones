"use client";

import dynamic from "next/dynamic";
import { Download, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Carga diferida sin SSR (la librería del visor rompe en el servidor).
const DocumentViewerInner = dynamic(
  () => import("./document-viewer-inner"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[72vh]">
        <Loader2 className="h-8 w-8 animate-spin text-sky-700" />
      </div>
    ),
  }
);

interface DocumentViewerModalProps {
  url: string;
  fileName?: string;
  children: React.ReactNode; // trigger
}

// Visor embebido para PDF, DOCX, PPTX, XLSX e imágenes.
// Los formatos de Office se muestran vía el visor online de Microsoft,
// que requiere que la URL sea pública por HTTPS (MinIO ya lo es).
export const DocumentViewerModal = ({
  url,
  fileName,
  children,
}: DocumentViewerModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="pr-8 line-clamp-1">
            {fileName || "Documento"}
          </DialogTitle>
        </DialogHeader>
        <DocumentViewerInner url={url} fileName={fileName} />
        <div className="flex justify-end">
          <a href={url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
