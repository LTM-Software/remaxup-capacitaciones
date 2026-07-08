"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PlusCircle, X } from "lucide-react";
import { ChapterSection, SectionItem } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { SectionCard } from "./section-card";

interface SectionsFormProps {
  courseId: string;
  chapterId: string;
  sections: (ChapterSection & { items: SectionItem[] })[];
}

export const SectionsForm = ({
  courseId,
  chapterId,
  sections,
}: SectionsFormProps) => {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");

  const create = async () => {
    if (!title.trim()) return;
    try {
      await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/sections`,
        { title }
      );
      toast.success("Sección creada");
      setTitle("");
      setCreating(false);
      router.refresh();
    } catch {
      toast.error("Algo no funcionó correctamente");
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between mb-3">
        Secciones del capítulo
        <Button
          onClick={() => setCreating(c => !c)}
          variant="ghost"
          size="sm"
        >
          {creating ? (
            <X className="h-4 w-4" />
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-1" />
              Agregar sección
            </>
          )}
        </Button>
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
            placeholder="e.j. 'Material de lectura'"
          />
          <Button onClick={create} disabled={!title.trim()}>
            Crear
          </Button>
        </div>
      )}

      {sections.length === 0 && !creating && (
        <p className="text-sm text-slate-500 italic">
          Sin secciones. Agregá secciones con páginas y
          documentos.
        </p>
      )}

      {sections.map(section => (
        <SectionCard
          key={section.id}
          courseId={courseId}
          chapterId={chapterId}
          section={section}
        />
      ))}
    </div>
  );
};
