import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// El usuario envía sus respuestas; se corrige y se guarda el intento.
export async function POST(
  req: Request,
  {
    params,
  }: { params: { courseId: string; evaluationId: string } }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Debe tener el curso comprado (o ser admin para probar)
    const purchase = await db.purchase.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: params.courseId,
        },
      },
    });

    if (!purchase && !isAdmin(role)) {
      return new NextResponse(
        "Necesitás tener el curso para rendir la evaluación",
        { status: 403 }
      );
    }

    const { answers } = await req.json(); // { [questionId]: optionId }

    const evaluation = await db.evaluation.findUnique({
      where: { id: params.evaluationId },
      include: { questions: { include: { options: true } } },
    });

    if (!evaluation) {
      return new NextResponse("Not found", { status: 404 });
    }

    const total = evaluation.questions.length;
    let correctCount = 0;

    const review = evaluation.questions.map(q => {
      const chosenOptionId = answers?.[q.id] ?? null;
      const correctOption = q.options.find(o => o.isCorrect);
      const isCorrect =
        !!chosenOptionId &&
        !!correctOption &&
        chosenOptionId === correctOption.id;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        chosenOptionId,
        correctOptionId: correctOption?.id ?? null,
        isCorrect,
      };
    });

    const score =
      total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = score >= evaluation.passingScore;

    const attempt = await db.evaluationAttempt.create({
      data: {
        userId,
        evaluationId: evaluation.id,
        score,
        passed,
        answers: JSON.stringify(answers ?? {}),
      },
    });

    return NextResponse.json({
      score,
      passed,
      correctCount,
      total,
      passingScore: evaluation.passingScore,
      review,
      attemptId: attempt.id,
    });
  } catch (error) {
    console.log("[EVALUATION_SUBMIT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
