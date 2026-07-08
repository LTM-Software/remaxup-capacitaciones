"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, PlusCircle, X } from "lucide-react";
import { Chapter, Course, Evaluation } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  CurriculumList,
  CurriculumItem,
} from "./curriculum-list";

interface CurriculumFormProps {
  initialData: Course & {
    chapters: Chapter[];
    evaluations: Evaluation[];
  };
  courseId: string;
}

export const CurriculumForm = ({
  initialData,
  courseId,
}: CurriculumFormProps) => {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [creating, setCreating] = useState<
    null | "chapter" | "evaluation"
  >(null);
  const [title, setTitle] = useState("");

  const items: CurriculumItem[] = [
    ...initialData.chapters.map(c => ({
      id: c.id,
      title: c.title,
      type: "chapter" as const,
      isPublished: c.isPublished,
      position: c.position,
    })),
    ...initialData.evaluations.map(e => ({
      id: e.id,
      title: e.title,
      type: "evaluation" as const,
      isPublished: e.isPublished,
      position: e.position,
      isBlocking: e.isBlocking,
      isFinal: e.isFinal,
      isRequired: e.isRequired,
    })),
  ].sort(
    (a, b) =>
      a.position - b.position ||
      (a.type === b.type ? 0 : a.type === "chapter" ? -1 : 1)
  );

  const create = async () => {
    if (!title.trim() || !creating) return;
    try {
      const endpoint =
        creating === "chapter"
          ? `/api/courses/${courseId}/chapters`
          : `/api/courses/${courseId}/evaluations`;
      await axios.post(endpoint, { title });
      toast.success(
        creating === "chapter"
          ? "Capítulo creado"
          : "Evaluación creada"
      );
      setTitle("");
      setCreating(null);
      router.refresh();
    } catch {
      toast.error("Algo no funcionó correctamente");
    }
  };

  const onReorder = async (
    updateData: {
      id: string;
      type: "chapter" | "evaluation";
      position: number;
    }[]
  ) => {
    try {
      setIsUpdating(true);
      await axios.put(
        `/api/courses/${courseId}/curriculum/reorder`,
        { list: updateData }
      );
      toast.success("Contenido reordenado");
      router.refresh();
    } catch {
      toast.error("Algo no funcionó correctamente");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (item: CurriculumItem) => {
    if (item.type === "chapter") {
      router.push(`/admin/courses/${courseId}/chapters/${item.id}`);
    } else {
      router.push(
        `/admin/courses/${courseId}/evaluations/${item.id}`
      );
    }
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center z-10">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between mb-2">
        Contenido del curso
        <div className="flex items-center gap-x-2">
          <Button
            onClick={() =>
              setCreating(c =>
                c === "chapter" ? null : "chapter"
              )
            }
            variant="ghost"
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Capítulo
          </Button>
          <Button
            onClick={() =>
              setCreating(c =>
                c === "evaluation" ? null : "evaluation"
              )
            }
            variant="ghost"
            size="sm"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Evaluación
          </Button>
        </div>
      </div>

      {creating && (
        <div className="flex items-center gap-x-2 mb-4">
          <Input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                create();
              }
            }}
            placeholder={
              creating === "chapter"
                ? "Título del capítulo"
                : "Título de la evaluación"
            }
          />
          <Button onClick={create} disabled={!title.trim()}>
            Crear
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCreating(null);
              setTitle("");
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {items.length === 0 && (
        <p className="text-sm text-slate-500 italic">
          Sin contenido todavía. Agregá capítulos y evaluaciones.
        </p>
      )}

      <CurriculumList
        items={items}
        onReorder={onReorder}
        onEdit={onEdit}
      />

      <p className="text-xs text-muted-foreground mt-4">
        Arrastrá para reordenar. Las evaluaciones pueden ir
        entre capítulos.
      </p>
    </div>
  );
};
