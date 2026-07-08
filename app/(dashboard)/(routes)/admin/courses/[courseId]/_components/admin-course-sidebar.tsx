"use client";

import axios from "axios";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Settings,
  BookOpen,
  FileText,
  ClipboardCheck,
  Plus,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Node =
  | {
      type: "chapter";
      id: string;
      title: string;
      sections: { id: string; title: string }[];
    }
  | { type: "evaluation"; id: string; title: string };

interface Props {
  courseId: string;
  courseTitle: string;
  structure: Node[];
}

export const AdminCourseSidebar = ({
  courseId,
  courseTitle,
  structure,
}: Props) => {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const base = `/admin/courses/${courseId}`;
  const isActive = (href: string) => pathname === href;

  const addChapter = async () => {
    const title = window.prompt("Título del capítulo:");
    if (!title?.trim()) return;
    try {
      setBusy(true);
      await axios.post(`/api/courses/${courseId}/chapters`, {
        title,
      });
      toast.success("Capítulo creado");
      router.refresh();
    } catch {
      toast.error("No se pudo crear");
    } finally {
      setBusy(false);
    }
  };

  const addEvaluation = async () => {
    const title = window.prompt("Título de la evaluación:");
    if (!title?.trim()) return;
    try {
      setBusy(true);
      await axios.post(`/api/courses/${courseId}/evaluations`, {
        title,
      });
      toast.success("Evaluación creada");
      router.refresh();
    } catch {
      toast.error("No se pudo crear");
    } finally {
      setBusy(false);
    }
  };

  const addSection = async (chapterId: string) => {
    const title = window.prompt("Título de la sección:");
    if (!title?.trim()) return;
    try {
      setBusy(true);
      const { data } = await axios.post(
        `/api/courses/${courseId}/chapters/${chapterId}/sections`,
        { title }
      );
      toast.success("Sección creada");
      router.refresh();
      router.push(`${base}/sections/${data.id}`);
    } catch {
      toast.error("No se pudo crear");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-3">
      <Link
        href={base}
        className={cn(
          "flex items-center gap-x-2 px-2 py-2 rounded-md text-sm font-medium hover:bg-slate-100",
          isActive(base) &&
            "bg-slate-900 text-white hover:bg-slate-900"
        )}
      >
        <Settings className="h-4 w-4" />
        Configuración del curso
      </Link>

      <div className="mt-3 space-y-2">
        {structure.map(node =>
          node.type === "chapter" ? (
            <div key={node.id}>
              <Link
                href={`${base}/chapters/${node.id}`}
                className={cn(
                  "flex items-center gap-x-2 px-2 py-1.5 rounded-md text-sm font-semibold text-slate-700 hover:bg-slate-100",
                  isActive(`${base}/chapters/${node.id}`) &&
                    "bg-slate-100"
                )}
              >
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="line-clamp-1">
                  {node.title}
                </span>
              </Link>
              <div className="ml-3 border-l pl-2 mt-0.5">
                {node.sections.map(s => (
                  <Link
                    key={s.id}
                    href={`${base}/sections/${s.id}`}
                    className={cn(
                      "flex items-center gap-x-2 px-2 py-1.5 rounded-md text-sm text-slate-600 hover:bg-slate-100",
                      isActive(`${base}/sections/${s.id}`) &&
                        "bg-sky-50 text-sky-700 font-medium"
                    )}
                  >
                    <FileText className="h-3.5 w-3.5 shrink-0" />
                    <span className="line-clamp-1">
                      {s.title}
                    </span>
                  </Link>
                ))}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => addSection(node.id)}
                  className="flex items-center gap-x-1 px-2 py-1.5 text-xs text-sky-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Sección
                </button>
              </div>
            </div>
          ) : (
            <Link
              key={node.id}
              href={`${base}/evaluations/${node.id}`}
              className={cn(
                "flex items-center gap-x-2 px-2 py-1.5 rounded-md text-sm font-medium text-purple-700 hover:bg-purple-50",
                isActive(`${base}/evaluations/${node.id}`) &&
                  "bg-purple-100"
              )}
            >
              <ClipboardCheck className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">{node.title}</span>
            </Link>
          )
        )}
      </div>

      <div className="mt-4 flex flex-col gap-y-1.5 border-t pt-3">
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={addChapter}
          className="justify-start"
        >
          <Plus className="h-4 w-4 mr-1" /> Capítulo
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={addEvaluation}
          className="justify-start"
        >
          <Plus className="h-4 w-4 mr-1" /> Evaluación
        </Button>
      </div>
    </div>
  );
};
