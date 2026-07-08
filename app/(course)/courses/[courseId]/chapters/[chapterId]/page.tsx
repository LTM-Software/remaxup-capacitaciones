import { redirect } from "next/navigation";
import { File, FileText } from "lucide-react";

import { db } from "@/lib/db";
import { getChapter } from "@/actions/get-chapter";
import { getCourseCurriculum } from "@/actions/get-course-curriculum";
import { isAdmin } from "@/lib/isAdminCheck";
import { Banner } from "@/components/banner";
import { Separator } from "@/components/ui/separator";
import { Preview } from "@/components/preview";
import { DocumentViewerModal } from "@/components/document-viewer-modal";

import { VideoPlayer } from "./_components/video-player";
import { CourseEnrollButton } from "./_components/course-enroll-button";
import { CourseProgressButton } from "./_components/course-progress-button";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sanitizeFileName } from "@/helpers/name-cleaner";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    return redirect("/");
  }

  const {
    chapter,
    course,
    attachments,
    userProgress,
    purchase,
  } = await getChapter({
    userId,
    chapterId: params.chapterId,
    courseId: params.courseId,
  });

  if (!chapter || !course) {
    return redirect("/");
  }

  const admin = isAdmin(role);

  // Secuencia unificada del curso (para bloqueo y "siguiente")
  const { items } = await getCourseCurriculum({
    userId,
    courseId: params.courseId,
    isAdmin: admin,
  });
  const currentIndex = items.findIndex(
    i => i.type === "chapter" && i.id === params.chapterId
  );
  const currentItem =
    currentIndex >= 0 ? items[currentIndex] : null;
  const nextItem =
    currentIndex >= 0 ? items[currentIndex + 1] : null;
  const nextHref = nextItem
    ? nextItem.type === "chapter"
      ? `/courses/${params.courseId}/chapters/${nextItem.id}`
      : `/courses/${params.courseId}/evaluations/${nextItem.id}`
    : undefined;

  const purchaseLocked = !chapter.isFree && !purchase;
  const sequentiallyLocked =
    !!currentItem?.locked && !purchaseLocked && !admin;

  // Bloqueo secuencial: no mostrar contenido, sólo el aviso.
  if (sequentiallyLocked) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Banner
          variant="warning"
          label={
            currentItem?.lockReason ||
            "Completá y aprobá la evaluación anterior para continuar."
          }
        />
      </div>
    );
  }

  // Secciones del capítulo (páginas + documentos)
  const sections = await db.chapterSection.findMany({
    where: { chapterId: params.chapterId },
    orderBy: { position: "asc" },
    include: { items: { orderBy: { position: "asc" } } },
  });

  const completeOnEnd = !!purchase && !userProgress?.isCompleted;

  return (
    <div>
      {userProgress?.isCompleted && (
        <Banner
          variant="success"
          label="Ya completaste este capítulo."
        />
      )}
      {purchaseLocked && (
        <Banner
          variant="warning"
          label="Necesitas agregar el curso para mirar el capítulo."
        />
      )}
      <div className="flex flex-col max-w-4xl mx-auto pb-20">
        {chapter && chapter.videoUrl && (
          <div className="p-4">
            <VideoPlayer
              chapterId={params.chapterId}
              title={chapter.title}
              courseId={params.courseId}
              nextHref={nextHref}
              isLocked={purchaseLocked}
              completeOnEnd={completeOnEnd}
              url={chapter.videoUrl}
            />
          </div>
        )}
        <div>
          <div className="p-4 flex flex-col md:flex-row items-center justify-between">
            <h2 className="text-2xl font-semibold mb-2">
              {chapter.title}
            </h2>
            {purchase ? (
              <CourseProgressButton
                chapterId={params.chapterId}
                courseId={params.courseId}
                nextHref={nextHref}
                isCompleted={!!userProgress?.isCompleted}
              />
            ) : (
              <CourseEnrollButton
                courseId={params.courseId}
                price={course.price!}
              />
            )}
          </div>
          <Separator />
          <div>
            <Preview value={chapter.description!} />
          </div>

          {/* Secciones del capítulo: cada una con sus páginas y documentos */}
          {!purchaseLocked &&
            sections.map(section => (
              <div key={section.id} className="px-4 mt-6">
                <div className="rounded-lg border bg-white overflow-hidden">
                  <div className="bg-slate-50 border-b px-4 py-2.5 font-semibold text-slate-800">
                    {section.title}
                  </div>
                  <div className="p-4 space-y-4">
                    {section.items.length === 0 && (
                      <p className="text-sm text-slate-400 italic">
                        Sección vacía.
                      </p>
                    )}
                    {section.items.map(item =>
                      item.type === "PAGE" ? (
                        <div key={item.id}>
                          {item.title && (
                            <p className="font-medium text-slate-800 mb-1">
                              {item.title}
                            </p>
                          )}
                          <div className="prose prose-sm max-w-none">
                            <Preview value={item.content || ""} />
                          </div>
                        </div>
                      ) : (
                        <DocumentViewerModal
                          key={item.id}
                          url={item.url || ""}
                          fileName={item.title}
                        >
                          <button
                            type="button"
                            className="flex items-center gap-x-3 p-3 w-full border rounded-md hover:bg-slate-50 transition text-left"
                          >
                            <FileText className="h-5 w-5 text-sky-600 shrink-0" />
                            <span className="flex-1 line-clamp-1 text-slate-700">
                              {item.title}
                            </span>
                            <span className="text-xs text-sky-600 font-medium shrink-0">
                              Ver
                            </span>
                          </button>
                        </DocumentViewerModal>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}

          {/* Archivos del curso (disponibles en toda la capacitación) */}
          {!purchaseLocked && !!attachments.length && (
            <div className="px-4 mt-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Archivos del curso
              </h3>
              <div className="flex flex-col gap-y-2">
                {attachments.map(attachment => (
                  <DocumentViewerModal
                    key={attachment.id}
                    url={attachment.url}
                    fileName={sanitizeFileName(attachment.name)}
                  >
                    <button
                      type="button"
                      className="flex items-center gap-x-3 p-3 w-full border rounded-md hover:bg-slate-50 transition text-left"
                    >
                      <File className="h-5 w-5 text-slate-500 shrink-0" />
                      <span className="flex-1 line-clamp-1 text-slate-700">
                        {sanitizeFileName(attachment.name)}
                      </span>
                      <span className="text-xs text-sky-600 font-medium shrink-0">
                        Ver
                      </span>
                    </button>
                  </DocumentViewerModal>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterIdPage;
