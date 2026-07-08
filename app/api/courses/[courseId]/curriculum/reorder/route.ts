import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Reordena la secuencia unificada de capítulos + evaluaciones del curso.
// body: { list: [{ type: "chapter" | "evaluation", id, position }] }
export async function PUT(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    for (let item of list) {
      if (item.type === "chapter") {
        await db.chapter.update({
          where: { id: item.id },
          data: { position: item.position },
        });
      } else if (item.type === "evaluation") {
        await db.evaluation.update({
          where: { id: item.id },
          data: { position: item.position },
        });
      }
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[CURRICULUM_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
