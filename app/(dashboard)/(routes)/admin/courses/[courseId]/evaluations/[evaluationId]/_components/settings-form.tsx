"use client";

import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Checkbox } from "@/components/ui/checkbox";

interface EvaluationSettingsFormProps {
  courseId: string;
  evaluationId: string;
  initialData: {
    isRequired: boolean;
    isBlocking: boolean;
    isFinal: boolean;
  };
}

export const EvaluationSettingsForm = ({
  courseId,
  evaluationId,
  initialData,
}: EvaluationSettingsFormProps) => {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const base = `/api/courses/${courseId}/evaluations/${evaluationId}`;

  const toggle = async (field: string, value: boolean) => {
    try {
      setSaving(true);
      await axios.patch(base, { [field]: value });
      router.refresh();
    } catch {
      toast.error("No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const rows = [
    {
      field: "isRequired",
      label: "Obligatoria",
      desc: "Hay que aprobarla para habilitar la evaluación final del curso.",
      value: initialData.isRequired,
    },
    {
      field: "isBlocking",
      label: "Bloqueante",
      desc: "No deja acceder a los ítems siguientes del curso hasta aprobarla.",
      value: initialData.isBlocking,
    },
    {
      field: "isFinal",
      label: "Evaluación final",
      desc: "Se habilita sólo cuando se aprobaron todas las evaluaciones obligatorias.",
      value: initialData.isFinal,
    },
  ];

  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium mb-3">Configuración</div>
      <div className="space-y-3">
        {rows.map(r => (
          <label
            key={r.field}
            className="flex items-start gap-x-3 cursor-pointer"
          >
            <Checkbox
              checked={r.value}
              disabled={saving}
              onCheckedChange={c => toggle(r.field, !!c)}
              className="mt-1"
            />
            <div>
              <p className="text-sm font-medium">{r.label}</p>
              <p className="text-xs text-muted-foreground">
                {r.desc}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
