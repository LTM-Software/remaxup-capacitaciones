"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash, CheckCircle2, Circle } from "lucide-react";
import { Question, QuestionOption } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface QuestionCardProps {
  courseId: string;
  evaluationId: string;
  index: number;
  question: Question & { options: QuestionOption[] };
}

export const QuestionCard = ({
  courseId,
  evaluationId,
  index,
  question,
}: QuestionCardProps) => {
  const router = useRouter();
  const base = `/api/courses/${courseId}/evaluations/${evaluationId}/questions/${question.id}`;

  const [text, setText] = useState(question.text);
  const [newOption, setNewOption] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const saveText = async () => {
    if (text.trim() === question.text) return;
    try {
      await axios.patch(base, { text });
      toast.success("Pregunta actualizada");
      router.refresh();
    } catch {
      toast.error("No se pudo guardar la pregunta");
    }
  };

  const deleteQuestion = async () => {
    try {
      setIsLoading(true);
      await axios.delete(base);
      toast.success("Pregunta eliminada");
      router.refresh();
    } catch {
      toast.error("Algo no funcionó correctamente");
    } finally {
      setIsLoading(false);
    }
  };

  const addOption = async () => {
    if (!newOption.trim()) return;
    try {
      await axios.post(`${base}/options`, { text: newOption });
      setNewOption("");
      toast.success("Opción agregada");
      router.refresh();
    } catch {
      toast.error("No se pudo agregar la opción");
    }
  };

  const markCorrect = async (optionId: string) => {
    try {
      await axios.patch(`${base}/options/${optionId}`, {
        isCorrect: true,
      });
      router.refresh();
    } catch {
      toast.error("No se pudo marcar la opción");
    }
  };

  const updateOptionText = async (
    optionId: string,
    value: string,
    original: string
  ) => {
    if (value.trim() === original) return;
    try {
      await axios.patch(`${base}/options/${optionId}`, {
        text: value,
      });
      router.refresh();
    } catch {
      toast.error("No se pudo actualizar la opción");
    }
  };

  const deleteOption = async (optionId: string) => {
    try {
      await axios.delete(`${base}/options/${optionId}`);
      router.refresh();
    } catch {
      toast.error("No se pudo eliminar la opción");
    }
  };

  return (
    <div className="border bg-white rounded-md p-4 mb-4">
      <div className="flex items-start gap-x-2">
        <span className="mt-2 text-sm font-semibold text-slate-500">
          {index + 1}.
        </span>
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onBlur={saveText}
          placeholder="Escribí la pregunta"
          className="font-medium"
        />
        <ConfirmModal onConfirm={deleteQuestion}>
          <Button
            size="sm"
            variant="ghost"
            disabled={isLoading}
            className="text-red-600 hover:text-red-700"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </ConfirmModal>
      </div>

      <div className="mt-4 space-y-2 pl-6">
        {question.options.map(option => (
          <div
            key={option.id}
            className={cn(
              "flex items-center gap-x-2 rounded-md border px-2 py-1",
              option.isCorrect &&
                "border-emerald-300 bg-emerald-50"
            )}
          >
            <button
              type="button"
              onClick={() => markCorrect(option.id)}
              title="Marcar como correcta"
              className={cn(
                "shrink-0",
                option.isCorrect
                  ? "text-emerald-600"
                  : "text-slate-400 hover:text-slate-600"
              )}
            >
              {option.isCorrect ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
            <Input
              defaultValue={option.text}
              onBlur={e =>
                updateOptionText(
                  option.id,
                  e.target.value,
                  option.text
                )
              }
              placeholder="Texto de la opción"
              className="border-0 bg-transparent focus-visible:ring-0 h-8"
            />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteOption(option.id)}
              className="text-red-500 hover:text-red-600 shrink-0"
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <div className="flex items-center gap-x-2 pt-1">
          <Input
            value={newOption}
            onChange={e => setNewOption(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                e.preventDefault();
                addOption();
              }
            }}
            placeholder="Nueva opción de respuesta"
            className="h-8"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={addOption}
            className="shrink-0"
          >
            <PlusCircle className="h-4 w-4 mr-1" />
            Opción
          </Button>
        </div>
        <p className="text-xs text-muted-foreground pt-1">
          Marcá el círculo de la opción correcta. Se necesitan
          al menos 2 opciones y una correcta.
        </p>
      </div>
    </div>
  );
};
