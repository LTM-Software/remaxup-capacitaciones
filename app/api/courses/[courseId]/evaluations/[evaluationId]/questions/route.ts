import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Crear pregunta
export async function POST(
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

    const { text } = await req.json();

    const lastQuestion = await db.question.findFirst({
      where: { evaluationId: params.evaluationId },
      orderBy: { position: "desc" },
    });

    const newPosition = lastQuestion
      ? lastQuestion.position + 1
      : 1;

    const question = await db.question.create({
      data: {
        text,
        evaluationId: params.evaluationId,
        position: newPosition,
      },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.log("[QUESTIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
