"use client";

import axios from "axios";
import { CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface SectionCompleteButtonProps {
  courseId: string;
  sectionId: string;
  isCompleted: boolean;
  nextHref?: string;
}

export const SectionCompleteButton = ({
  courseId,
  sectionId,
  isCompleted,
  nextHref,
}: SectionCompleteButtonProps) => {
  const router = useRouter();
  const confetti = useConfettiStore();
  const [isLoading, setIsLoading] = useState(false);

  const onClick = async () => {
    try {
      setIsLoading(true);
      await axios.put(
        `/api/courses/${courseId}/sections/${sectionId}/progress`,
        { isCompleted: !isCompleted }
      );

      if (!isCompleted && !nextHref) {
        confetti.onOpen();
      }
      toast.success("Progreso actualizado");
      router.refresh();
      if (!isCompleted && nextHref) {
        router.push(nextHref);
      }
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
        disabled={isLoading}
        variant={isCompleted ? "outline" : "success"}
      >
        {isCompleted ? (
          <>
            Marcar como no completado
            <XCircle className="h-4 w-4 ml-2" />
          </>
        ) : (
          <>
            Completar y continuar
            {nextHref ? (
              <ArrowRight className="h-4 w-4 ml-2" />
            ) : (
              <CheckCircle className="h-4 w-4 ml-2" />
            )}
          </>
        )}
      </Button>
    </div>
  );
};
