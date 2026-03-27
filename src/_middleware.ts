import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || "gap-access-secret"
);

// Routes that don't require authentication
const publicPaths = [
    "/",
    "/programs",
    "/login",
    "/signup",
    "/verify-otp",
    "/forgot-password",
    "/institution-detail",
    "/api/auth/signup",
    "/api/auth/login",
    "/api/auth/send-otp",
    "/api/auth/verify-otp",
    "/api/auth/refresh",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/institutions/public",
];

function isPublicPath(pathname: string): boolean {
    return publicPaths.some((p) => {
        // Agar public path sirf "/" hai, toh exact match check karein
        if (p === "/") return pathname === "/";
        
        // Baqi paths ke liye exact match ya prefix match (e.g., /programs/123)
        return pathname === p || pathname.startsWith(`${p}/`);
    });
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

    // Allow program listing for all users
    if (pathname === "/api/programs" || pathname.startsWith("/api/programs/")) {
        return NextResponse.next();
    }

    // Extract token from Authorization header or cookies
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const cookieToken = request.cookies.get("access_token")?.value;
    const effectiveToken = token || cookieToken;

    // Agar token nahi hai, toh sirf dashboard pages block honge
    if (!effectiveToken) {
        if (pathname.startsWith("/api/")) {
            return NextResponse.next(); 
        }
        const dashboardPaths = ["/student", "/institution", "/admin"];
        if (dashboardPaths.some(p => pathname.startsWith(p))) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        return NextResponse.next();
    }

    try {
        const { payload } = await jwtVerify(effectiveToken, ACCESS_SECRET);
        const role = payload.role as string;
        
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", String(payload.userId));
        requestHeaders.set("x-user-role", role);
        requestHeaders.set("x-user-email", String(payload.email || ""));

        // Role-based access check
        const dashboardPrefixes = ["/student", "/institution", "/admin"];
        const matchedPrefix = dashboardPrefixes.find((p) => pathname.startsWith(p));

        if (matchedPrefix) {
        const requiredRole = matchedPrefix.replace("/", ""); // e.g., "admin"
        if (role !== requiredRole) {
        console.warn(`🚨 Access Denied! Role [${role}] tried to access [${pathname}]`);
        
        // Usey uske apne dashboard ke root par bhej dein
        // Example: Admin student page kholega toh /admin par chala jayega
        const redirectUrl = new URL(`/${role}`, request.url);
        return NextResponse.redirect(redirectUrl);
            }
        }

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    } catch (err) {
        // Session timeout bypass: Agar token expire ho jaye toh redirect nahi karega 
        // balkay request ko simple flow mein janay dega
        return NextResponse.next();
    }
}

export const config = {
    // Ye matcher ab har cheez ko pakray ga siwaye static files ke
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};