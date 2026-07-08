import { Course } from "@prisma/client";
import { BookOpen } from "lucide-react";

import { CourseProgress } from "@/components/course-progress";
import { SidebarGroup } from "@/actions/get-course-curriculum";

import { CourseSectionItem } from "./course-section-item";
import { CourseEvaluationItem } from "./course-evaluation-item";
import { Logo } from "@/app/(dashboard)/_components/logo";

interface CourseSidebarProps {
  course: Course;
  groups: SidebarGroup[];
  progressCount: number;
  hasPurchase: boolean;
}

export const CourseSidebar = ({
  course,
  groups,
  progressCount,
  hasPurchase,
}: CourseSidebarProps) => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-6 flex flex-col border-b">
        <Logo />
        <h1 className="font-semibold mt-2 text-sm leading-snug">
          {course.title}
        </h1>
        {hasPurchase && (
          <div className="mt-6">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full py-2">
        {groups.map(group =>
          group.type === "chapter" ? (
            <div key={`chapter-${group.id}`} className="mb-1">
              <div className="flex items-center gap-x-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <BookOpen className="h-3.5 w-3.5" />
                <span className="line-clamp-1">
                  {group.title}
                </span>
              </div>
              {group.sections.length === 0 && (
                <p className="pl-8 pr-4 py-1 text-xs text-slate-400 italic">
                  Sin secciones
                </p>
              )}
              {group.sections.map(s => (
                <CourseSectionItem
                  key={s.id}
                  id={s.id}
                  label={s.title}
                  courseId={course.id}
                  isCompleted={s.completed}
                  isLocked={s.locked}
                />
              ))}
            </div>
          ) : (
            <div
              key={`evaluation-${group.id}`}
              className="border-y border-slate-100 my-1 bg-purple-50/40"
            >
              <CourseEvaluationItem
                id={group.id}
                label={group.title}
                courseId={course.id}
                passed={group.completed}
                attempted={group.attempted}
                isLocked={group.locked}
                isFinal={group.isFinal}
                isRequired={group.isRequired}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};
