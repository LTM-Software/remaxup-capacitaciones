import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Crear opción de respuesta
export async function POST(
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

    const { text } = await req.json();

    const lastOption = await db.questionOption.findFirst({
      where: { questionId: params.questionId },
      orderBy: { position: "desc" },
    });

    const newPosition = lastOption ? lastOption.position + 1 : 1;

    const option = await db.questionOption.create({
      data: {
        text,
        questionId: params.questionId,
        position: newPosition,
      },
    });

    return NextResponse.json(option);
  } catch (error) {
    console.log("[OPTIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
