import { Course } from "@prisma/client";

import { CourseProgress } from "@/components/course-progress";
import { CurriculumItem } from "@/actions/get-course-curriculum";

import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseEvaluationItem } from "./course-evaluation-item";
import { Logo } from "@/app/(dashboard)/_components/logo";

interface CourseSidebarProps {
  course: Course;
  items: CurriculumItem[];
  progressCount: number;
  hasPurchase: boolean;
}

export const CourseSidebar = ({
  course,
  items,
  progressCount,
  hasPurchase,
}: CourseSidebarProps) => {
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <Logo />
        <h1 className="font-semibold">{course.title}</h1>
        {hasPurchase && (
          <div className="mt-10">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {items.map(item =>
          item.type === "chapter" ? (
            <CourseSidebarItem
              key={`chapter-${item.id}`}
              id={item.id}
              label={item.title}
              isCompleted={item.completed}
              courseId={course.id}
              isLocked={item.locked}
            />
          ) : (
            <CourseEvaluationItem
              key={`evaluation-${item.id}`}
              id={item.id}
              label={item.title}
              courseId={course.id}
              passed={item.completed}
              attempted={item.attempted}
              isLocked={item.locked}
              isFinal={item.isFinal}
              isRequired={item.isRequired}
            />
          )
        )}
      </div>
    </div>
  );
};
