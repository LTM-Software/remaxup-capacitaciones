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
}: CourseSidebarProps) => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-6 flex flex-col border-b">
        <Logo />
        <h1 className="font-semibold mt-2 text-sm leading-snug">
          {course.title}
        </h1>
        <div className="mt-6">
          <CourseProgress
            variant="success"
            value={progressCount}
          />
        </div>
      </div>

      <div className="p-3 space-y-2">
        {groups.map(group =>
          group.type === "chapter" ? (
            <div key={`chapter-${group.id}`}>
              <div className="flex items-center gap-x-2 px-2 py-1.5 rounded-md text-sm font-semibold text-slate-700">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="line-clamp-2">
                  {group.title}
                </span>
              </div>
              <div className="ml-3 border-l pl-2 mt-0.5">
                {group.sections.length === 0 && (
                  <p className="px-2 py-1.5 text-xs text-slate-400 italic">
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
            </div>
          ) : (
            <CourseEvaluationItem
              key={`evaluation-${group.id}`}
              id={group.id}
              label={group.title}
              courseId={course.id}
              passed={group.completed}
              attempted={group.attempted}
              isLocked={group.locked}
              isFinal={group.isFinal}
              isRequired={group.isRequired}
            />
          )
        )}
      </div>
    </div>
  );
};
