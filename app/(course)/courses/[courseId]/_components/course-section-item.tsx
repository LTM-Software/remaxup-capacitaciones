"use client";

import { CheckCircle, Lock, FileText } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface CourseSectionItemProps {
  id: string;
  label: string;
  courseId: string;
  isCompleted: boolean;
  isLocked: boolean;
}

export const CourseSectionItem = ({
  id,
  label,
  courseId,
  isCompleted,
  isLocked,
}: CourseSectionItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked
    ? Lock
    : isCompleted
      ? CheckCircle
      : FileText;
  const isActive = pathname?.includes(id);

  return (
    <button
      type="button"
      onClick={() => {
        if (isLocked) return;
        router.push(`/courses/${courseId}/sections/${id}`);
      }}
      className={cn(
        "w-full flex items-center gap-x-2 px-2 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100 transition text-left",
        isActive && "bg-sky-50 text-sky-700 font-medium",
        isCompleted && "text-emerald-700",
        isLocked &&
          "text-slate-400 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          isCompleted && "text-emerald-600"
        )}
      />
      <span className="line-clamp-2">{label}</span>
    </button>
  );
};
