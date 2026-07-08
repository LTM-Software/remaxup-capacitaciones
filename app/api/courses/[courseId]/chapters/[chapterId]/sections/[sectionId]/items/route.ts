import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Crear ítem de sección (PAGE o DOCUMENT)
export async function POST(
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

    const { type, title, content, url } = await req.json();

    const last = await db.sectionItem.findFirst({
      where: { sectionId: params.sectionId },
      orderBy: { position: "desc" },
    });

    const item = await db.sectionItem.create({
      data: {
        type: type === "DOCUMENT" ? "DOCUMENT" : "PAGE",
        title: title || "",
        content: content ?? null,
        url: url ?? null,
        sectionId: params.sectionId,
        position: (last?.position ?? 0) + 1,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.log("[SECTION_ITEMS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
