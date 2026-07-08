"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Grip,
  Pencil,
  Trash,
  PlusCircle,
  Loader2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface SectionRow {
  id: string;
  title: string;
  position: number;
}

interface Props {
  courseId: string;
  chapterId: string;
  sections: SectionRow[];
}

export const ChapterSectionsManager = ({
  courseId,
  chapterId,
  sections,
}: Props) => {
  const router = useRouter();
  const base = `/api/courses/${courseId}/chapters/${chapterId}/sections`;
  const [mounted, setMounted] = useState(false);
  const [list, setList] = useState(sections);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => setList(sections), [sections]);

  const create = async () => {
    if (!title.trim()) return;
    try {
      setBusy(true);
      const { data } = await axios.post(base, { title });
      setTitle("");
      toast.success("Sección creada");
      router.refresh();
      router.push(
        `/admin/courses/${courseId}/sections/${data.id}`
      );
    } catch {
      toast.error("No se pudo crear");
    } finally {
      setBusy(false);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(list);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setList(items);
    try {
      setBusy(true);
      await axios.put(`${base}/reorder`, {
        list: items.map((s, i) => ({
          id: s.id,
          position: i + 1,
        })),
      });
      toast.success("Secciones reordenadas");
      router.refresh();
    } catch {
      toast.error("No se pudo reordenar");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    try {
      setBusy(true);
      await axios.delete(`${base}/${id}`);
      toast.success("Sección eliminada");
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {busy && (
        <div className="absolute inset-0 bg-slate-500/10 rounded-md flex items-center justify-center z-10">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium mb-2">Secciones (páginas)</div>

      {mounted && (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="chapter-sections">
            {provided => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {list.map((s, index) => (
                  <Draggable
                    key={s.id}
                    draggableId={s.id}
                    index={index}
                  >
                    {provided => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "flex items-center gap-x-2 bg-white border rounded-md mb-2 text-sm"
                        )}
                      >
                        <div
                          {...provided.dragHandleProps}
                          className="px-2 py-3 border-r hover:bg-slate-100 rounded-l-md"
                        >
                          <Grip className="h-4 w-4" />
                        </div>
                        <span className="line-clamp-1 flex-1">
                          {s.title}
                        </span>
                        <Link
                          href={`/admin/courses/${courseId}/sections/${s.id}`}
                          className="text-sky-600 text-xs font-medium flex items-center gap-x-1 hover:underline pr-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Editar contenido
                        </Link>
                        <ConfirmModal
                          onConfirm={() => remove(s.id)}
                        >
                          <button className="pr-3 text-red-500 hover:text-red-600">
                            <Trash className="h-4 w-4" />
                          </button>
                        </ConfirmModal>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {list.length === 0 && (
        <p className="text-sm text-slate-500 italic mb-2">
          Sin secciones todavía.
        </p>
      )}

      <div className="flex items-center gap-x-2 mt-3">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              create();
            }
          }}
          placeholder="Título de la nueva sección"
          disabled={busy}
        />
        <Button
          onClick={create}
          disabled={busy || !title.trim()}
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Agregar
        </Button>
      </div>
    </div>
  );
};
