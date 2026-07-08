import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Publicar evaluación (requiere >=1 pregunta con una opción correcta)
export async function PATCH(
  req: Request,
  {
    params,
  }: { params: { courseId: string; evaluationId: string } }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const evaluation = await db.evaluation.findUnique({
      where: { id: params.evaluationId },
      include: { questions: { include: { options: true } } },
    });

    if (!evaluation) {
      return new NextResponse("Not found", { status: 404 });
    }

    const hasValidQuestions =
      evaluation.questions.length > 0 &&
      evaluation.questions.every(
        q =>
          q.options.length >= 2 &&
          q.options.some(o => o.isCorrect)
      );

    if (!evaluation.title || !hasValidQuestions) {
      return new NextResponse(
        "Cada pregunta necesita al menos 2 opciones y una marcada como correcta",
        { status: 400 }
      );
    }

    const published = await db.evaluation.update({
      where: { id: params.evaluationId },
      data: { isPublished: true },
    });

    return NextResponse.json(published);
  } catch (error) {
    console.log("[EVALUATION_PUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
