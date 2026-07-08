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
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-8 pr-4 py-3 transition-all hover:text-slate-600 hover:bg-slate-300/20 text-left",
        isActive &&
          "text-slate-700 bg-sky-50 border-r-2 border-sky-600 hover:text-slate-700",
        isCompleted && "text-emerald-700 hover:text-emerald-700",
        isLocked &&
          "text-slate-400 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <Icon size={18} className="shrink-0" />
      <span className="line-clamp-2">{label}</span>
    </button>
  );
};
