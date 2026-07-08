import {
  Chapter,
  Course,
  Evaluation,
  EvaluationAttempt,
  UserProgress,
} from "@prisma/client";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { CourseProgress } from "@/components/course-progress";

import { CourseSidebarItem } from "./course-sidebar-item";
import { CourseEvaluationItem } from "./course-evaluation-item";
import { Logo } from "@/app/(dashboard)/_components/logo";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface CourseSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
    evaluations?: (Evaluation & {
      attempts: EvaluationAttempt[];
    })[];
  };
  progressCount: number;
}

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id || "";

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <Logo />
        <h1 className="font-semibold">{course.title}</h1>
        {purchase && (
          <div className="mt-10">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course.chapters.map(chapter => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={
              !!chapter.userProgress?.[0]?.isCompleted
            }
            courseId={course.id}
            isLocked={!chapter.isFree && !purchase}
          />
        ))}
      </div>
      {!!course.evaluations?.length && (
        <div className="flex flex-col w-full border-t mt-2 pt-2">
          <p className="px-6 py-2 text-xs font-semibold uppercase text-slate-500">
            Evaluaciones
          </p>
          {course.evaluations.map(evaluation => (
            <CourseEvaluationItem
              key={evaluation.id}
              id={evaluation.id}
              label={evaluation.title}
              courseId={course.id}
              passed={!!evaluation.attempts?.[0]?.passed}
              attempted={!!evaluation.attempts?.length}
            />
          ))}
        </div>
      )}
    </div>
  );
};
