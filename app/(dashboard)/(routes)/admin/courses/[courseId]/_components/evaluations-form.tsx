"use client";

import * as z from "zod";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, PlusCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Course, Evaluation } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import { EvaluationsList } from "./evaluations-list";

interface EvaluationsFormProps {
  initialData: Course & { evaluations: Evaluation[] };
  courseId: string;
}

const formSchema = z.object({
  title: z.string().min(1),
});

export const EvaluationsForm = ({
  initialData,
  courseId,
}: EvaluationsFormProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const toggleCreating = () => setIsCreating(current => !current);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "" },
  });

  const { isSubmitting, isValid } = form.formState;

  const onSubmit = async (
    values: z.infer<typeof formSchema>
  ) => {
    try {
      await axios.post(
        `/api/courses/${courseId}/evaluations`,
        values
      );
      toast.success("Evaluación creada");
      toggleCreating();
      form.reset();
      router.refresh();
    } catch {
      toast.error("Algo no funcionó correctamente");
    }
  };

  const onReorder = async (
    updateData: { id: string; position: number }[]
  ) => {
    try {
      setIsUpdating(true);
      await axios.put(
        `/api/courses/${courseId}/evaluations/reorder`,
        { list: updateData }
      );
      toast.success("Evaluaciones reorganizadas");
      router.refresh();
    } catch {
      toast.error("Algo no funcionó correctamente");
    } finally {
      setIsUpdating(false);
    }
  };

  const onEdit = (id: string) => {
    router.push(`/admin/courses/${courseId}/evaluations/${id}`);
  };

  return (
    <div className="relative mt-6 border bg-slate-100 rounded-md p-4">
      {isUpdating && (
        <div className="absolute h-full w-full bg-slate-500/20 top-0 right-0 rounded-m flex items-center justify-center">
          <Loader2 className="animate-spin h-6 w-6 text-sky-700" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        Evaluaciones del curso
        <Button onClick={toggleCreating} variant="ghost">
          {isCreating ? (
            <>Cancelar</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Agregar evaluación
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 mt-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={isSubmitting}
                      placeholder="e.j. 'Evaluación final del curso'"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={!isValid || isSubmitting}
              type="submit"
            >
              Crear
            </Button>
          </form>
        </Form>
      )}
      {!isCreating && (
        <div
          className={cn(
            "text-sm mt-2",
            !initialData.evaluations.length &&
              "text-slate-500 italic"
          )}
        >
          {!initialData.evaluations.length &&
            "Sin evaluaciones"}
          <EvaluationsList
            onEdit={onEdit}
            onReorder={onReorder}
            items={initialData.evaluations || []}
          />
        </div>
      )}
      {!isCreating && (
        <p className="text-xs text-muted-foreground mt-4">
          Mueve para reordenar las evaluaciones
        </p>
      )}
    </div>
  );
};
