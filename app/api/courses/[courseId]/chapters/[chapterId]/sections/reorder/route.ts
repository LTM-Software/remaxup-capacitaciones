import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

export async function PUT(
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

    const { list } = await req.json();
    for (let item of list) {
      await db.chapterSection.update({
        where: { id: item.id },
        data: { position: item.position },
      });
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[SECTIONS_REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
