import { db } from "@/lib/db";

export type FlatUnit = {
  kind: "section" | "evaluation";
  id: string;
  title: string;
  chapterId?: string;
  isFree: boolean;
  completed: boolean;
  attempted: boolean;
  isRequired: boolean;
  isBlocking: boolean;
  isFinal: boolean;
  locked: boolean;
  lockReason: string | null;
};

export type SidebarSection = {
  id: string;
  title: string;
  completed: boolean;
  locked: boolean;
};

export type SidebarGroup =
  | {
      type: "chapter";
      id: string;
      title: string;
      sections: SidebarSection[];
    }
  | {
      type: "evaluation";
      id: string;
      title: string;
      completed: boolean;
      attempted: boolean;
      locked: boolean;
      isFinal: boolean;
      isRequired: boolean;
    };

interface Props {
  userId: string;
  courseId: string;
  isAdmin?: boolean;
}

// Secuencia unificada del curso: capítulos (con sus secciones) + evaluaciones
// por `position`. La completitud es a nivel sección; el bloqueo es secuencial.
export const getCourseCurriculum = async ({
  userId,
  courseId,
  isAdmin = false,
}: Props) => {
  const [chapters, evaluations, purchase] = await Promise.all([
    db.chapter.findMany({
      where: { courseId, isPublished: true },
      orderBy: { position: "asc" },
      include: {
        sections: {
          orderBy: { position: "asc" },
          include: { progress: { where: { userId } } },
        },
      },
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

  // top-level ordenado (capítulos + evaluaciones)
  type Top =
    | {
        kind: "chapter";
        position: number;
        data: (typeof chapters)[number];
      }
    | {
        kind: "evaluation";
        position: number;
        data: (typeof evaluations)[number];
      };
  const top: Top[] = [
    ...chapters.map(c => ({
      kind: "chapter" as const,
      position: c.position,
      data: c,
    })),
    ...evaluations.map(e => ({
      kind: "evaluation" as const,
      position: e.position,
      data: e,
    })),
  ].sort(
    (a, b) =>
      a.position - b.position ||
      (a.kind === b.kind ? 0 : a.kind === "chapter" ? -1 : 1)
  );

  // secuencia plana navegable (secciones + evaluaciones)
  const flat: FlatUnit[] = [];
  for (const t of top) {
    if (t.kind === "chapter") {
      for (const s of t.data.sections) {
        flat.push({
          kind: "section",
          id: s.id,
          title: s.title,
          chapterId: t.data.id,
          isFree: t.data.isFree,
          completed: !!s.progress[0]?.isCompleted,
          attempted: false,
          isRequired: false,
          isBlocking: false,
          isFinal: false,
          locked: false,
          lockReason: null,
        });
      }
    } else {
      const e = t.data;
      flat.push({
        kind: "evaluation",
        id: e.id,
        title: e.title,
        isFree: false,
        completed: !!e.attempts[0]?.passed,
        attempted: e.attempts.length > 0,
        isRequired: e.isRequired,
        isBlocking: e.isBlocking,
        isFinal: e.isFinal,
        locked: false,
        lockReason: null,
      });
    }
  }

  // calcular bloqueo
  let blockedFrom = false;
  let blockingTitle = "";
  for (const u of flat) {
    if (isAdmin) {
      u.locked = false;
    } else {
      if (u.kind === "section" && !u.isFree && !hasPurchase) {
        u.locked = true;
        u.lockReason = "Necesitás el curso para acceder.";
      }
      if (u.kind === "evaluation" && !hasPurchase) {
        u.locked = true;
        u.lockReason = "Necesitás el curso para acceder.";
      }
      if (blockedFrom) {
        u.locked = true;
        u.lockReason = `Aprobá "${blockingTitle}" para continuar.`;
      }
      if (
        u.kind === "evaluation" &&
        u.isFinal &&
        !allRequiredPassed
      ) {
        u.locked = true;
        u.lockReason =
          "Aprobá todas las evaluaciones obligatorias para habilitar la final.";
      }
    }
    if (
      u.kind === "evaluation" &&
      u.isBlocking &&
      !u.completed &&
      !isAdmin
    ) {
      blockedFrom = true;
      blockingTitle = u.title;
    }
  }

  const stateBySection = new Map(
    flat.filter(u => u.kind === "section").map(u => [u.id, u])
  );
  const stateByEval = new Map(
    flat.filter(u => u.kind === "evaluation").map(u => [u.id, u])
  );

  // vista para el sidebar (capítulos con secciones + evaluaciones)
  const groups: SidebarGroup[] = top.map(t => {
    if (t.kind === "chapter") {
      return {
        type: "chapter",
        id: t.data.id,
        title: t.data.title,
        sections: t.data.sections.map(s => {
          const st = stateBySection.get(s.id)!;
          return {
            id: s.id,
            title: s.title,
            completed: st.completed,
            locked: st.locked,
          };
        }),
      };
    }
    const st = stateByEval.get(t.data.id)!;
    return {
      type: "evaluation",
      id: t.data.id,
      title: t.data.title,
      completed: st.completed,
      attempted: st.attempted,
      locked: st.locked,
      isFinal: t.data.isFinal,
      isRequired: t.data.isRequired,
    };
  });

  return { items: flat, groups, hasPurchase, allRequiredPassed };
};
