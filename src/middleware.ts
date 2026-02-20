import { defineMiddleware } from "astro:middleware";

const SECURITY_HEADERS: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' https://dapur.solusigudang.id https://*.solusigudang.id data: blob:; connect-src 'self' https://dapur.solusigudang.id https://*.solusigudang.id; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()"
};

export const onRequest = defineMiddleware(async ({ request, url }, next) => {
    const isApi = url.pathname.startsWith("/api/");

    // Handle API preflight (OPTIONS)
    if (request.method === "OPTIONS" && isApi) {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "https://solusigudang.id",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type"
            }
        });
    }

    const response = await next();

    // Inject Security Headers
    Object.entries(SECURITY_HEADERS).forEach(([name, value]) => response.headers.set(name, value));

    // Inject CORS for API
    if (isApi) {
        response.headers.set("Access-Control-Allow-Origin", "https://solusigudang.id");
    }

    return response;
});
