"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  Trash,
  FileText,
  File,
  PlusCircle,
  Pencil,
  X,
} from "lucide-react";
import { ChapterSection, SectionItem } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Editor } from "@/components/editor";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface SectionCardProps {
  courseId: string;
  chapterId: string;
  section: ChapterSection & { items: SectionItem[] };
}

export const SectionCard = ({
  courseId,
  chapterId,
  section,
}: SectionCardProps) => {
  const router = useRouter();
  const base = `/api/courses/${courseId}/chapters/${chapterId}/sections/${section.id}`;

  const [title, setTitle] = useState(section.title);
  const [mode, setMode] = useState<null | "page" | "document">(
    null
  );
  const [editingItemId, setEditingItemId] = useState<
    string | null
  >(null);

  // form state
  const [itemTitle, setItemTitle] = useState("");
  const [pageContent, setPageContent] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [busy, setBusy] = useState(false);

  const resetForm = () => {
    setMode(null);
    setEditingItemId(null);
    setItemTitle("");
    setPageContent("");
    setDocUrl("");
  };

  const saveTitle = async () => {
    if (title.trim() === section.title) return;
    try {
      await axios.patch(base, { title });
      router.refresh();
    } catch {
      toast.error("No se pudo guardar la sección");
    }
  };

  const deleteSection = async () => {
    try {
      await axios.delete(base);
      toast.success("Sección eliminada");
      router.refresh();
    } catch {
      toast.error("Algo no funcionó correctamente");
    }
  };

  const startAddPage = () => {
    resetForm();
    setMode("page");
  };
  const startAddDoc = () => {
    resetForm();
    setMode("document");
  };
  const startEditPage = (item: SectionItem) => {
    resetForm();
    setMode("page");
    setEditingItemId(item.id);
    setItemTitle(item.title);
    setPageContent(item.content || "");
  };

  const savePage = async () => {
    try {
      setBusy(true);
      if (editingItemId) {
        await axios.patch(`${base}/items/${editingItemId}`, {
          title: itemTitle,
          content: pageContent,
        });
      } else {
        await axios.post(`${base}/items`, {
          type: "PAGE",
          title: itemTitle,
          content: pageContent,
        });
      }
      toast.success("Página guardada");
      resetForm();
      router.refresh();
    } catch {
      toast.error("No se pudo guardar la página");
    } finally {
      setBusy(false);
    }
  };

  const onFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error();
      const { url, name } = await res.json();
      setDocUrl(url);
      if (!itemTitle) setItemTitle(name || file.name);
      toast.success("Archivo subido");
    } catch {
      toast.error("No se pudo subir el archivo");
    } finally {
      setBusy(false);
    }
  };

  const saveDoc = async () => {
    if (!docUrl) {
      toast.error("Subí un archivo primero");
      return;
    }
    try {
      setBusy(true);
      await axios.post(`${base}/items`, {
        type: "DOCUMENT",
        title: itemTitle || "Documento",
        url: docUrl,
      });
      toast.success("Documento agregado");
      resetForm();
      router.refresh();
    } catch {
      toast.error("No se pudo agregar el documento");
    } finally {
      setBusy(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await axios.delete(`${base}/items/${itemId}`);
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    }
  };

  return (
    <div className="border bg-white rounded-md p-4 mb-4">
      <div className="flex items-center gap-x-2">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
          className="font-medium"
          placeholder="Título de la sección"
        />
        <ConfirmModal onConfirm={deleteSection}>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </ConfirmModal>
      </div>

      {/* items existentes */}
      <div className="mt-3 space-y-2">
        {section.items.map(item => (
          <div
            key={item.id}
            className="flex items-center gap-x-2 rounded-md border px-2 py-1 text-sm bg-slate-50"
          >
            {item.type === "PAGE" ? (
              <FileText className="h-4 w-4 text-sky-600 shrink-0" />
            ) : (
              <File className="h-4 w-4 text-emerald-600 shrink-0" />
            )}
            <span className="line-clamp-1">{item.title}</span>
            <div className="ml-auto flex items-center gap-x-1">
              {item.type === "PAGE" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEditPage(item)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500"
                onClick={() => deleteItem(item.id)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        {section.items.length === 0 && !mode && (
          <p className="text-xs text-slate-500 italic">
            Sección vacía.
          </p>
        )}
      </div>

      {/* formularios */}
      {mode === "page" && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <Input
            value={itemTitle}
            onChange={e => setItemTitle(e.target.value)}
            placeholder="Título de la página (opcional)"
          />
          <Editor value={pageContent} onChange={setPageContent} />
          <div className="flex gap-x-2">
            <Button onClick={savePage} disabled={busy} size="sm">
              Guardar página
            </Button>
            <Button
              onClick={resetForm}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {mode === "document" && (
        <div className="mt-3 border-t pt-3 space-y-2">
          <Input
            value={itemTitle}
            onChange={e => setItemTitle(e.target.value)}
            placeholder="Nombre del documento"
          />
          <input
            type="file"
            onChange={onFile}
            disabled={busy}
            className="text-sm"
          />
          {docUrl && (
            <p className="text-xs text-emerald-600">
              Archivo listo ✓
            </p>
          )}
          <div className="flex gap-x-2">
            <Button
              onClick={saveDoc}
              disabled={busy || !docUrl}
              size="sm"
            >
              Agregar documento
            </Button>
            <Button
              onClick={resetForm}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {!mode && (
        <div className="mt-3 flex gap-x-2">
          <Button
            onClick={startAddPage}
            variant="outline"
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Página
          </Button>
          <Button
            onClick={startAddDoc}
            variant="outline"
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Documento
          </Button>
        </div>
      )}
    </div>
  );
};
