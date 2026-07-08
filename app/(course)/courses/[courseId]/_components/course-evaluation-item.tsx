"use client";

import { ClipboardCheck, CheckCircle, Lock } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface CourseEvaluationItemProps {
  label: string;
  id: string;
  courseId: string;
  passed: boolean;
  attempted: boolean;
  isLocked?: boolean;
  isFinal?: boolean;
  isRequired?: boolean;
}

export const CourseEvaluationItem = ({
  label,
  id,
  courseId,
  passed,
  attempted,
  isLocked = false,
  isFinal = false,
  isRequired = false,
}: CourseEvaluationItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = isLocked
    ? Lock
    : passed
      ? CheckCircle
      : ClipboardCheck;
  const isActive = pathname?.includes(id);

  return (
    <button
      type="button"
      onClick={() => {
        if (isLocked) return;
        router.push(`/courses/${courseId}/evaluations/${id}`);
      }}
      className={cn(
        "w-full flex items-start gap-x-2 px-2 py-1.5 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-50 transition text-left",
        isActive && "bg-purple-100",
        passed && "text-emerald-700 hover:bg-emerald-50",
        isLocked &&
          "text-slate-400 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 mt-0.5",
          passed && "text-emerald-600"
        )}
      />
      <span className="flex flex-col">
        <span className="line-clamp-2">{label}</span>
        <span className="flex flex-wrap gap-x-2 text-[10px] font-semibold">
          {isFinal && (
            <span className="text-amber-600">Final</span>
          )}
          {isRequired && !isFinal && (
            <span className="text-orange-600">Obligatoria</span>
          )}
          {passed && (
            <span className="text-emerald-700">Aprobada</span>
          )}
          {attempted && !passed && !isLocked && (
            <span className="text-amber-600">Reintentar</span>
          )}
        </span>
      </span>
    </button>
  );
};
