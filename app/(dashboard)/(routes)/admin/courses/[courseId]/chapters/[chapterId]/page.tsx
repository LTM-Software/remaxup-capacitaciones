import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  FileStack,
} from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";

import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterAccessForm } from "./_components/chapter-access-form";
import { ChapterActions } from "./_components/chapter-actions";
import { ChapterSectionsManager } from "./_components/chapter-sections-manager";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const chapter = await db.chapter.findUnique({
    where: {
      id: params.chapterId,
      courseId: params.courseId,
    },
    include: {
      sections: {
        orderBy: { position: "asc" },
        select: { id: true, title: true, position: true },
      },
    },
  });

  if (!chapter) {
    return redirect(`/admin/courses/${params.courseId}`);
  }

  const isComplete =
    !!chapter.title && chapter.sections.length > 0;

  return (
    <>
      {!chapter.isPublished && (
        <Banner
          variant="warning"
          label="Este capítulo no está publicado. No va a ser visible en la capacitación."
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/admin/courses/${params.courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al curso
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">
                  Capítulo
                </h1>
                <span className="text-sm text-slate-700">
                  Un capítulo agrupa secciones (páginas de
                  contenido).
                </span>
              </div>
              <ChapterActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapter.isPublished}
              />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">Datos del capítulo</h2>
              </div>
              <ChapterTitleForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-xl">
                  Configuración de acceso
                </h2>
              </div>
              <ChapterAccessForm
                initialData={chapter}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={FileStack} />
              <h2 className="text-xl">Contenido (secciones)</h2>
            </div>
            <ChapterSectionsManager
              courseId={params.courseId}
              chapterId={params.chapterId}
              sections={chapter.sections}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default ChapterIdPage;
