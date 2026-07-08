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

  const Icon = isLocked ? Lock : passed ? CheckCircle : ClipboardCheck;
  const isActive = pathname?.includes(id);

  const onClick = () => {
    if (isLocked) return;
    router.push(`/courses/${courseId}/evaluations/${id}`);
  };

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive &&
          "text-slate-700 bg-slate-200/20 hover:text-slate-700",
        passed && "text-emerald-700 hover:text-emerald-700",
        isLocked && "text-slate-400 cursor-not-allowed hover:bg-transparent"
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 py-4">
        <Icon
          size={22}
          className={cn(
            "text-slate-500",
            isActive && "text-slate-700",
            passed && "text-emerald-700"
          )}
        />
        <span className="text-left">{label}</span>
        {isFinal && (
          <span className="text-[10px] font-semibold text-amber-600">
            (Final)
          </span>
        )}
        {isRequired && !isFinal && (
          <span className="text-[10px] font-semibold text-orange-600">
            (Obligatoria)
          </span>
        )}
        {passed && (
          <span className="text-[10px] font-semibold text-emerald-700">
            (Aprobada)
          </span>
        )}
        {attempted && !passed && !isLocked && (
          <span className="text-[10px] font-semibold text-amber-600">
            (Reintentar)
          </span>
        )}
      </div>
    </button>
  );
};
