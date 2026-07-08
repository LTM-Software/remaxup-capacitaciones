import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const CourseIdPage = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return redirect("/login");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
    },
    include: {
      chapters: {
        where: {
          isPublished: true,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          userProgress: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!course || course.chapters.length === 0) {
    return redirect("/");
  }

  // Abrir el primer capítulo sin completar; si están todos
  // completos, abrir el primero.
  const firstIncomplete = course.chapters.find(
    chapter => !chapter.userProgress?.[0]?.isCompleted
  );
  const target = firstIncomplete ?? course.chapters[0];

  return redirect(`/courses/${course.id}/chapters/${target.id}`);
};

export default CourseIdPage;
