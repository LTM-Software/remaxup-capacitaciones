import { db } from "@/lib/db";

export const getProgress = async (
  userId: string,
  courseId: string
): Promise<number> => {
  try {
    // Secciones publicadas del curso (progreso a nivel sección)
    const sections = await db.chapterSection.findMany({
      where: {
        chapter: { courseId, isPublished: true },
      },
      select: { id: true },
    });

    const sectionIds = sections.map(s => s.id);
    if (sectionIds.length === 0) return 0;

    const completed = await db.sectionProgress.count({
      where: {
        userId,
        sectionId: { in: sectionIds },
        isCompleted: true,
      },
    });

    return (completed / sectionIds.length) * 100;
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return 0;
  }
};
