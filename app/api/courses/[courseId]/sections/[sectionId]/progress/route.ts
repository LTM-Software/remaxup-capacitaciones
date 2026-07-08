import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";

// Marca/desmarca una sección como completada para el usuario.
export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; sectionId: string } }
) {
  try {
    const { userId } = await getServerSessionFunc();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { isCompleted } = await req.json();

    const progress = await db.sectionProgress.upsert({
      where: {
        userId_sectionId: {
          userId,
          sectionId: params.sectionId,
        },
      },
      update: { isCompleted },
      create: {
        userId,
        sectionId: params.sectionId,
        isCompleted,
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.log("[SECTION_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
