import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Crear sección de capítulo
export async function POST(
  req: Request,
  {
    params,
  }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId, role } = await getServerSessionFunc();
    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title } = await req.json();

    const last = await db.chapterSection.findFirst({
      where: { chapterId: params.chapterId },
      orderBy: { position: "desc" },
    });

    const section = await db.chapterSection.create({
      data: {
        title,
        chapterId: params.chapterId,
        position: (last?.position ?? 0) + 1,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTIONS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
