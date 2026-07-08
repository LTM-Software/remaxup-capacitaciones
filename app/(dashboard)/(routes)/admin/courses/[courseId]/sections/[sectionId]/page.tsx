import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { db } from "@/lib/db";

import { SectionEditor } from "./_components/section-editor";

const AdminSectionPage = async ({
  params,
}: {
  params: { courseId: string; sectionId: string };
}) => {
  const section = await db.chapterSection.findUnique({
    where: { id: params.sectionId },
    include: { chapter: true },
  });

  if (!section || section.chapter.courseId !== params.courseId) {
    return redirect(`/admin/courses/${params.courseId}`);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link
        href={`/admin/courses/${params.courseId}/chapters/${section.chapterId}`}
        className="flex items-center text-sm hover:opacity-75 transition mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver al capítulo
      </Link>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
        {section.chapter.title}
      </p>
      <h1 className="text-2xl font-medium mb-6">
        Editar sección
      </h1>
      <SectionEditor
        courseId={params.courseId}
        chapterId={section.chapterId}
        sectionId={section.id}
        initialTitle={section.title}
        initialContent={section.content || ""}
      />
    </div>
  );
};

export default AdminSectionPage;
