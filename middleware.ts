import { authMiddleware, redirectToSignIn } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { FEATURES, isSuperAdmin, isTeacher } from "@/lib/roles";

// Role-based access (see lib/roles.ts):
//  - Signed-out users        → sign-in (except public routes)
//  - /admin/*  (teacher portal) → teachers & super admins only; students go to "/"
//  - /admin/users              → super admins only, and locked until enabled
// API routes additionally enforce roles inside each handler.
export default authMiddleware({
  publicRoutes: [
    '/api/uploadthing',
    '/api/webhook'
  ],
  afterAuth(auth, req) {
    const { pathname } = req.nextUrl;

    if (!auth.userId && !auth.isPublicRoute) {
      if (auth.isApiRoute) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (pathname.startsWith("/admin")) {
      if (!isTeacher(auth.orgRole)) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      if (
        pathname.startsWith("/admin/users") &&
        (!isSuperAdmin(auth.orgRole) || !FEATURES.userManagement)
      ) {
        return NextResponse.redirect(new URL("/admin/courses", req.url));
      }
    }

    return NextResponse.next();
  },
  debug: process.env.NODE_ENV === "development" && process.env.CLERK_DEBUG === "true",
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
