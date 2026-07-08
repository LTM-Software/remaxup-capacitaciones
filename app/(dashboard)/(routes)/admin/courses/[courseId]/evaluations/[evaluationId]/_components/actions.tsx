"use client";

import axios from "axios";
import { Trash } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/modals/confirm-modal";

interface EvaluationActionsProps {
  disabled: boolean;
  courseId: string;
  evaluationId: string;
  isPublished: boolean;
}

export const EvaluationActions = ({
  disabled,
  courseId,
  evaluationId,
  isPublished,
}: EvaluationActionsProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const base = `/api/courses/${courseId}/evaluations/${evaluationId}`;

  const onClick = async () => {
    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.patch(`${base}/unpublish`);
        toast.success("Evaluación despublicada");
      } else {
        await axios.patch(`${base}/publish`);
        toast.success("Evaluación publicada");
      }
      router.refresh();
    } catch (e: any) {
      toast.error(
        e?.response?.data ||
          "No se pudo publicar. Revisá preguntas y opciones."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setIsLoading(true);
      await axios.delete(base);
      toast.success("Evaluación eliminada");
      router.refresh();
      router.push(`/admin/courses/${courseId}`);
    } catch {
      toast.error("Algo no funcionó correctamente");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-x-2">
      <Button
        onClick={onClick}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? "Despublicar" : "Publicar"}
      </Button>
      <ConfirmModal onConfirm={onDelete}>
        <Button size="sm" disabled={isLoading}>
          <Trash className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
