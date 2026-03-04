import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || "gap-access-secret"
);

// Routes that don't require authentication
const publicPaths = [
    "/",
    "/login",
    "/signup",
    "/verify-otp",
    "/institution-detail",
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/send-otp",
    "/api/auth/verify-otp",
    "/api/auth/refresh",
    "/api/institutions/public",
];

// Role-based route prefixes
const roleRoutes: Record<string, string[]> = {
    student: ["/student", "/api/students", "/api/applications", "/api/saved", "/api/programs"],
    institution: ["/institution", "/api/institutions", "/api/billing"],
    admin: ["/admin", "/api/admin"],
};

function isPublicPath(pathname: string): boolean {
    return publicPaths.some(
        (p) => pathname === p || pathname.startsWith(`${p}/`)
    );
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths and static assets
    if (
        isPublicPath(pathname) ||
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Allow program listing for all authenticated users
    if (pathname === "/api/programs" || pathname.startsWith("/api/programs/")) {
        return NextResponse.next();
    }

    // Extract token from Authorization header
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // Also check cookies for page navigation
    const cookieToken = request.cookies.get("access_token")?.value;
    const effectiveToken = token || cookieToken;

    if (!effectiveToken) {
        // For API routes, return 401
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }
        // For pages, redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(effectiveToken, ACCESS_SECRET);
        const role = payload.role as string;

        // Check role-based access for dashboard pages
        const dashboardPrefixes = ["/student", "/institution", "/admin"];
        const matchedPrefix = dashboardPrefixes.find((p) => pathname.startsWith(p));

        if (matchedPrefix) {
            const requiredRole = matchedPrefix.slice(1); // Remove leading "/"
            if (role !== requiredRole) {
                // Redirect to their own dashboard
                return NextResponse.redirect(new URL(`/${role}`, request.url));
            }
        }

        // Add user info to headers for downstream use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", String(payload.userId));
        requestHeaders.set("x-user-role", role);
        requestHeaders.set("x-user-email", String(payload.email || ""));

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    } catch {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
