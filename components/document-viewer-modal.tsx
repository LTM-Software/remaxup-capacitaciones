"use client";

import { Download } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ViewerType = "pdf" | "image" | "office" | "other";

const getViewerType = (url: string): ViewerType => {
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  const ext = clean.substring(clean.lastIndexOf(".") + 1);
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext))
    return "image";
  if (
    ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)
  )
    return "office";
  return "other";
};

interface DocumentViewerModalProps {
  url: string;
  fileName?: string;
  children: React.ReactNode; // trigger
}

// Visor embebido por tipo de archivo. PDF/imágenes se muestran de forma
// nativa; los documentos de Office vía el visor online de Microsoft
// (requiere URL pública HTTPS — MinIO ya lo es).
export const DocumentViewerModal = ({
  url,
  fileName,
  children,
}: DocumentViewerModalProps) => {
  const type = getViewerType(url);
  const officeSrc = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
    url
  )}`;

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="pr-8 line-clamp-1">
            {fileName || "Documento"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 h-[72vh] w-full bg-slate-50 rounded-md overflow-auto">
          {type === "pdf" && (
            <iframe
              src={url}
              title={fileName || "PDF"}
              className="w-full h-full border-0"
            />
          )}
          {type === "image" && (
            <div className="flex items-center justify-center h-full p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={fileName || "Imagen"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          )}
          {type === "office" && (
            <iframe
              src={officeSrc}
              title={fileName || "Documento"}
              className="w-full h-full border-0"
            />
          )}
          {type === "other" && (
            <div className="flex flex-col items-center justify-center h-full gap-y-3 text-slate-600">
              <p className="text-sm">
                No se puede previsualizar este tipo de archivo.
              </p>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar archivo
                </Button>
              </a>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-1">
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
