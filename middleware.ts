import { NextRequest, NextResponse } from "next/server";
// export { default } from "next-auth/middleware"; // forma basica de usar next-auth

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  const isPublicPath = path === "/login";

  const token =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value ||
    "";

  if (token === "") console.log("token: empty? ", token);

  if (isPublicPath && token) {
    return NextResponse.redirect(
      new URL("/dashboard", req.nextUrl)
    );
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/login", req.nextUrl));
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/courses/:path*",
    "/admin/:path*",
    "/documentos/:path*",
    "/links",
    "/search",
    "/login",
  ],
};
