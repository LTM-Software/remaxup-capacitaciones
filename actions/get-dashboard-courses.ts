import { Category, Chapter, Course } from "@prisma/client";

import { db } from "@/lib/db";
import { getProgress } from "@/actions/get-progress";

type CourseWithProgressWithCategory = Course & {
  category: Category;
  chapters: Chapter[];
  progress: number | null;
};

type DashboardCourses = {
  completedCourses: CourseWithProgressWithCategory[];
  coursesInProgress: CourseWithProgressWithCategory[];
};

export const getDashboardCourses = async (
  userId: string
): Promise<DashboardCourses> => {
  try {
    // Sin "compra": los cursos "en progreso/completados" son aquellos donde
    // el usuario tiene avance (secciones completadas).
    const progressed = await db.sectionProgress.findMany({
      where: { userId, isCompleted: true },
      select: {
        section: {
          select: { chapter: { select: { courseId: true } } },
        },
      },
    });

    const courseIds = Array.from(
      new Set(progressed.map(r => r.section.chapter.courseId))
    );

    const courses = (await db.course.findMany({
      where: { id: { in: courseIds } },
      include: {
        category: true,
        chapters: { where: { isPublished: true } },
      },
    })) as CourseWithProgressWithCategory[];

    for (let course of courses) {
      const progress = await getProgress(userId, course.id);
      course["progress"] = progress;
    }

    const completedCourses = courses.filter(
      course => course.progress === 100
    );
    const coursesInProgress = courses.filter(
      course => (course.progress ?? 0) < 100
    );

    return {
      completedCourses,
      coursesInProgress,
    };
  } catch (error) {
    console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    };
  }
};
