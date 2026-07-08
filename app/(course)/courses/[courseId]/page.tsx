import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { getCourseCurriculum } from "@/actions/get-course-curriculum";
import { isAdmin } from "@/lib/isAdminCheck";

const CourseIdPage = async ({
  params,
}: {
  params: { courseId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    return redirect("/login");
  }

  const { items } = await getCourseCurriculum({
    userId,
    courseId: params.courseId,
    isAdmin: isAdmin(role),
  });

  if (items.length === 0) {
    return redirect("/");
  }

  // Primer ítem accesible sin completar; si no hay, el primer accesible; si
  // no, el primero de la lista.
  const target =
    items.find(i => !i.completed && !i.locked) ||
    items.find(i => !i.locked) ||
    items[0];

  const href =
    target.type === "chapter"
      ? `/courses/${params.courseId}/chapters/${target.id}`
      : `/courses/${params.courseId}/evaluations/${target.id}`;

  return redirect(href);
};

export default CourseIdPage;
