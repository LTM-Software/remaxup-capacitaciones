"use client";

import { ClipboardCheck, CheckCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

interface CourseEvaluationItemProps {
  label: string;
  id: string;
  courseId: string;
  passed: boolean;
  attempted: boolean;
}

export const CourseEvaluationItem = ({
  label,
  id,
  courseId,
  passed,
  attempted,
}: CourseEvaluationItemProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const Icon = passed ? CheckCircle : ClipboardCheck;
  const isActive = pathname?.includes(id);

  return (
    <button
      onClick={() =>
        router.push(`/courses/${courseId}/evaluations/${id}`)
      }
      type="button"
      className={cn(
        "flex items-center gap-x-2 text-slate-500 text-sm font-[500] pl-6 transition-all hover:text-slate-600 hover:bg-slate-300/20",
        isActive &&
          "text-slate-700 bg-slate-200/20 hover:text-slate-700",
        passed && "text-emerald-700 hover:text-emerald-700"
      )}
    >
      <div className="flex items-center gap-x-2 py-4">
        <Icon
          size={22}
          className={cn(
            "text-slate-500",
            isActive && "text-slate-700",
            passed && "text-emerald-700"
          )}
        />
        <span className="text-left">{label}</span>
        {passed && (
          <span className="text-[10px] font-semibold text-emerald-700">
            (Aprobada)
          </span>
        )}
        {attempted && !passed && (
          <span className="text-[10px] font-semibold text-amber-600">
            (Reintentar)
          </span>
        )}
      </div>
    </button>
  );
};
