import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutDashboard, ListChecks } from "lucide-react";

import { db } from "@/lib/db";
import { IconBadge } from "@/components/icon-badge";
import { Banner } from "@/components/banner";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { EvaluationTitleForm } from "./_components/title-form";
import { EvaluationDescriptionForm } from "./_components/description-form";
import { PassingScoreForm } from "./_components/passing-score-form";
import { EvaluationSettingsForm } from "./_components/settings-form";
import { EvaluationActions } from "./_components/actions";
import { QuestionsForm } from "./_components/questions-form";

const EvaluationIdPage = async ({
  params,
}: {
  params: { courseId: string; evaluationId: string };
}) => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return redirect("/");
  }

  const evaluation = await db.evaluation.findUnique({
    where: { id: params.evaluationId },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: {
          options: { orderBy: { position: "asc" } },
        },
      },
    },
  });

  if (!evaluation) {
    return redirect(`/admin/courses/${params.courseId}`);
  }

  const hasValidQuestions =
    evaluation.questions.length > 0 &&
    evaluation.questions.every(
      q =>
        q.options.length >= 2 && q.options.some(o => o.isCorrect)
    );

  const requiredFields = [evaluation.title, hasValidQuestions];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields})`;
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!evaluation.isPublished && (
        <Banner label="Esta evaluación no está publicada. No va a estar visible para los agentes." />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-full">
            <Link
              href={`/admin/courses/${params.courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a la configuración del curso
            </Link>
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">
                  Configurar evaluación
                </h1>
                <span className="text-sm text-slate-700">
                  Completá los campos {completionText}
                </span>
              </div>
              <EvaluationActions
                disabled={!isComplete}
                courseId={params.courseId}
                evaluationId={params.evaluationId}
                isPublished={evaluation.isPublished}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={LayoutDashboard} />
              <h2 className="text-xl">
                Configuración de la evaluación
              </h2>
            </div>
            <EvaluationTitleForm
              initialData={evaluation}
              courseId={params.courseId}
              evaluationId={params.evaluationId}
            />
            <EvaluationDescriptionForm
              initialData={evaluation}
              courseId={params.courseId}
              evaluationId={params.evaluationId}
            />
            <PassingScoreForm
              initialData={evaluation}
              courseId={params.courseId}
              evaluationId={params.evaluationId}
            />
            <EvaluationSettingsForm
              initialData={evaluation}
              courseId={params.courseId}
              evaluationId={params.evaluationId}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">Preguntas y respuestas</h2>
            </div>
            <QuestionsForm
              courseId={params.courseId}
              evaluationId={params.evaluationId}
              questions={evaluation.questions}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default EvaluationIdPage;
