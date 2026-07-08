import { redirect } from "next/navigation";

import { db } from "@/lib/db";

import { AdminCourseSidebar } from "./_components/admin-course-sidebar";

const AdminCourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const course = await db.course.findUnique({
    where: { id: params.courseId },
    include: {
      chapters: {
        orderBy: { position: "asc" },
        include: {
          sections: {
            orderBy: { position: "asc" },
            select: { id: true, title: true },
          },
        },
      },
      evaluations: { orderBy: { position: "asc" } },
    },
  });

  if (!course) {
    return redirect("/admin/courses");
  }

  type Node =
    | {
        type: "chapter";
        id: string;
        title: string;
        position: number;
        sections: { id: string; title: string }[];
      }
    | {
        type: "evaluation";
        id: string;
        title: string;
        position: number;
      };

  const structure: Node[] = [
    ...course.chapters.map(c => ({
      type: "chapter" as const,
      id: c.id,
      title: c.title,
      position: c.position,
      sections: c.sections,
    })),
    ...course.evaluations.map(e => ({
      type: "evaluation" as const,
      id: e.id,
      title: e.title,
      position: e.position,
    })),
  ].sort(
    (a, b) =>
      a.position - b.position ||
      (a.type === b.type ? 0 : a.type === "chapter" ? -1 : 1)
  );

  return (
    <div className="flex min-h-full">
      <div className="hidden lg:block w-72 shrink-0 border-r bg-white">
        <div className="sticky top-0 max-h-screen overflow-y-auto">
          <AdminCourseSidebar
            courseId={params.courseId}
            courseTitle={course.title}
            structure={structure}
          />
        </div>
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
};

export default AdminCourseLayout;
