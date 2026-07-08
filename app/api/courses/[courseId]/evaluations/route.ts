import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Crear evaluación
export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();

    const lastEvaluation = await db.evaluation.findFirst({
      where: { courseId: params.courseId },
      orderBy: { position: "desc" },
    });

    const newPosition = lastEvaluation
      ? lastEvaluation.position + 1
      : 1;

    const evaluation = await db.evaluation.create({
      data: {
        title,
        courseId: params.courseId,
        position: newPosition,
      },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.log("[EVALUATIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
