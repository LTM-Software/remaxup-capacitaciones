import { redirect } from "next/navigation";

import { db } from "@/lib/db";

// Los capítulos ya no son páginas de contenido: el contenido vive en secciones.
// Redirige a la primera sección del capítulo (compatibilidad de enlaces viejos).
const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const section = await db.chapterSection.findFirst({
    where: { chapterId: params.chapterId },
    orderBy: { position: "asc" },
    select: { id: true },
  });

  if (section) {
    return redirect(
      `/courses/${params.courseId}/sections/${section.id}`
    );
  }

  return redirect(`/courses/${params.courseId}`);
};

export default ChapterIdPage;
