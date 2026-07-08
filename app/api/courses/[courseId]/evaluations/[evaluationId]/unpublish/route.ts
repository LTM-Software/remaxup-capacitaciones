import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Despublicar evaluación
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

    const unpublished = await db.evaluation.update({
      where: { id: params.evaluationId },
      data: { isPublished: false },
    });

    return NextResponse.json(unpublished);
  } catch (error) {
    console.log("[EVALUATION_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
