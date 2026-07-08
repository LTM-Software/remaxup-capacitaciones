"use client";

import { Evaluation } from "@prisma/client";
import { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Grip, Pencil } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface EvaluationsListProps {
  items: Evaluation[];
  onReorder: (
    updateData: { id: string; position: number }[]
  ) => void;
  onEdit: (id: string) => void;
}

export const EvaluationsList = ({
  items,
  onReorder,
  onEdit,
}: EvaluationsListProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [evaluations, setEvaluations] = useState(items);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setEvaluations(items);
  }, [items]);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(evaluations);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const startIndex = Math.min(
      result.source.index,
      result.destination.index
    );
    const endIndex = Math.max(
      result.source.index,
      result.destination.index
    );

    const updated = items.slice(startIndex, endIndex + 1);

    setEvaluations(items);

    const bulkUpdateData = updated.map(evaluation => ({
      id: evaluation.id,
      position: items.findIndex(
        item => item.id === evaluation.id
      ),
    }));

    onReorder(bulkUpdateData);
  };

  if (!isMounted) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="evaluations">
        {provided => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {evaluations.map((evaluation, index) => (
              <Draggable
                key={evaluation.id}
                draggableId={evaluation.id}
                index={index}
              >
                {provided => (
                  <div
                    className={cn(
                      "flex items-center gap-x-2 bg-slate-200 border-slate-200 border text-slate-700 rounded-md mb-4 text-sm",
                      evaluation.isPublished &&
                        "bg-sky-100 border-sky-200 text-sky-700"
                    )}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                  >
                    <div
                      className={cn(
                        "px-2 py-3 border-r border-r-slate-200 hover:bg-slate-300 rounded-l-md transition",
                        evaluation.isPublished &&
                          "border-r-sky-200 hover:bg-sky-200"
                      )}
                      {...provided.dragHandleProps}
                    >
                      <Grip className="h-5 w-5" />
                    </div>
                    {evaluation.title}
                    <div className="ml-auto pr-2 flex items-center gap-x-2">
                      <Badge
                        className={cn(
                          "bg-slate-500",
                          evaluation.isPublished && "bg-sky-700"
                        )}
                      >
                        {evaluation.isPublished
                          ? "Publicada"
                          : "Borrador"}
                      </Badge>
                      <Pencil
                        onClick={() => onEdit(evaluation.id)}
                        className="w-4 h-4 cursor-pointer hover:opacity-75 transition"
                      />
                    </div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};
