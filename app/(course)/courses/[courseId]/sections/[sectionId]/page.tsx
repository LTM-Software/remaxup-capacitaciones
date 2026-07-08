import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { Banner } from "@/components/banner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdmin } from "@/lib/isAdminCheck";
import { getCourseCurriculum } from "@/actions/get-course-curriculum";

import { SectionCompleteButton } from "./_components/section-complete-button";

const SectionPage = async ({
  params,
}: {
  params: { courseId: string; sectionId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) return redirect("/login");
  const admin = isAdmin(role);

  const section = await db.chapterSection.findUnique({
    where: { id: params.sectionId },
    include: {
      chapter: true,
      progress: { where: { userId } },
    },
  });

  if (
    !section ||
    section.chapter.courseId !== params.courseId ||
    !section.chapter.isPublished
  ) {
    return redirect(`/courses/${params.courseId}`);
  }

  const { items } = await getCourseCurriculum({
    userId,
    courseId: params.courseId,
    isAdmin: admin,
  });
  const idx = items.findIndex(
    u => u.kind === "section" && u.id === params.sectionId
  );
  const current = idx >= 0 ? items[idx] : null;
  const next = idx >= 0 ? items[idx + 1] : null;
  const nextHref = next
    ? next.kind === "section"
      ? `/courses/${params.courseId}/sections/${next.id}`
      : `/courses/${params.courseId}/evaluations/${next.id}`
    : undefined;

  const locked = !!current?.locked && !admin;
  const isCompleted = !!section.progress[0]?.isCompleted;

  return (
    <div>
      {isCompleted && (
        <Banner
          variant="success"
          label="Ya completaste esta sección."
        />
      )}
      <div className="max-w-4xl mx-auto p-6 pb-24">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {section.chapter.title}
        </p>
        <h1 className="text-2xl font-semibold mt-1 mb-4">
          {section.title}
        </h1>

        {locked ? (
          <Banner
            variant="warning"
            label={
              current?.lockReason ||
              "Completá y aprobá la evaluación anterior para continuar."
            }
          />
        ) : (
          <>
            {section.content ? (
              <div
                className="rich-content"
                dangerouslySetInnerHTML={{
                  __html: section.content,
                }}
              />
            ) : (
              <p className="text-sm text-slate-400 italic">
                Esta sección todavía no tiene contenido.
              </p>
            )}

            <div className="mt-10 border-t pt-6">
              <SectionCompleteButton
                courseId={params.courseId}
                sectionId={section.id}
                isCompleted={isCompleted}
                nextHref={nextHref}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SectionPage;
