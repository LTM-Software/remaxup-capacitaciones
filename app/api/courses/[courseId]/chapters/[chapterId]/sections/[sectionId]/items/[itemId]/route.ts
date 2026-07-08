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
      itemId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();
    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const values = await req.json();
    const item = await db.sectionItem.update({
      where: { id: params.itemId },
      data: { ...values },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.log("[SECTION_ITEM_ID]", error);
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
      itemId: string;
    };
  }
) {
  try {
    const { userId, role } = await getServerSessionFunc();
    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const deleted = await db.sectionItem.delete({
      where: { id: params.itemId },
    });
    return NextResponse.json(deleted);
  } catch (error) {
    console.log("[SECTION_ITEM_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
