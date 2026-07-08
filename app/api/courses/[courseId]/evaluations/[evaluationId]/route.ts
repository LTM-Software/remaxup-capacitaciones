import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Editar evaluación (title, description, passingScore)
export async function PATCH(
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

    const values = await req.json();

    const evaluation = await db.evaluation.update({
      where: { id: params.evaluationId },
      data: { ...values },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.log("[EVALUATION_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Eliminar evaluación
export async function DELETE(
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

    const deleted = await db.evaluation.delete({
      where: { id: params.evaluationId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.log("[EVALUATION_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
