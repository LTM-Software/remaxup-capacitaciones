import { NextResponse } from "next/server";

import { db } from "@/lib/db";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await getServerSessionFunc();
    const { title } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    // const courseOwner = await db.course.findUnique({
    //   where: {
    //     id: params.courseId,
    //     userId: userId,
    //   },
    // });

    // if (!courseOwner) {
    //   return new NextResponse("Unauthorized", {
    //     status: 401,
    //   });
    // }

    // posición compartida con las evaluaciones (secuencia única del curso)
    const [lastChapter, lastEvaluation] = await Promise.all([
      db.chapter.findFirst({
        where: { courseId: params.courseId },
        orderBy: { position: "desc" },
      }),
      db.evaluation.findFirst({
        where: { courseId: params.courseId },
        orderBy: { position: "desc" },
      }),
    ]);

    const newPosition =
      Math.max(
        lastChapter?.position ?? 0,
        lastEvaluation?.position ?? 0
      ) + 1;

    const chapter = await db.chapter.create({
      data: {
        title,
        courseId: params.courseId,
        position: newPosition,
      },
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse("Internal Error", {
      status: 500,
    });
  }
}
