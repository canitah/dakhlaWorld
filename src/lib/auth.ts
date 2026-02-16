import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const BCRYPT_COST = 12;
const ACCESS_SECRET = new TextEncoder().encode(
    process.env.JWT_ACCESS_SECRET || "gap-access-secret"
);
const REFRESH_SECRET = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET || "gap-refresh-secret"
);

// ─── Password Hashing ───────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, BCRYPT_COST);
}

export async function comparePassword(
    plain: string,
    hash: string
): Promise<boolean> {
    return bcrypt.compare(plain, hash);
}

// ─── Token Payloads ─────────────────────────────────────
export interface TokenPayload {
    userId: number;
    role: string;
    email?: string;
}

// ─── JWT Generation ─────────────────────────────────────
export async function generateAccessToken(
    payload: TokenPayload
): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("15m")
        .sign(ACCESS_SECRET);
}

export async function generateRefreshToken(
    payload: TokenPayload
): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(REFRESH_SECRET);
}

// ─── JWT Verification ───────────────────────────────────
export async function verifyAccessToken(
    token: string
): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, ACCESS_SECRET);
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

export async function verifyRefreshToken(
    token: string
): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, REFRESH_SECRET);
        return payload as unknown as TokenPayload;
    } catch {
        return null;
    }
}

// ─── Cookie Helpers (Server Actions / Route Handlers) ───
export async function setRefreshCookie(token: string) {
    const cookieStore = await cookies();
    cookieStore.set("refresh_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    });
}

export async function getRefreshCookie(): Promise<string | undefined> {
    const cookieStore = await cookies();
    return cookieStore.get("refresh_token")?.value;
}

export async function clearRefreshCookie() {
    const cookieStore = await cookies();
    cookieStore.delete("refresh_token");
}

// ─── Extract Token from Authorization Header ────────────
export function extractBearerToken(
    authHeader: string | null
): string | null {
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
}

// ─── Auth Guard (for Route Handlers) ────────────────────
export async function authenticateRequest(
    request: Request,
    allowedRoles?: string[]
): Promise<{ user: TokenPayload } | { error: string; status: number }> {
    const authHeader = request.headers.get("authorization");
    const token = extractBearerToken(authHeader);

    if (!token) {
        return { error: "Authentication required", status: 401 };
    }

    const payload = await verifyAccessToken(token);
    if (!payload) {
        return { error: "Invalid or expired token", status: 401 };
    }

    if (allowedRoles && !allowedRoles.includes(payload.role)) {
        return { error: "Insufficient permissions", status: 403 };
    }

    return { user: payload };
}
