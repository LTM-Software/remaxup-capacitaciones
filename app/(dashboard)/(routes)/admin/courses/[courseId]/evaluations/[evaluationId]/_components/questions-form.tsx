"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Question, QuestionOption } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { QuestionCard } from "./question-card";

interface QuestionsFormProps {
  courseId: string;
  evaluationId: string;
  questions: (Question & { options: QuestionOption[] })[];
}

export const QuestionsForm = ({
  courseId,
  evaluationId,
  questions,
}: QuestionsFormProps) => {
  const router = useRouter();
  const [text, setText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const addQuestion = async () => {
    if (!text.trim()) return;
    try {
      setIsCreating(true);
      await axios.post(
        `/api/courses/${courseId}/evaluations/${evaluationId}/questions`,
        { text }
      );
      setText("");
      toast.success("Pregunta agregada");
      router.refresh();
    } catch {
      toast.error("No se pudo agregar la pregunta");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium mb-4">
        Preguntas ({questions.length})
      </div>

      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          index={index}
          courseId={courseId}
          evaluationId={evaluationId}
          question={question}
        />
      ))}

      {questions.length === 0 && (
        <p className="text-sm text-slate-500 italic mb-4">
          Todavía no hay preguntas.
        </p>
      )}

      <div className="flex items-center gap-x-2 mt-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              addQuestion();
            }
          }}
          placeholder="Nueva pregunta"
          disabled={isCreating}
        />
        <Button
          onClick={addQuestion}
          disabled={isCreating || !text.trim()}
          className="shrink-0"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Agregar pregunta
        </Button>
      </div>
    </div>
  );
};
