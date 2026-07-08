import { db } from "@/lib/db";

export type CurriculumItem = {
  type: "chapter" | "evaluation";
  id: string;
  title: string;
  position: number;
  isFree: boolean;
  completed: boolean;
  attempted: boolean;
  isRequired: boolean;
  isBlocking: boolean;
  isFinal: boolean;
  locked: boolean;
  lockReason: string | null;
};

interface GetCurriculumProps {
  userId: string;
  courseId: string;
  isAdmin?: boolean;
}

// Devuelve la secuencia unificada capítulos+evaluaciones (por position) con
// el estado de completado y bloqueo para el usuario.
export const getCourseCurriculum = async ({
  userId,
  courseId,
  isAdmin = false,
}: GetCurriculumProps): Promise<{
  items: CurriculumItem[];
  hasPurchase: boolean;
  allRequiredPassed: boolean;
}> => {
  const [chapters, evaluations, purchase] = await Promise.all([
    db.chapter.findMany({
      where: { courseId, isPublished: true },
      orderBy: { position: "asc" },
      include: { userProgress: { where: { userId } } },
    }),
    db.evaluation.findMany({
      where: { courseId, isPublished: true },
      orderBy: { position: "asc" },
      include: {
        attempts: {
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    }),
    db.purchase.findUnique({
      where: { userId_courseId: { userId, courseId } },
    }),
  ]);

  const hasPurchase = !!purchase;

  const requiredEvals = evaluations.filter(e => e.isRequired);
  const allRequiredPassed =
    requiredEvals.length === 0 ||
    requiredEvals.every(e => e.attempts[0]?.passed);

  const merged: CurriculumItem[] = [
    ...chapters.map(c => ({
      type: "chapter" as const,
      id: c.id,
      title: c.title,
      position: c.position,
      isFree: c.isFree,
      completed: !!c.userProgress[0]?.isCompleted,
      attempted: false,
      isRequired: false,
      isBlocking: false,
      isFinal: false,
      locked: false,
      lockReason: null as string | null,
    })),
    ...evaluations.map(e => ({
      type: "evaluation" as const,
      id: e.id,
      title: e.title,
      position: e.position,
      isFree: false,
      completed: !!e.attempts[0]?.passed,
      attempted: e.attempts.length > 0,
      isRequired: e.isRequired,
      isBlocking: e.isBlocking,
      isFinal: e.isFinal,
      locked: false,
      lockReason: null as string | null,
    })),
  ].sort(
    (a, b) =>
      a.position - b.position ||
      (a.type === b.type ? 0 : a.type === "chapter" ? -1 : 1)
  );

  let blockedFromHere = false;
  let blockingTitle = "";

  for (const it of merged) {
    if (isAdmin) {
      it.locked = false;
    } else {
      if (it.type === "chapter" && !it.isFree && !hasPurchase) {
        it.locked = true;
        it.lockReason = "Necesitás el curso para acceder.";
      }
      if (it.type === "evaluation" && !hasPurchase) {
        it.locked = true;
        it.lockReason = "Necesitás el curso para acceder.";
      }
      if (blockedFromHere) {
        it.locked = true;
        it.lockReason = `Aprobá "${blockingTitle}" para continuar.`;
      }
      if (it.type === "evaluation" && it.isFinal && !allRequiredPassed) {
        it.locked = true;
        it.lockReason =
          "Aprobá todas las evaluaciones obligatorias para habilitar la final.";
      }
    }

    // Una evaluación bloqueante no aprobada traba todo lo que sigue.
    if (
      it.type === "evaluation" &&
      it.isBlocking &&
      !it.completed &&
      !isAdmin
    ) {
      blockedFromHere = true;
      blockingTitle = it.title;
    }
  }

  return { items: merged, hasPurchase, allRequiredPassed };
};
