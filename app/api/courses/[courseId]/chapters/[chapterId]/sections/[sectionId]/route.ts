import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      chapterId: string;
      sectionId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();
    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const values = await req.json();
    const section = await db.chapterSection.update({
      where: { id: params.sectionId },
      data: { ...values },
    });
    return NextResponse.json(section);
  } catch (error) {
    console.log("[SECTION_ID]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      chapterId: string;
      sectionId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();
    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const deleted = await db.chapterSection.delete({
      where: { id: params.sectionId },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    console.log("[SECTION_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
