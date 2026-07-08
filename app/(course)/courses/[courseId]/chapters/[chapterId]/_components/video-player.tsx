"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import ReactPlayer from "react-player";
import { useConfettiStore } from "@/hooks/use-confetti-store";

interface VideoPlayerProps {
  courseId: string;
  chapterId: string;
  nextHref?: string;
  isLocked: boolean;
  completeOnEnd: boolean;
  title: string;
  url: string;
  startPlaying?: boolean;
}

export const VideoPlayer = ({
  courseId,
  chapterId,
  nextHref,
  isLocked,
  completeOnEnd,
  title,
  url,
  startPlaying = true,
}: VideoPlayerProps) => {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const confetti = useConfettiStore();

  const onEnd = async () => {
    try {
      if (completeOnEnd) {
        await axios.put(
          `/api/courses/${courseId}/chapters/${chapterId}/progress`,
          {
            isCompleted: true,
          }
        );

        if (!nextHref) {
          confetti.onOpen();
        }

        toast.success("Progreso actualizado");
        router.refresh();

        if (nextHref) {
          router.push(nextHref);
        }
      }
    } catch {
      toast.error("Algo no funcionó correctamente");
    }
  };

  return (
    <div className="relative aspect-video">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 flex-col gap-y-2 text-secondary">
          <Lock className="h-8 w-8" />
          <p className="text-sm">Este capítulo está bloqueado</p>
        </div>
      )}
      {!isLocked && (
        <>
          <ReactPlayer
            url={url}
            playing={startPlaying}
            controls={true}
            onReady={() => setIsReady(true)}
            onEnded={onEnd}
            width="100%" // Asegura que el reproductor ocupe todo el ancho del contenedor.
            height="100%" // Ajusta la altura según sea necesario para mantener la relación de aspecto.
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload",
                },
              },
            }}
          />
        </>
      )}
    </div>
  );
};
