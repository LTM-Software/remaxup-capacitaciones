import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { Banner } from "@/components/banner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { isAdmin } from "@/lib/isAdminCheck";

import { EvaluationQuiz } from "./_components/evaluation-quiz";

const TakeEvaluationPage = async ({
  params,
}: {
  params: { courseId: string; evaluationId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const role = session?.user?.role;

  if (!userId) {
    return redirect("/login");
  }

  const evaluation = await db.evaluation.findUnique({
    where: { id: params.evaluationId },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: {
          options: {
            orderBy: { position: "asc" },
            // NO se incluye isCorrect: no filtrar las respuestas al cliente.
            select: { id: true, text: true },
          },
        },
      },
    },
  });

  if (!evaluation || !evaluation.isPublished) {
    return redirect(`/courses/${params.courseId}`);
  }

  const purchase = await db.purchase.findUnique({
    where: {
      userId_courseId: { userId, courseId: params.courseId },
    },
  });

  const canTake = !!purchase || isAdmin(role);

  const lastAttempt = await db.evaluationAttempt.findFirst({
    where: { userId, evaluationId: evaluation.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      {lastAttempt?.passed && (
        <Banner
          variant="success"
          label={`Ya aprobaste esta evaluación con ${lastAttempt.score}%.`}
        />
      )}
      <div className="p-6 max-w-3xl mx-auto pb-20">
        <h1 className="text-2xl font-semibold">
          {evaluation.title}
        </h1>
        {evaluation.description && (
          <p className="text-sm text-slate-600 mt-2">
            {evaluation.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Nota mínima para aprobar: {evaluation.passingScore}%
        </p>

        <div className="mt-6">
          {!canTake ? (
            <Banner
              variant="warning"
              label="Necesitás tener el curso para rendir esta evaluación."
            />
          ) : evaluation.questions.length === 0 ? (
            <p className="text-sm text-slate-500 italic">
              Esta evaluación todavía no tiene preguntas.
            </p>
          ) : (
            <EvaluationQuiz
              courseId={params.courseId}
              evaluationId={evaluation.id}
              passingScore={evaluation.passingScore}
              questions={evaluation.questions}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TakeEvaluationPage;
