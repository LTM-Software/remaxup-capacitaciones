"use client";

import axios from "axios";
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";

// El editor moderno se carga solo en cliente (evita mismatch de hidratación).
const RichEditor = dynamic(
  () => import("@/components/rich-editor"),
  {
    ssr: false,
    loading: () => (
      <div className="border rounded-lg bg-white min-h-[360px] animate-pulse" />
    ),
  }
);

interface SectionEditorProps {
  courseId: string;
  chapterId: string;
  sectionId: string;
  initialTitle: string;
  initialContent: string;
}

export const SectionEditor = ({
  courseId,
  chapterId,
  sectionId,
  initialTitle,
  initialContent,
}: SectionEditorProps) => {
  const router = useRouter();
  const base = `/api/courses/${courseId}/chapters/${chapterId}/sections/${sectionId}`;

  const [title, setTitle] = useState(initialTitle);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");
  const contentRef = useRef(initialContent);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const save = useCallback(
    async (data: { title?: string; content?: string }) => {
      try {
        setStatus("saving");
        await axios.patch(base, data);
        setStatus("saved");
        setTimeout(() => setStatus("idle"), 1500);
      } catch {
        setStatus("idle");
        toast.error("No se pudo guardar");
      }
    },
    [base]
  );

  const onContentChange = useCallback(
    (html: string) => {
      contentRef.current = html;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(
        () => save({ content: html }),
        900
      );
    },
    [save]
  );

  const saveTitle = () => {
    if (title.trim() && title !== initialTitle) {
      save({ title });
      router.refresh();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-x-3">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={saveTitle}
          placeholder="Título de la sección"
          className="text-lg font-medium"
        />
        <div className="w-28 shrink-0 text-sm text-slate-500 flex items-center gap-x-1">
          {status === "saving" && (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />{" "}
              Guardando
            </>
          )}
          {status === "saved" && (
            <>
              <Check className="h-4 w-4 text-emerald-600" />{" "}
              Guardado
            </>
          )}
        </div>
      </div>

      <RichEditor
        value={initialContent}
        onChange={onContentChange}
      />
      <p className="text-xs text-muted-foreground">
        Insertá texto, imágenes, videos, archivos y código con la
        barra de herramientas. Todo aparece intercalado en el
        contenido. Se guarda automáticamente.
      </p>
    </div>
  );
};
