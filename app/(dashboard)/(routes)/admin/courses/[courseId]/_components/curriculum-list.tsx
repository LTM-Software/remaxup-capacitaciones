"use client";

import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  Grip,
  Pencil,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface CurriculumItem {
  id: string;
  title: string;
  type: "chapter" | "evaluation";
  isPublished: boolean;
  position: number;
  isBlocking?: boolean;
  isFinal?: boolean;
  isRequired?: boolean;
}

interface CurriculumListProps {
  items: CurriculumItem[];
  onReorder: (
    updateData: {
      id: string;
      type: "chapter" | "evaluation";
      position: number;
    }[]
  ) => void;
  onEdit: (item: CurriculumItem) => void;
}

export const CurriculumList = ({
  items,
  onReorder,
  onEdit,
}: CurriculumListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [list, setList] = useState(items);

  useEffect(() => setIsMounted(true), []);
  useEffect(() => setList(items), [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const reordered = Array.from(list);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setList(reordered);
    // renumerar toda la secuencia (1..N) para evitar colisiones de posición
    onReorder(
      reordered.map((item, index) => ({
        id: item.id,
        type: item.type,
        position: index + 1,
      }))
    );
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="curriculum">
        {provided => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {list.map((item, index) => {
              const isEval = item.type === "evaluation";
              const Icon = isEval ? ClipboardCheck : BookOpen;
              return (
                <Draggable
                  key={`${item.type}-${item.id}`}
                  draggableId={`${item.type}-${item.id}`}
                  index={index}
                >
                  {provided => (
                    <div
                      className={cn(
                        "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                        item.isPublished &&
                          "bg-sky-100 border-sky-200 text-sky-700",
                        isEval &&
                          "bg-purple-100 border-purple-200 text-purple-700",
                        isEval &&
                          item.isPublished &&
                          "bg-purple-200 border-purple-300"
                      )}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div
                        className="px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition"
                        {...provided.dragHandleProps}
                      >
                        <Grip className="h-5 w-5" />
                      </div>
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="line-clamp-1">
                        {item.title}
                      </span>
                      <div className="ml-auto pr-2 flex items-center gap-x-2">
                        {isEval && (
                          <Badge className="bg-purple-600">
                            Evaluación
                          </Badge>
                        )}
                        {item.isFinal && (
                          <Badge className="bg-amber-600">
                            Final
                          </Badge>
                        )}
                        {item.isRequired && (
                          <Badge className="bg-orange-500">
                            Obligatoria
                          </Badge>
                        )}
                        {item.isBlocking && (
                          <Badge className="bg-red-600">
                            Bloqueante
                          </Badge>
                        )}
                        <Badge
                          className={cn(
                            "bg-slate-500",
                            item.isPublished && "bg-sky-700"
                          )}
                        >
                          {item.isPublished
                            ? "Publicado"
                            : "Borrador"}
                        </Badge>
                        <Pencil
                          onClick={() => onEdit(item)}
                          className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              );
            })}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
