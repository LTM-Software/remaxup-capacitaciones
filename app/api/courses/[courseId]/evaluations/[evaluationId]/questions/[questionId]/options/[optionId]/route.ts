import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Editar opción (texto / marcar correcta). Al marcar una como correcta,
// se desmarcan las demás de la misma pregunta (respuesta única).
export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      evaluationId: string;
      questionId: string;
      optionId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const values = await req.json();

    if (values.isCorrect === true) {
      await db.questionOption.updateMany({
        where: { questionId: params.questionId },
        data: { isCorrect: false },
      });
    }

    const option = await db.questionOption.update({
      where: { id: params.optionId },
      data: { ...values },
    });

    return NextResponse.json(option);
  } catch (error) {
    console.log("[OPTION_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Eliminar opción
export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      evaluationId: string;
      questionId: string;
      optionId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deleted = await db.questionOption.delete({
      where: { id: params.optionId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.log("[OPTION_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
