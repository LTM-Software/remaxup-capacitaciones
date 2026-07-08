"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Circle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Option {
  id: string;
  text: string;
}
interface Question {
  id: string;
  text: string;
  options: Option[];
}
interface ReviewItem {
  questionId: string;
  chosenOptionId: string | null;
  correctOptionId: string | null;
  isCorrect: boolean;
}
interface Result {
  score: number;
  passed: boolean;
  correctCount: number;
  total: number;
  passingScore: number;
  review: ReviewItem[];
}

interface EvaluationQuizProps {
  courseId: string;
  evaluationId: string;
  passingScore: number;
  questions: Question[];
}

export const EvaluationQuiz = ({
  courseId,
  evaluationId,
  passingScore,
  questions,
}: EvaluationQuizProps) => {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(
    {}
  );
  const [result, setResult] = useState<Result | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allAnswered =
    questions.length > 0 &&
    questions.every(q => answers[q.id]);

  const reviewFor = (questionId: string) =>
    result?.review.find(r => r.questionId === questionId);

  const submit = async () => {
    try {
      setIsSubmitting(true);
      const { data } = await axios.post(
        `/api/courses/${courseId}/evaluations/${evaluationId}/submit`,
        { answers }
      );
      setResult(data);
      router.refresh();
    } catch (e: any) {
      toast.error(
        e?.response?.data || "No se pudo enviar la evaluación"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const retry = () => {
    setResult(null);
    setAnswers({});
  };

  return (
    <div className="space-y-6">
      {result && (
        <div
          className={cn(
            "rounded-md border p-4 flex items-center justify-between",
            result.passed
              ? "border-emerald-300 bg-emerald-50 text-emerald-800"
              : "border-red-300 bg-red-50 text-red-800"
          )}
        >
          <div>
            <p className="text-lg font-semibold">
              {result.passed
                ? "¡Aprobaste! 🎉"
                : "No alcanzaste la nota mínima"}
            </p>
            <p className="text-sm">
              Puntaje: {result.score}% ({result.correctCount}/
              {result.total} correctas) — mínimo{" "}
              {result.passingScore}%
            </p>
          </div>
          {!result.passed && (
            <Button onClick={retry} variant="outline">
              Reintentar
            </Button>
          )}
        </div>
      )}

      {questions.map((question, qIndex) => {
        const review = reviewFor(question.id);
        return (
          <div
            key={question.id}
            className="rounded-md border bg-white p-4"
          >
            <p className="font-medium mb-3">
              {qIndex + 1}. {question.text}
            </p>
            <div className="space-y-2">
              {question.options.map(option => {
                const selected =
                  answers[question.id] === option.id;
                const isCorrectAnswer =
                  review?.correctOptionId === option.id;
                const isWrongChosen =
                  review?.chosenOptionId === option.id &&
                  !review?.isCorrect;

                return (
                  <button
                    key={option.id}
                    type="button"
                    disabled={!!result}
                    onClick={() =>
                      setAnswers(prev => ({
                        ...prev,
                        [question.id]: option.id,
                      }))
                    }
                    className={cn(
                      "w-full text-left flex items-center gap-x-2 rounded-md border px-3 py-2 transition",
                      !result &&
                        selected &&
                        "border-sky-400 bg-sky-50",
                      !result && "hover:bg-slate-50",
                      result &&
                        isCorrectAnswer &&
                        "border-emerald-400 bg-emerald-50",
                      result &&
                        isWrongChosen &&
                        "border-red-400 bg-red-50"
                    )}
                  >
                    {result ? (
                      isCorrectAnswer ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                      ) : isWrongChosen ? (
                        <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                      )
                    ) : (
                      <Circle
                        className={cn(
                          "h-5 w-5 shrink-0",
                          selected
                            ? "text-sky-600 fill-sky-600"
                            : "text-slate-300"
                        )}
                      />
                    )}
                    <span>{option.text}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {!result && (
        <Button
          onClick={submit}
          disabled={!allAnswered || isSubmitting}
          size="lg"
        >
          {isSubmitting ? "Enviando..." : "Enviar evaluación"}
        </Button>
      )}
      {!result && !allAnswered && (
        <p className="text-sm text-muted-foreground">
          Respondé todas las preguntas para poder enviar.
        </p>
      )}
    </div>
  );
};
