import { NextResponse } from "next/server";

import { storageProvider } from "@/services/storage";
import { getServerSessionFunc } from "@/app/api/auth/_components/getSessionFunction";
import { isAdmin } from "@/lib/isAdminCheck";

// Subida genérica a MinIO (imágenes del editor, documentos de secciones).
export async function POST(req: Request) {
  try {
    const { userId, role } = await getServerSessionFunc();

    if (!userId || !isAdmin(role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file", { status: 400 });
    }

    const url = await storageProvider.upload(file);

    return NextResponse.json({ url, name: file.name });
  } catch (error) {
    console.log("[UPLOAD]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
