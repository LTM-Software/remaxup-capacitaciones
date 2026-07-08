import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Editar pregunta (texto)
export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      evaluationId: string;
      questionId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();

    const question = await db.question.update({
      where: { id: params.questionId },
      data: { ...values },
    });

    return NextResponse.json(question);
  } catch (error) {
    console.log("[QUESTION_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Eliminar pregunta
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      evaluationId: string;
      questionId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deleted = await db.question.delete({
      where: { id: params.questionId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.log("[QUESTION_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
